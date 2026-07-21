import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

describe('InsuranceController', () => {
  let controller: InsuranceController;
  const insuranceService = {
    createCompany: jest.fn(),
    findAllCompanies: jest.fn(),
    findCompanyById: jest.fn(),
    updateCompany: jest.fn(),
    createBareme: jest.fn(),
    findBaremes: jest.fn(),
    findBaremeForCompany: jest.fn(),
    updateBareme: jest.fn(),
    removeBareme: jest.fn(),
  };

  const req = { tenantId: 'tenant-1' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceController],
      providers: [{ provide: InsuranceService, useValue: insuranceService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(InsuranceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createCompany delegates', async () => {
    const body = { name: 'MAPFRE' };
    await controller.createCompany(body);
    expect(insuranceService.createCompany).toHaveBeenCalledWith(body);
  });

  it('findAllCompanies parses active_only', async () => {
    await controller.findAllCompanies('true');
    expect(insuranceService.findAllCompanies).toHaveBeenCalledWith(true);

    await controller.findAllCompanies();
    expect(insuranceService.findAllCompanies).toHaveBeenCalledWith(false);
  });

  it('findCompany delegates', async () => {
    await controller.findCompany('ic-1');
    expect(insuranceService.findCompanyById).toHaveBeenCalledWith('ic-1');
  });

  it('updateCompany delegates', async () => {
    const body = { name: 'SURA' };
    await controller.updateCompany('ic-1', body);
    expect(insuranceService.updateCompany).toHaveBeenCalledWith('ic-1', body);
  });

  it('createBareme passes tenantId', async () => {
    const body = {
      insurance_company_id: 'ic-1',
      hour_cost_chapa: 100,
      hour_cost_mecanica: 120,
    };
    await controller.createBareme(req, body);
    expect(insuranceService.createBareme).toHaveBeenCalledWith(
      'tenant-1',
      body,
    );
  });

  it('findBaremes passes tenantId', async () => {
    await controller.findBaremes(req);
    expect(insuranceService.findBaremes).toHaveBeenCalledWith('tenant-1');
  });

  it('findBaremeForCompany passes tenantId and company id', async () => {
    await controller.findBaremeForCompany(req, 'ic-1');
    expect(insuranceService.findBaremeForCompany).toHaveBeenCalledWith(
      'tenant-1',
      'ic-1',
    );
  });

  it('updateBareme passes tenantId', async () => {
    const body = { hour_cost_chapa: 200 };
    await controller.updateBareme(req, 'b-1', body);
    expect(insuranceService.updateBareme).toHaveBeenCalledWith(
      'tenant-1',
      'b-1',
      body,
    );
  });

  it('removeBareme passes tenantId', async () => {
    await controller.removeBareme(req, 'b-1');
    expect(insuranceService.removeBareme).toHaveBeenCalledWith(
      'tenant-1',
      'b-1',
    );
  });
});
