import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Company } from '../../companies/entities/company.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { WorkOrderItem } from './work-order-item.entity';

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WAITING_PARTS = 'waiting_parts',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('work_orders')
export class WorkOrder extends BaseEntity {
  @Column({ nullable: false })
  tenant_id: string;

  @Column({ nullable: false })
  vehicle_id: string;

  @Column({ nullable: false })
  customer_id: string;

  @Column({ nullable: false })
  order_number: string;

  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.PENDING,
  })
  status: WorkOrderStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  internal_notes: string;

  @Column({ nullable: true })
  mileage: number;

  @Column({ type: 'timestamp', nullable: true })
  estimated_delivery_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_delivery_date: Date;

  @Column({ nullable: true })
  assigned_to_id: string;

  @Column({ type: 'float', default: 0 })
  subtotal: number;

  @Column({ type: 'float', default: 0 })
  tax_percent: number;

  @Column({ type: 'float', default: 0 })
  discount_amount: number;

  @Column({ type: 'float', default: 0 })
  total: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;

  @ManyToOne(() => Vehicle, { eager: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => WorkOrderItem, (item) => item.workOrder, {
    cascade: true,
    eager: false,
  })
  items: WorkOrderItem[];
}
