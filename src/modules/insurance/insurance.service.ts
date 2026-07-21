import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceCompany } from './entities/insurance-company.entity';
import { InsuranceBareme } from './entities/insurance-bareme.entity';
import {
  CreateInsuranceBaremeDto,
  CreateInsuranceCompanyDto,
  UpdateInsuranceBaremeDto,
  UpdateInsuranceCompanyDto,
} from './dto/insurance.dto';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsuranceCompany)
    private readonly companyRepo: Repository<InsuranceCompany>,
    @InjectRepository(InsuranceBareme)
    private readonly baremeRepo: Repository<InsuranceBareme>,
  ) {}

  async createCompany(
    data: CreateInsuranceCompanyDto,
  ): Promise<InsuranceCompany> {
    if (!data.name?.trim()) {
      throw new BadRequestException('name is required');
    }

    const company = this.companyRepo.create({
      name: data.name.trim(),
      rut: data.rut ?? null,
      is_active: data.is_active ?? true,
    });

    return this.companyRepo.save(company);
  }

  async findAllCompanies(activeOnly = false): Promise<InsuranceCompany[]> {
    const where = activeOnly ? { is_active: true } : {};
    return this.companyRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findCompanyById(id: string): Promise<InsuranceCompany> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Insurance company not found');
    }
    return company;
  }

  async updateCompany(
    id: string,
    data: UpdateInsuranceCompanyDto,
  ): Promise<InsuranceCompany> {
    const company = await this.findCompanyById(id);
    Object.assign(company, data);
    return this.companyRepo.save(company);
  }

  async createBareme(
    tenantId: string,
    data: CreateInsuranceBaremeDto,
  ): Promise<InsuranceBareme> {
    await this.findCompanyById(data.insurance_company_id);

    const existing = await this.baremeRepo.findOne({
      where: {
        tenant_id: tenantId,
        insurance_company_id: data.insurance_company_id,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Ya existe un baremo para esta aseguradora en el taller',
      );
    }

    const bareme = this.baremeRepo.create({
      tenant_id: tenantId,
      insurance_company_id: data.insurance_company_id,
      hour_cost_chapa: Number(data.hour_cost_chapa),
      hour_cost_mecanica: Number(data.hour_cost_mecanica),
      hour_cost_pintura:
        data.hour_cost_pintura != null ? Number(data.hour_cost_pintura) : null,
    });

    return this.baremeRepo.save(bareme);
  }

  async findBaremes(tenantId: string): Promise<InsuranceBareme[]> {
    return this.baremeRepo.find({
      where: { tenant_id: tenantId },
      relations: ['insuranceCompany'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBaremeForCompany(
    tenantId: string,
    insuranceCompanyId: string,
  ): Promise<InsuranceBareme> {
    const bareme = await this.baremeRepo.findOne({
      where: {
        tenant_id: tenantId,
        insurance_company_id: insuranceCompanyId,
      },
      relations: ['insuranceCompany'],
    });

    if (!bareme) {
      throw new NotFoundException(
        'No hay baremo configurado para esta aseguradora en el taller',
      );
    }

    return bareme;
  }

  async updateBareme(
    tenantId: string,
    id: string,
    data: UpdateInsuranceBaremeDto,
  ): Promise<InsuranceBareme> {
    const bareme = await this.baremeRepo.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['insuranceCompany'],
    });
    if (!bareme) {
      throw new NotFoundException('Baremo not found');
    }

    if (data.hour_cost_chapa != null) {
      bareme.hour_cost_chapa = Number(data.hour_cost_chapa);
    }
    if (data.hour_cost_mecanica != null) {
      bareme.hour_cost_mecanica = Number(data.hour_cost_mecanica);
    }
    if (data.hour_cost_pintura !== undefined) {
      bareme.hour_cost_pintura =
        data.hour_cost_pintura != null ? Number(data.hour_cost_pintura) : null;
    }

    return this.baremeRepo.save(bareme);
  }

  async removeBareme(
    tenantId: string,
    id: string,
  ): Promise<{ message: string }> {
    const bareme = await this.baremeRepo.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!bareme) {
      throw new NotFoundException('Baremo not found');
    }
    await this.baremeRepo.remove(bareme);
    return { message: 'Baremo eliminado correctamente' };
  }
}
