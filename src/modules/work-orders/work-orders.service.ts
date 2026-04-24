import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from './entities/work-order.entity';
import { WorkOrderItem, WorkOrderItemType } from './entities/work-order-item.entity';
import { CustomersService } from '../customers/customers.service';
import { VehiclesService } from '../vehicles/vehicles.service';

/** Valid status transitions — terminal states have empty arrays */
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.IN_PROGRESS]: [
    WorkOrderStatus.WAITING_PARTS,
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.WAITING_PARTS]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.DELIVERED],
  [WorkOrderStatus.DELIVERED]: [],
  [WorkOrderStatus.CANCELLED]: [],
};

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepo: Repository<WorkOrder>,
    @InjectRepository(WorkOrderItem)
    private readonly itemRepo: Repository<WorkOrderItem>,
    private readonly customersService: CustomersService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────

  /** Generate the next sequential OT-XXXX number for the given tenant */
  private async generateOrderNumber(tenantId: string): Promise<string> {
    const count = await this.workOrderRepo.count({
      where: { tenant_id: tenantId },
    });
    const num = (count + 1).toString().padStart(4, '0');
    return `OT-${num}`;
  }

  /** Build a WorkOrderItem and compute its subtotal */
  private buildItem(workOrderId: string, data: any): WorkOrderItem {
    const quantity = Number(data.quantity ?? 1);
    const unitPrice = Number(data.unit_price ?? 0);
    const discountPercent = Number(data.discount_percent ?? 0);
    const subtotal = quantity * unitPrice * (1 - discountPercent / 100);

    return this.itemRepo.create({
      work_order_id: workOrderId,
      item_type: data.item_type ?? WorkOrderItemType.OTHER,
      product_id: data.product_id ?? null,
      material_id: data.material_id ?? null,
      description: data.description ?? null,
      quantity,
      unit_price: unitPrice,
      discount_percent: discountPercent,
      subtotal,
    });
  }

  /** Recalculate and persist subtotal + total on a WorkOrder */
  private async recalculateTotals(order: WorkOrder): Promise<WorkOrder> {
    const items = await this.itemRepo.find({
      where: { work_order_id: order.id },
    });
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const total =
      subtotal * (1 + order.tax_percent / 100) - order.discount_amount;
    order.subtotal = subtotal;
    order.total = Math.max(0, total);
    return this.workOrderRepo.save(order);
  }

  // ─── CRUD ────────────────────────────────────────────────

  async create(tenantId: string, data: any): Promise<WorkOrder> {
    let customerId: string = data.customer_id;
    let vehicleId: string = data.vehicle_id;

    // ── Resolve / create customer ──
    if (!customerId) {
      if (!data.customer) {
        throw new BadRequestException(
          'Se requiere customer_id o un objeto customer con los datos del cliente',
        );
      }
      const newCustomer = await this.customersService.create(
        tenantId,
        data.customer,
      );
      customerId = newCustomer.id;
    }

    // ── Resolve / create vehicle ──
    if (!vehicleId) {
      if (!data.vehicle) {
        throw new BadRequestException(
          'Se requiere vehicle_id o un objeto vehicle con los datos del vehículo',
        );
      }
      if (!data.vehicle.plate) {
        throw new BadRequestException(
          'El objeto vehicle debe incluir la placa (plate)',
        );
      }
      // Try to find existing vehicle by plate first
      try {
        const existing = await this.vehiclesService.findByPlate(
          tenantId,
          data.vehicle.plate,
        );
        vehicleId = existing.id;
      } catch {
        // Not found — create a new vehicle linked to the resolved customer
        const newVehicle = await this.vehiclesService.create(
          tenantId,
          { ...data.vehicle, client_id: customerId },
          [],
          [],
        );
        vehicleId = newVehicle.id;
      }
    }

    const orderNumber = await this.generateOrderNumber(tenantId);

    const workOrder = this.workOrderRepo.create({
      tenant_id: tenantId,
      vehicle_id: vehicleId,
      customer_id: customerId,
      order_number: orderNumber,
      status: WorkOrderStatus.PENDING,
      description: data.description ?? null,
      diagnosis: data.diagnosis ?? null,
      internal_notes: data.internal_notes ?? null,
      mileage: data.mileage ?? null,
      estimated_delivery_date: data.estimated_delivery_date ?? null,
      assigned_to_id: data.assigned_to_id ?? null,
      tax_percent: Number(data.tax_percent ?? 0),
      discount_amount: Number(data.discount_amount ?? 0),
      subtotal: 0,
      total: 0,
    });

    const savedOrder = await this.workOrderRepo.save(workOrder);

    // Create line items if provided
    if (Array.isArray(data.items) && data.items.length > 0) {
      const items = data.items.map((i: any) =>
        this.buildItem(savedOrder.id, i),
      );
      await this.itemRepo.save(items);
      await this.recalculateTotals(savedOrder);
    }

    return this.findOne(tenantId, savedOrder.id);
  }

  async findAll(
    tenantId: string,
    filters: {
      status?: string;
      vehicle_id?: string;
      customer_id?: string;
    } = {},
  ): Promise<WorkOrder[]> {
    const where: any = { tenant_id: tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.vehicle_id) where.vehicle_id = filters.vehicle_id;
    if (filters.customer_id) where.customer_id = filters.customer_id;

    return this.workOrderRepo.find({
      where,
      relations: ['vehicle', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<WorkOrder> {
    const order = await this.workOrderRepo.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['vehicle', 'customer', 'items'],
    });
    if (!order) throw new NotFoundException('Orden de trabajo no encontrada');
    return order;
  }

  async update(tenantId: string, id: string, data: any): Promise<WorkOrder> {
    const order = await this.findOne(tenantId, id);

    // These fields must not be mutated via generic update
    const PROTECTED = [
      'tenant_id',
      'vehicle_id',
      'customer_id',
      'order_number',
      'status',
      'subtotal',
      'total',
      'items',
    ];
    PROTECTED.forEach((k) => delete data[k]);

    Object.assign(order, data);
    await this.workOrderRepo.save(order);
    return this.findOne(tenantId, id);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    newStatus: WorkOrderStatus,
  ): Promise<WorkOrder> {
    const order = await this.findOne(tenantId, id);

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transición inválida: '${order.status}' → '${newStatus}'. ` +
          `Transiciones permitidas: ${allowed.join(', ') || 'ninguna (estado terminal)'}`,
      );
    }

    order.status = newStatus;
    if (newStatus === WorkOrderStatus.DELIVERED) {
      order.actual_delivery_date = new Date();
    }

    await this.workOrderRepo.save(order);
    return this.findOne(tenantId, id);
  }

  async updateItems(
    tenantId: string,
    id: string,
    itemsData: any[],
  ): Promise<WorkOrder> {
    const order = await this.findOne(tenantId, id);

    // Replace all existing items
    await this.itemRepo.delete({ work_order_id: id });

    if (Array.isArray(itemsData) && itemsData.length > 0) {
      const items = itemsData.map((i) => this.buildItem(id, i));
      await this.itemRepo.save(items);
    }

    await this.recalculateTotals(order);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<{ message: string }> {
    const order = await this.findOne(tenantId, id);

    const deletableStatuses = [
      WorkOrderStatus.PENDING,
      WorkOrderStatus.CANCELLED,
    ];
    if (!deletableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `No se puede eliminar una orden en estado '${order.status}'. ` +
          `Solo se pueden eliminar órdenes en estado: ${deletableStatuses.join(', ')}`,
      );
    }

    await this.itemRepo.delete({ work_order_id: id });
    await this.workOrderRepo.remove(order);
    return { message: `Orden ${order.order_number} eliminada correctamente` };
  }
}
