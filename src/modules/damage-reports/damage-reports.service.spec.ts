import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DamageReportsService } from './damage-reports.service';
import {
  DamageReport,
  DamageReportStatus,
} from './entities/damage-report.entity';
import {
  DamageReportItem,
  DamageReportOperationType,
} from './entities/damage-report-item.entity';
import { InsuranceService } from '../insurance/insurance.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { CompaniesService } from '../companies/companies.service';
import { InsuranceBareme } from '../insurance/entities/insurance-bareme.entity';

describe('DamageReportsService', () => {
  let service: DamageReportsService;

  const reportRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const itemRepo = {
    create: jest.fn((x) => x),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };
  const insuranceService = {
    findCompanyById: jest.fn(),
    findBaremeForCompany: jest.fn(),
  };
  const vehiclesService = {
    findById: jest.fn(),
  };
  const companiesService = {
    findOne: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const bareme = {
    id: 'b-1',
    tenant_id: tenantId,
    insurance_company_id: 'ic-1',
    hour_cost_chapa: 100,
    hour_cost_mecanica: 120,
    hour_cost_pintura: 80,
  } as InsuranceBareme;

  const baseReport = {
    id: 'dr-1',
    tenant_id: tenantId,
    vehicle_id: 'v-1',
    insurance_company_id: 'ic-1',
    siniestro_number: 'SIN-001',
    status: DamageReportStatus.PENDING_PERITAJE,
    tax_percent: 22,
    general_photos: [],
    observations: null,
  } as DamageReport;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DamageReportsService,
        { provide: getRepositoryToken(DamageReport), useValue: reportRepo },
        {
          provide: getRepositoryToken(DamageReportItem),
          useValue: itemRepo,
        },
        { provide: InsuranceService, useValue: insuranceService },
        { provide: VehiclesService, useValue: vehiclesService },
        { provide: CompaniesService, useValue: companiesService },
      ],
    }).compile();

    service = module.get(DamageReportsService);
  });

  describe('create', () => {
    it('throws when vehicle_id missing', async () => {
      await expect(
        service.create(tenantId, {
          vehicle_id: '',
          insurance_company_id: 'ic-1',
          siniestro_number: 'SIN-001',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when insurance_company_id missing', async () => {
      await expect(
        service.create(tenantId, {
          vehicle_id: 'v-1',
          insurance_company_id: '',
          siniestro_number: 'SIN-001',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when siniestro_number empty', async () => {
      await expect(
        service.create(tenantId, {
          vehicle_id: 'v-1',
          insurance_company_id: 'ic-1',
          siniestro_number: '  ',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates with company tax and calculates totals from items', async () => {
      vehiclesService.findById.mockResolvedValue({ id: 'v-1' });
      insuranceService.findCompanyById.mockResolvedValue({ id: 'ic-1' });
      insuranceService.findBaremeForCompany.mockResolvedValue(bareme);
      companiesService.findOne.mockResolvedValue({
        id: tenantId,
        default_tax_percent: 22,
      });

      const saved = { ...baseReport, tax_percent: 22 };
      reportRepo.create.mockReturnValue(saved);
      reportRepo.save.mockResolvedValue(saved);
      itemRepo.save.mockImplementation(async (items) => items);
      itemRepo.find.mockResolvedValue([
        {
          operation_type: DamageReportOperationType.REPUESTO,
          hours_suggested: 0,
          unit_price: 500,
        },
        {
          operation_type: DamageReportOperationType.CHAPA,
          hours_suggested: 2,
          unit_price: 0,
        },
        {
          operation_type: DamageReportOperationType.DESMONTAJE_MONTAJE,
          hours_suggested: 1,
          unit_price: 0,
        },
        {
          operation_type: DamageReportOperationType.MECANICA,
          hours_suggested: 1.5,
          unit_price: 0,
        },
        {
          operation_type: DamageReportOperationType.PINTURA,
          hours_suggested: 2,
          unit_price: 0,
        },
      ]);
      reportRepo.update.mockResolvedValue(undefined);
      reportRepo.findOne.mockResolvedValue({
        ...saved,
        items: [],
      });

      const result = await service.create(tenantId, {
        vehicle_id: 'v-1',
        insurance_company_id: 'ic-1',
        siniestro_number: 'SIN-001',
        items: [
          {
            description: 'Farol',
            operation_type: DamageReportOperationType.REPUESTO,
            unit_price: 500,
          },
          {
            description: 'Puerta',
            operation_type: DamageReportOperationType.CHAPA,
            hours_suggested: 2,
          },
          {
            description: 'Desmonte',
            operation_type: DamageReportOperationType.DESMONTAJE_MONTAJE,
            hours_suggested: 1,
          },
          {
            description: 'Motor',
            operation_type: DamageReportOperationType.MECANICA,
            hours_suggested: 1.5,
          },
          {
            description: 'Pintura',
            operation_type: DamageReportOperationType.PINTURA,
            hours_suggested: 2,
          },
        ],
      });

      // 500 + (2*100) + (1*100) + (1.5*120) + (2*80) = 500+200+100+180+160 = 1140
      // tax 22% = 250.8, total = 1390.8
      expect(reportRepo.update).toHaveBeenCalledWith('dr-1', {
        subtotal_repuestos: 500,
        subtotal_chapa: 300,
        subtotal_mecanica: 180,
        subtotal_pintura: 160,
        subtotal: 1140,
        tax_amount: 250.8,
        total: 1390.8,
      });
      expect(result).toBeDefined();
    });

    it('uses tax_percent override and pintura unit_price', async () => {
      vehiclesService.findById.mockResolvedValue({ id: 'v-1' });
      insuranceService.findCompanyById.mockResolvedValue({ id: 'ic-1' });
      insuranceService.findBaremeForCompany.mockResolvedValue(bareme);
      companiesService.findOne.mockResolvedValue({
        id: tenantId,
        default_tax_percent: 22,
      });

      const saved = { ...baseReport, id: 'dr-2', tax_percent: 10 };
      reportRepo.create.mockReturnValue(saved);
      reportRepo.save.mockResolvedValue(saved);
      itemRepo.save.mockImplementation(async (items) => items);
      itemRepo.find.mockResolvedValue([
        {
          operation_type: DamageReportOperationType.PINTURA,
          hours_suggested: 10,
          unit_price: 350,
        },
      ]);
      reportRepo.update.mockResolvedValue(undefined);
      reportRepo.findOne.mockResolvedValue(saved);

      await service.create(tenantId, {
        vehicle_id: 'v-1',
        insurance_company_id: 'ic-1',
        siniestro_number: 'SIN-002',
        tax_percent: 10,
        items: [
          {
            description: 'Capó',
            operation_type: DamageReportOperationType.PINTURA,
            hours_suggested: 10,
            unit_price: 350,
          },
        ],
      });

      expect(reportRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tax_percent: 10 }),
      );
      expect(reportRepo.update).toHaveBeenCalledWith('dr-2', {
        subtotal_repuestos: 0,
        subtotal_chapa: 0,
        subtotal_mecanica: 0,
        subtotal_pintura: 350,
        subtotal: 350,
        tax_amount: 35,
        total: 385,
      });
    });
  });

  describe('addItems', () => {
    it('throws on empty items', async () => {
      await expect(
        service.addItems(tenantId, 'dr-1', { items: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when report missing', async () => {
      reportRepo.findOne.mockResolvedValue(null);
      await expect(
        service.addItems(tenantId, 'dr-1', {
          items: [
            {
              description: 'X',
              operation_type: DamageReportOperationType.REPUESTO,
              unit_price: 10,
            },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('saves items and recalculates', async () => {
      reportRepo.findOne
        .mockResolvedValueOnce(baseReport)
        .mockResolvedValueOnce({ ...baseReport, items: [] });
      insuranceService.findBaremeForCompany.mockResolvedValue(bareme);
      itemRepo.save.mockResolvedValue([]);
      itemRepo.find.mockResolvedValue([
        {
          operation_type: DamageReportOperationType.REPUESTO,
          hours_suggested: 0,
          unit_price: 100,
        },
      ]);
      reportRepo.update.mockResolvedValue(undefined);

      await service.addItems(tenantId, 'dr-1', {
        items: [
          {
            description: 'Pieza',
            operation_type: DamageReportOperationType.REPUESTO,
            unit_price: 100,
          },
        ],
      });

      expect(itemRepo.save).toHaveBeenCalled();
      expect(reportRepo.update).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('scopes by tenant and throws NotFound', async () => {
      reportRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'dr-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(reportRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dr-1', tenant_id: tenantId },
        }),
      );
    });
  });

  describe('update', () => {
    it('throws on empty siniestro_number', async () => {
      reportRepo.findOne.mockResolvedValue({ ...baseReport });
      await expect(
        service.update(tenantId, 'dr-1', { siniestro_number: '  ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('recalculates when tax_percent changes', async () => {
      reportRepo.findOne
        .mockResolvedValueOnce({ ...baseReport })
        .mockResolvedValueOnce({ ...baseReport, tax_percent: 10 });
      reportRepo.save.mockImplementation(async (r) => r);
      insuranceService.findBaremeForCompany.mockResolvedValue(bareme);
      itemRepo.find.mockResolvedValue([
        {
          operation_type: DamageReportOperationType.REPUESTO,
          hours_suggested: 0,
          unit_price: 100,
        },
      ]);
      reportRepo.update.mockResolvedValue(undefined);

      await service.update(tenantId, 'dr-1', { tax_percent: 10 });

      expect(insuranceService.findBaremeForCompany).toHaveBeenCalled();
      expect(reportRepo.update).toHaveBeenCalledWith('dr-1', {
        subtotal_repuestos: 100,
        subtotal_chapa: 0,
        subtotal_mecanica: 0,
        subtotal_pintura: 0,
        subtotal: 100,
        tax_amount: 10,
        total: 110,
      });
    });
  });

  describe('updateStatus', () => {
    it('allows PENDING_PERITAJE → APPROVED', async () => {
      reportRepo.findOne
        .mockResolvedValueOnce({ ...baseReport })
        .mockResolvedValueOnce({
          ...baseReport,
          status: DamageReportStatus.APPROVED,
        });
      reportRepo.save.mockImplementation(async (r) => r);

      const result = await service.updateStatus(tenantId, 'dr-1', {
        status: DamageReportStatus.APPROVED,
      });
      expect(result.status).toBe(DamageReportStatus.APPROVED);
    });

    it('rejects invalid transition', async () => {
      reportRepo.findOne.mockResolvedValue({ ...baseReport });
      await expect(
        service.updateStatus(tenantId, 'dr-1', {
          status: DamageReportStatus.DELIVERED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects transition from DELIVERED', async () => {
      reportRepo.findOne.mockResolvedValue({
        ...baseReport,
        status: DamageReportStatus.DELIVERED,
      });
      await expect(
        service.updateStatus(tenantId, 'dr-1', {
          status: DamageReportStatus.IN_REPAIR,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows full happy path chain', async () => {
      const statuses = [
        DamageReportStatus.PENDING_PERITAJE,
        DamageReportStatus.APPROVED,
        DamageReportStatus.IN_REPAIR,
        DamageReportStatus.DELIVERED,
      ];
      const next = [
        DamageReportStatus.APPROVED,
        DamageReportStatus.IN_REPAIR,
        DamageReportStatus.DELIVERED,
      ];

      for (let i = 0; i < next.length; i++) {
        reportRepo.findOne
          .mockResolvedValueOnce({ ...baseReport, status: statuses[i] })
          .mockResolvedValueOnce({ ...baseReport, status: next[i] });
        reportRepo.save.mockImplementation(async (r) => r);

        await expect(
          service.updateStatus(tenantId, 'dr-1', { status: next[i] }),
        ).resolves.toEqual(expect.objectContaining({ status: next[i] }));
      }
    });
  });

  describe('remove', () => {
    it('deletes items then report', async () => {
      reportRepo.findOne.mockResolvedValue(baseReport);
      itemRepo.delete.mockResolvedValue(undefined);
      reportRepo.remove.mockResolvedValue(baseReport);

      await expect(service.remove(tenantId, 'dr-1')).resolves.toEqual({
        message: 'Reporte de siniestro SIN-001 eliminado',
      });
      expect(itemRepo.delete).toHaveBeenCalledWith({
        damage_report_id: 'dr-1',
      });
      expect(reportRepo.remove).toHaveBeenCalledWith(baseReport);
    });
  });

  describe('findAll / findByVehicle', () => {
    it('scopes findAll by tenant', async () => {
      reportRepo.find.mockResolvedValue([]);
      await service.findAll(tenantId);
      expect(reportRepo.find).toHaveBeenCalledWith({
        where: { tenant_id: tenantId },
        relations: ['vehicle', 'insuranceCompany'],
        order: { createdAt: 'DESC' },
      });
    });

    it('scopes findByVehicle by tenant and vehicle', async () => {
      reportRepo.find.mockResolvedValue([]);
      await service.findByVehicle(tenantId, 'v-1');
      expect(reportRepo.find).toHaveBeenCalledWith({
        where: { tenant_id: tenantId, vehicle_id: 'v-1' },
        relations: ['insuranceCompany', 'items'],
        order: { createdAt: 'DESC' },
      });
    });
  });
});
