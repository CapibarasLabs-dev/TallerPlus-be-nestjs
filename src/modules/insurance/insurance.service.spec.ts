import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsuranceService } from './insurance.service';
import { InsuranceCompany } from './entities/insurance-company.entity';
import { InsuranceBareme } from './entities/insurance-bareme.entity';

describe('InsuranceService', () => {
  let service: InsuranceService;
  const companyRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const baremeRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const company: InsuranceCompany = {
    id: 'ic-1',
    name: 'MAPFRE',
    rut: '123',
    is_active: true,
  } as InsuranceCompany;

  const bareme: InsuranceBareme = {
    id: 'b-1',
    tenant_id: tenantId,
    insurance_company_id: company.id,
    hour_cost_chapa: 100,
    hour_cost_mecanica: 120,
    hour_cost_pintura: 90,
  } as InsuranceBareme;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceService,
        { provide: getRepositoryToken(InsuranceCompany), useValue: companyRepo },
        { provide: getRepositoryToken(InsuranceBareme), useValue: baremeRepo },
      ],
    }).compile();

    service = module.get(InsuranceService);
  });

  describe('createCompany', () => {
    it('creates company', async () => {
      companyRepo.create.mockReturnValue(company);
      companyRepo.save.mockResolvedValue(company);

      const result = await service.createCompany({ name: 'MAPFRE', rut: '123' });

      expect(companyRepo.create).toHaveBeenCalledWith({
        name: 'MAPFRE',
        rut: '123',
        is_active: true,
      });
      expect(result).toEqual(company);
    });

    it('throws BadRequest when name empty', async () => {
      await expect(service.createCompany({ name: '  ' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllCompanies', () => {
    it('returns all when activeOnly false', async () => {
      companyRepo.find.mockResolvedValue([company]);
      await service.findAllCompanies(false);
      expect(companyRepo.find).toHaveBeenCalledWith({
        where: {},
        order: { name: 'ASC' },
      });
    });

    it('filters active when activeOnly true', async () => {
      companyRepo.find.mockResolvedValue([company]);
      await service.findAllCompanies(true);
      expect(companyRepo.find).toHaveBeenCalledWith({
        where: { is_active: true },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findCompanyById', () => {
    it('returns company', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      await expect(service.findCompanyById('ic-1')).resolves.toEqual(company);
    });

    it('throws NotFound', async () => {
      companyRepo.findOne.mockResolvedValue(null);
      await expect(service.findCompanyById('x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCompany', () => {
    it('updates and saves', async () => {
      companyRepo.findOne.mockResolvedValue({ ...company });
      companyRepo.save.mockImplementation(async (c) => c);

      const result = await service.updateCompany('ic-1', { name: 'SURA' });
      expect(result.name).toBe('SURA');
    });
  });

  describe('createBareme', () => {
    it('creates bareme scoped to tenant', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      baremeRepo.findOne.mockResolvedValue(null);
      baremeRepo.create.mockReturnValue(bareme);
      baremeRepo.save.mockResolvedValue(bareme);

      const result = await service.createBareme(tenantId, {
        insurance_company_id: company.id,
        hour_cost_chapa: 100,
        hour_cost_mecanica: 120,
        hour_cost_pintura: 90,
      });

      expect(baremeRepo.create).toHaveBeenCalledWith({
        tenant_id: tenantId,
        insurance_company_id: company.id,
        hour_cost_chapa: 100,
        hour_cost_mecanica: 120,
        hour_cost_pintura: 90,
      });
      expect(result).toEqual(bareme);
    });

    it('throws BadRequest when bareme already exists', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      baremeRepo.findOne.mockResolvedValue(bareme);

      await expect(
        service.createBareme(tenantId, {
          insurance_company_id: company.id,
          hour_cost_chapa: 100,
          hour_cost_mecanica: 120,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when insurance company missing', async () => {
      companyRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createBareme(tenantId, {
          insurance_company_id: 'missing',
          hour_cost_chapa: 100,
          hour_cost_mecanica: 120,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBaremes', () => {
    it('scopes by tenant_id', async () => {
      baremeRepo.find.mockResolvedValue([bareme]);
      await service.findBaremes(tenantId);
      expect(baremeRepo.find).toHaveBeenCalledWith({
        where: { tenant_id: tenantId },
        relations: ['insuranceCompany'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findBaremeForCompany', () => {
    it('returns bareme', async () => {
      baremeRepo.findOne.mockResolvedValue(bareme);
      await expect(
        service.findBaremeForCompany(tenantId, company.id),
      ).resolves.toEqual(bareme);
    });

    it('throws NotFound when missing', async () => {
      baremeRepo.findOne.mockResolvedValue(null);
      await expect(
        service.findBaremeForCompany(tenantId, company.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBareme', () => {
    it('updates costs for tenant bareme', async () => {
      baremeRepo.findOne.mockResolvedValue({ ...bareme });
      baremeRepo.save.mockImplementation(async (b) => b);

      const result = await service.updateBareme(tenantId, 'b-1', {
        hour_cost_chapa: 200,
        hour_cost_pintura: null,
      });

      expect(result.hour_cost_chapa).toBe(200);
      expect(result.hour_cost_pintura).toBeNull();
      expect(baremeRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'b-1', tenant_id: tenantId },
        relations: ['insuranceCompany'],
      });
    });

    it('throws NotFound for other tenant', async () => {
      baremeRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateBareme('other-tenant', 'b-1', { hour_cost_chapa: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeBareme', () => {
    it('removes and returns message', async () => {
      baremeRepo.findOne.mockResolvedValue(bareme);
      baremeRepo.remove.mockResolvedValue(bareme);

      await expect(service.removeBareme(tenantId, 'b-1')).resolves.toEqual({
        message: 'Baremo eliminado correctamente',
      });
    });

    it('throws NotFound when missing', async () => {
      baremeRepo.findOne.mockResolvedValue(null);
      await expect(service.removeBareme(tenantId, 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
