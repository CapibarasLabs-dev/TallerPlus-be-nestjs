import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/products.entity';
import { FixedCostsService } from '../finance/fixed-costs.service';
import { CompaniesService } from '../companies/companies.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const productRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      create: jest.fn(),
    },
  };
  const fixedCostsService = { getTotalMonthly: jest.fn() };
  const companiesService = { findOne: jest.fn() };

  const tenantId = 'tenant-1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: DataSource,
          useValue: { createQueryRunner: () => queryRunner },
        },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: FixedCostsService, useValue: fixedCostsService },
        { provide: CompaniesService, useValue: companiesService },
      ],
    }).compile();
    service = module.get(ProductsService);
  });

  describe('create', () => {
    it('commits product without materials', async () => {
      const product = { id: 'p-1', title: 'Pintura', tenant_id: tenantId };
      productRepo.create.mockReturnValue(product);
      queryRunner.manager.save.mockResolvedValue(product);

      const result = await service.create(tenantId, {
        title: 'Pintura',
        labor_hours: 2,
        profit_margin: 20,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(product);
    });

    it('rolls back on error', async () => {
      productRepo.create.mockReturnValue({});
      queryRunner.manager.save.mockRejectedValue(new Error('db'));

      await expect(
        service.create(tenantId, { title: 'X' }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  it('findOne scopes by tenant and throws', async () => {
    productRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 'p-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(productRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'p-1', tenant_id: tenantId },
    });
  });

  it('calculatePrice computes material + labor + margin', async () => {
    productRepo.findOne.mockResolvedValue({
      id: 'p-1',
      title: 'Capó',
      labor_hours: 2,
      profit_margin: 50,
      materials: [
        { quantity_used: 2, material: { unit_cost: 100 } },
        { quantity_used: 1, material: { unit_cost: 50 } },
      ],
    });
    companiesService.findOne.mockResolvedValue({
      id: tenantId,
      currency: 'UYU',
      monthly_working_hours: 160,
    });
    fixedCostsService.getTotalMonthly.mockResolvedValue(1600);

    const result = await service.calculatePrice(tenantId, 'p-1');

    // material = 2*100 + 1*50 = 250
    // costPerHour = 1600/160 = 10; labor = 20; totalCost = 270
    // suggested = 250 * 1.5 = 375
    expect(result).toEqual({
      product: 'Capó',
      currency: 'UYU',
      analysis: {
        materialCost: 250,
        laborCost: 20,
        totalCost: 270,
        marginApplied: '50%',
        suggestedPrice: 375,
      },
    });
  });
});
