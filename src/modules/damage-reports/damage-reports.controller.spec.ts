import { Test, TestingModule } from '@nestjs/testing';
import { DamageReportsController } from './damage-reports.controller';
import { DamageReportsService } from './damage-reports.service';
import { DamageReportStatus } from './entities/damage-report.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

describe('DamageReportsController', () => {
  let controller: DamageReportsController;
  const damageReportsService = {
    create: jest.fn(),
    addItems: jest.fn(),
    findAll: jest.fn(),
    findByVehicle: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  const req = { tenantId: 'tenant-1' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DamageReportsController],
      providers: [
        { provide: DamageReportsService, useValue: damageReportsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(DamageReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create passes tenantId', async () => {
    const body = {
      vehicle_id: 'v-1',
      insurance_company_id: 'ic-1',
      siniestro_number: 'SIN-001',
    };
    await controller.create(req, body);
    expect(damageReportsService.create).toHaveBeenCalledWith('tenant-1', body);
  });

  it('addItems passes tenantId and id', async () => {
    const body = { items: [] };
    await controller.addItems(req, 'dr-1', body as any);
    expect(damageReportsService.addItems).toHaveBeenCalledWith(
      'tenant-1',
      'dr-1',
      body,
    );
  });

  it('findAll passes tenantId', async () => {
    await controller.findAll(req);
    expect(damageReportsService.findAll).toHaveBeenCalledWith('tenant-1');
  });

  it('findByVehicle passes tenantId and vehicleId', async () => {
    await controller.findByVehicle(req, 'v-1');
    expect(damageReportsService.findByVehicle).toHaveBeenCalledWith(
      'tenant-1',
      'v-1',
    );
  });

  it('findOne passes tenantId and id', async () => {
    await controller.findOne(req, 'dr-1');
    expect(damageReportsService.findOne).toHaveBeenCalledWith(
      'tenant-1',
      'dr-1',
    );
  });

  it('update passes tenantId', async () => {
    const body = { observations: 'ok' };
    await controller.update(req, 'dr-1', body);
    expect(damageReportsService.update).toHaveBeenCalledWith(
      'tenant-1',
      'dr-1',
      body,
    );
  });

  it('updateStatus passes tenantId', async () => {
    const body = { status: DamageReportStatus.APPROVED };
    await controller.updateStatus(req, 'dr-1', body);
    expect(damageReportsService.updateStatus).toHaveBeenCalledWith(
      'tenant-1',
      'dr-1',
      body,
    );
  });

  it('remove passes tenantId', async () => {
    await controller.remove(req, 'dr-1');
    expect(damageReportsService.remove).toHaveBeenCalledWith(
      'tenant-1',
      'dr-1',
    );
  });
});
