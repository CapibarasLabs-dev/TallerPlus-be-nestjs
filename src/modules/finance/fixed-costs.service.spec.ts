import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FixedCostsService } from './fixed-costs.service';
import { FixedCost } from './entities/fixed-costs.entity';

describe('FixedCostsService', () => {
  let service: FixedCostsService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FixedCostsService,
        { provide: getRepositoryToken(FixedCost), useValue: repo },
      ],
    }).compile();
    service = module.get(FixedCostsService);
  });

  it('create sets tenant_id', async () => {
    const row = { id: 'fc-1', tenant_id: 't-1', electricity: 100 };
    repo.create.mockReturnValue(row);
    repo.save.mockResolvedValue(row);
    await service.create('t-1', { electricity: 100 });
    expect(repo.create).toHaveBeenCalledWith({
      electricity: 100,
      tenant_id: 't-1',
    });
  });

  it('getTotalMonthly returns 0 when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.getTotalMonthly('t-1')).resolves.toBe(0);
  });

  it('getTotalMonthly sums numbers and others[].cost', async () => {
    repo.findOne.mockResolvedValue({
      id: 'fc-1',
      tenant_id: 't-1',
      electricity: 100,
      water: 50,
      rent: 'skip',
      others: [{ cost: 25 }, { cost: 25 }, { label: 'x' }],
    });

    // Object.values also includes id/tenant strings → ignored; numbers 100+50=150 + others 50 = 200
    await expect(service.getTotalMonthly('t-1')).resolves.toBe(200);
  });

  it('remove deletes by id', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });
    await service.remove('fc-1');
    expect(repo.delete).toHaveBeenCalledWith({ id: 'fc-1' });
  });
});
