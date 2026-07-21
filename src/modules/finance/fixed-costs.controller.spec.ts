import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';
import { FixedCostsController } from './fixed-costs.controller';
import { FixedCostsService } from './fixed-costs.service';

describe('FixedCostsController', () => {
  let controller: FixedCostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FixedCostsController],
      providers: [
        {
          provide: FixedCostsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            getTotalMonthly: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(FixedCostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
