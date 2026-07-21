import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrder, WorkOrderStatus } from './entities/work-order.entity';
import {
  WorkOrderItem,
  WorkOrderItemType,
} from './entities/work-order-item.entity';
import { CustomersService } from '../customers/customers.service';
import { VehiclesService } from '../vehicles/vehicles.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  const workOrderRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const itemRepo = {
    create: jest.fn((x) => x),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };
  const customersService = { create: jest.fn() };
  const vehiclesService = {
    findByPlate: jest.fn(),
    create: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const baseOrder = {
    id: 'wo-1',
    tenant_id: tenantId,
    order_number: 'OT-0001',
    status: WorkOrderStatus.PENDING,
    tax_percent: 22,
    discount_amount: 0,
    customer_id: 'cu-1',
    vehicle_id: 'v-1',
  } as WorkOrder;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: getRepositoryToken(WorkOrder), useValue: workOrderRepo },
        { provide: getRepositoryToken(WorkOrderItem), useValue: itemRepo },
        { provide: CustomersService, useValue: customersService },
        { provide: VehiclesService, useValue: vehiclesService },
      ],
    }).compile();
    service = module.get(WorkOrdersService);
  });

  describe('create', () => {
    it('throws without customer', async () => {
      await expect(
        service.create(tenantId, { vehicle_id: 'v-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws without vehicle', async () => {
      await expect(
        service.create(tenantId, { customer_id: 'cu-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates with ids, order number and item totals', async () => {
      workOrderRepo.count.mockResolvedValue(0);
      workOrderRepo.create.mockReturnValue(baseOrder);
      workOrderRepo.save.mockResolvedValue(baseOrder);
      itemRepo.save.mockResolvedValue([]);
      itemRepo.find.mockResolvedValue([
        { subtotal: 100 },
        { subtotal: 50 },
      ]);
      workOrderRepo.update.mockResolvedValue(undefined);
      workOrderRepo.findOne.mockResolvedValue({
        ...baseOrder,
        items: [],
      });

      await service.create(tenantId, {
        customer_id: 'cu-1',
        vehicle_id: 'v-1',
        tax_percent: 22,
        items: [
          {
            item_type: WorkOrderItemType.OTHER,
            quantity: 1,
            unit_price: 100,
          },
          {
            quantity: 1,
            unit_price: 50,
          },
        ],
      });

      expect(workOrderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order_number: 'OT-0001',
          tenant_id: tenantId,
          status: WorkOrderStatus.PENDING,
        }),
      );
      // subtotal 150, tax 22% → 183
      expect(workOrderRepo.update).toHaveBeenCalledWith('wo-1', {
        subtotal: 150,
        total: 183,
      });
    });
  });

  it('findAll applies filters', async () => {
    workOrderRepo.find.mockResolvedValue([]);
    await service.findAll(tenantId, {
      status: WorkOrderStatus.PENDING,
      vehicle_id: 'v-1',
    });
    expect(workOrderRepo.find).toHaveBeenCalledWith({
      where: {
        tenant_id: tenantId,
        status: WorkOrderStatus.PENDING,
        vehicle_id: 'v-1',
      },
      relations: ['vehicle', 'customer'],
      order: { createdAt: 'DESC' },
    });
  });

  it('findOne throws NotFound', async () => {
    workOrderRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 'wo-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('updateStatus', () => {
    it('allows PENDING → IN_PROGRESS', async () => {
      workOrderRepo.findOne
        .mockResolvedValueOnce({ ...baseOrder })
        .mockResolvedValueOnce({
          ...baseOrder,
          status: WorkOrderStatus.IN_PROGRESS,
        });
      workOrderRepo.save.mockImplementation(async (o) => o);

      const result = await service.updateStatus(
        tenantId,
        'wo-1',
        WorkOrderStatus.IN_PROGRESS,
      );
      expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
    });

    it('rejects invalid transition', async () => {
      workOrderRepo.findOne.mockResolvedValue({ ...baseOrder });
      await expect(
        service.updateStatus(tenantId, 'wo-1', WorkOrderStatus.DELIVERED),
      ).rejects.toThrow(BadRequestException);
    });

    it('sets actual_delivery_date on DELIVERED', async () => {
      workOrderRepo.findOne
        .mockResolvedValueOnce({
          ...baseOrder,
          status: WorkOrderStatus.COMPLETED,
        })
        .mockResolvedValueOnce({
          ...baseOrder,
          status: WorkOrderStatus.DELIVERED,
        });
      workOrderRepo.save.mockImplementation(async (o) => o);

      await service.updateStatus(tenantId, 'wo-1', WorkOrderStatus.DELIVERED);
      expect(workOrderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: WorkOrderStatus.DELIVERED,
          actual_delivery_date: expect.any(Date),
        }),
      );
    });
  });

  describe('remove', () => {
    it('allows PENDING', async () => {
      workOrderRepo.findOne.mockResolvedValue({ ...baseOrder });
      itemRepo.delete.mockResolvedValue(undefined);
      workOrderRepo.remove.mockResolvedValue(baseOrder);

      await expect(service.remove(tenantId, 'wo-1')).resolves.toEqual({
        message: 'Orden OT-0001 eliminada correctamente',
      });
    });

    it('blocks IN_PROGRESS', async () => {
      workOrderRepo.findOne.mockResolvedValue({
        ...baseOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });
      await expect(service.remove(tenantId, 'wo-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  it('update strips protected fields', async () => {
    workOrderRepo.findOne
      .mockResolvedValueOnce({ ...baseOrder })
      .mockResolvedValueOnce({ ...baseOrder, description: 'ok' });
    workOrderRepo.save.mockImplementation(async (o) => o);

    await service.update(tenantId, 'wo-1', {
      description: 'ok',
      status: WorkOrderStatus.DELIVERED,
      tenant_id: 'hack',
    });

    expect(workOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'ok',
        status: WorkOrderStatus.PENDING,
        tenant_id: tenantId,
      }),
    );
  });
});
