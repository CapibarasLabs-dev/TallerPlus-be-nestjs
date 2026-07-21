import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DamageReport,
  DamageReportStatus,
} from './entities/damage-report.entity';
import {
  DamageReportItem,
  DamageReportOperationType,
} from './entities/damage-report-item.entity';
import { InsuranceBareme } from '../insurance/entities/insurance-bareme.entity';
import { InsuranceService } from '../insurance/insurance.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { CompaniesService } from '../companies/companies.service';
import {
  AddDamageReportItemsDto,
  CreateDamageReportDto,
  CreateDamageReportItemDto,
  UpdateDamageReportDto,
  UpdateDamageReportStatusDto,
} from './dto/damage-report.dto';

interface DamageReportTotals {
  subtotal_repuestos: number;
  subtotal_chapa: number;
  subtotal_mecanica: number;
  subtotal_pintura: number;
  subtotal: number;
  tax_amount: number;
  total: number;
}

const VALID_STATUS_TRANSITIONS: Record<
  DamageReportStatus,
  DamageReportStatus[]
> = {
  [DamageReportStatus.PENDING_PERITAJE]: [
    DamageReportStatus.APPROVED,
    DamageReportStatus.REJECTED,
  ],
  [DamageReportStatus.APPROVED]: [DamageReportStatus.IN_REPAIR],
  [DamageReportStatus.REJECTED]: [DamageReportStatus.PENDING_PERITAJE],
  [DamageReportStatus.IN_REPAIR]: [DamageReportStatus.DELIVERED],
  [DamageReportStatus.DELIVERED]: [],
};

@Injectable()
export class DamageReportsService {
  constructor(
    @InjectRepository(DamageReport)
    private readonly reportRepo: Repository<DamageReport>,
    @InjectRepository(DamageReportItem)
    private readonly itemRepo: Repository<DamageReportItem>,
    private readonly insuranceService: InsuranceService,
    private readonly vehiclesService: VehiclesService,
    private readonly companiesService: CompaniesService,
  ) {}

  private assertValidTaxPercent(taxPercent: number): void {
    if (Number.isNaN(taxPercent) || taxPercent < 0) {
      throw new BadRequestException(
        'tax_percent must be a number greater than or equal to 0',
      );
    }
  }

  private calculateItemCost(
    item: Pick<
      DamageReportItem,
      'operation_type' | 'hours_suggested' | 'unit_price'
    >,
    bareme: InsuranceBareme,
  ): number {
    const hours = Number(item.hours_suggested ?? 0);
    const unitPrice = Number(item.unit_price ?? 0);

    switch (item.operation_type) {
      case DamageReportOperationType.REPUESTO:
        return unitPrice;

      case DamageReportOperationType.CHAPA:
      case DamageReportOperationType.DESMONTAJE_MONTAJE:
        return hours * Number(bareme.hour_cost_chapa);

      case DamageReportOperationType.MECANICA:
        return hours * Number(bareme.hour_cost_mecanica);

      case DamageReportOperationType.PINTURA:
        // Fixed piece price if unit_price > 0; else hours * bareme.
        if (unitPrice > 0) {
          return unitPrice;
        }
        if (bareme.hour_cost_pintura == null) {
          return 0;
        }
        return hours * Number(bareme.hour_cost_pintura);

      default:
        return 0;
    }
  }

  private calculateTotals(
    items: DamageReportItem[],
    bareme: InsuranceBareme,
    taxPercent: number,
  ): DamageReportTotals {
    let subtotal_repuestos = 0;
    let subtotal_chapa = 0;
    let subtotal_mecanica = 0;
    let subtotal_pintura = 0;

    for (const item of items) {
      const cost = this.calculateItemCost(item, bareme);

      switch (item.operation_type) {
        case DamageReportOperationType.REPUESTO:
          subtotal_repuestos += cost;
          break;
        case DamageReportOperationType.CHAPA:
        case DamageReportOperationType.DESMONTAJE_MONTAJE:
          subtotal_chapa += cost;
          break;
        case DamageReportOperationType.MECANICA:
          subtotal_mecanica += cost;
          break;
        case DamageReportOperationType.PINTURA:
          subtotal_pintura += cost;
          break;
      }
    }

    const subtotal =
      subtotal_repuestos +
      subtotal_chapa +
      subtotal_mecanica +
      subtotal_pintura;
    const tax_amount = subtotal * (taxPercent / 100);
    const total = subtotal + tax_amount;

    return {
      subtotal_repuestos: this.round2(subtotal_repuestos),
      subtotal_chapa: this.round2(subtotal_chapa),
      subtotal_mecanica: this.round2(subtotal_mecanica),
      subtotal_pintura: this.round2(subtotal_pintura),
      subtotal: this.round2(subtotal),
      tax_amount: this.round2(tax_amount),
      total: this.round2(total),
    };
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private buildItem(
    damageReportId: string,
    data: CreateDamageReportItemDto,
  ): DamageReportItem {
    if (!data.description?.trim()) {
      throw new BadRequestException('Cada ítem requiere description');
    }
    if (!data.operation_type) {
      throw new BadRequestException('Cada ítem requiere operation_type');
    }
    if (
      !Object.values(DamageReportOperationType).includes(data.operation_type)
    ) {
      throw new BadRequestException(
        `operation_type inválido: ${data.operation_type}`,
      );
    }

    return this.itemRepo.create({
      damage_report_id: damageReportId,
      description: data.description.trim(),
      operation_type: data.operation_type,
      hours_suggested: Number(data.hours_suggested ?? 0),
      unit_price: Number(data.unit_price ?? 0),
      supplier_name: data.supplier_name ?? null,
      item_photos: data.item_photos ?? [],
    });
  }

  private async applyTotals(
    report: DamageReport,
    bareme: InsuranceBareme,
  ): Promise<void> {
    const items = await this.itemRepo.find({
      where: { damage_report_id: report.id },
    });
    const totals = this.calculateTotals(items, bareme, report.tax_percent);
    await this.reportRepo.update(report.id, totals);
  }

  async create(
    tenantId: string,
    data: CreateDamageReportDto,
  ): Promise<DamageReport> {
    if (!data.vehicle_id) {
      throw new BadRequestException('vehicle_id is required');
    }
    if (!data.insurance_company_id) {
      throw new BadRequestException('insurance_company_id is required');
    }
    if (!data.siniestro_number?.trim()) {
      throw new BadRequestException('siniestro_number is required');
    }

    await this.vehiclesService.findById(tenantId, data.vehicle_id);
    await this.insuranceService.findCompanyById(data.insurance_company_id);
    const bareme = await this.insuranceService.findBaremeForCompany(
      tenantId,
      data.insurance_company_id,
    );

    const company = await this.companiesService.findOne(tenantId);
    const taxPercent =
      data.tax_percent != null
        ? Number(data.tax_percent)
        : Number(company.default_tax_percent);
    this.assertValidTaxPercent(taxPercent);

    const report = this.reportRepo.create({
      tenant_id: tenantId,
      vehicle_id: data.vehicle_id,
      insurance_company_id: data.insurance_company_id,
      siniestro_number: data.siniestro_number.trim(),
      status: DamageReportStatus.PENDING_PERITAJE,
      general_photos: data.general_photos ?? [],
      observations: data.observations ?? null,
      tax_percent: taxPercent,
      subtotal_repuestos: 0,
      subtotal_chapa: 0,
      subtotal_mecanica: 0,
      subtotal_pintura: 0,
      subtotal: 0,
      tax_amount: 0,
      total: 0,
    });

    const saved = await this.reportRepo.save(report);

    if (Array.isArray(data.items) && data.items.length > 0) {
      const items = data.items.map((i) => this.buildItem(saved.id, i));
      await this.itemRepo.save(items);
      await this.applyTotals(saved, bareme);
    }

    return this.findOne(tenantId, saved.id);
  }

  async addItems(
    tenantId: string,
    id: string,
    dto: AddDamageReportItemsDto,
  ): Promise<DamageReport> {
    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('items must be a non-empty array');
    }

    const report = await this.reportRepo.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!report) {
      throw new NotFoundException('Damage report not found');
    }

    const bareme = await this.insuranceService.findBaremeForCompany(
      tenantId,
      report.insurance_company_id,
    );

    const items = dto.items.map((i) => this.buildItem(report.id, i));
    await this.itemRepo.save(items);
    await this.applyTotals(report, bareme);

    return this.findOne(tenantId, id);
  }

  async findAll(tenantId: string): Promise<DamageReport[]> {
    return this.reportRepo.find({
      where: { tenant_id: tenantId },
      relations: ['vehicle', 'insuranceCompany'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByVehicle(
    tenantId: string,
    vehicleId: string,
  ): Promise<DamageReport[]> {
    return this.reportRepo.find({
      where: { tenant_id: tenantId, vehicle_id: vehicleId },
      relations: ['insuranceCompany', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<DamageReport> {
    const report = await this.reportRepo.findOne({
      where: { id, tenant_id: tenantId },
      relations: [
        'vehicle',
        'vehicle.customer',
        'insuranceCompany',
        'items',
      ],
    });

    if (!report) {
      throw new NotFoundException('Damage report not found');
    }

    return report;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateDamageReportDto,
  ): Promise<DamageReport> {
    const report = await this.reportRepo.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!report) {
      throw new NotFoundException('Damage report not found');
    }

    const taxChanged =
      dto.tax_percent != null &&
      Number(dto.tax_percent) !== Number(report.tax_percent);

    if (dto.tax_percent != null) {
      const taxPercent = Number(dto.tax_percent);
      this.assertValidTaxPercent(taxPercent);
      report.tax_percent = taxPercent;
    }
    if (dto.observations !== undefined) {
      report.observations = dto.observations;
    }
    if (dto.general_photos !== undefined) {
      report.general_photos = dto.general_photos;
    }
    if (dto.siniestro_number != null) {
      if (!dto.siniestro_number.trim()) {
        throw new BadRequestException('siniestro_number cannot be empty');
      }
      report.siniestro_number = dto.siniestro_number.trim();
    }

    await this.reportRepo.save(report);

    if (taxChanged) {
      const bareme = await this.insuranceService.findBaremeForCompany(
        tenantId,
        report.insurance_company_id,
      );
      await this.applyTotals(report, bareme);
    }

    return this.findOne(tenantId, id);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateDamageReportStatusDto,
  ): Promise<DamageReport> {
    const report = await this.findOne(tenantId, id);
    const newStatus = dto.status;

    if (!Object.values(DamageReportStatus).includes(newStatus)) {
      throw new BadRequestException(`status inválido: ${newStatus}`);
    }

    const allowed = VALID_STATUS_TRANSITIONS[report.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transición inválida: '${report.status}' → '${newStatus}'. ` +
          `Permitidas: ${allowed.join(', ') || 'ninguna (estado terminal)'}`,
      );
    }

    report.status = newStatus;
    await this.reportRepo.save(report);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<{ message: string }> {
    const report = await this.findOne(tenantId, id);
    await this.itemRepo.delete({ damage_report_id: id });
    await this.reportRepo.remove(report);
    return { message: `Reporte de siniestro ${report.siniestro_number} eliminado` };
  }
}
