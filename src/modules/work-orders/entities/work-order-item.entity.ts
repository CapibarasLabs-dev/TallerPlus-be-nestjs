import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { WorkOrder } from './work-order.entity';

export enum WorkOrderItemType {
  SERVICE = 'service',
  MATERIAL = 'material',
  OTHER = 'other',
}

@Entity('work_order_items')
export class WorkOrderItem extends BaseEntity {
  @Column({ nullable: false })
  work_order_id: string;

  @Column({
    type: 'enum',
    enum: WorkOrderItemType,
    default: WorkOrderItemType.OTHER,
  })
  item_type: WorkOrderItemType;

  @Column({ nullable: true })
  product_id: string;

  @Column({ nullable: true })
  material_id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'float', default: 1 })
  quantity: number;

  @Column({ type: 'float', default: 0 })
  unit_price: number;

  @Column({ type: 'float', default: 0 })
  discount_percent: number;

  @Column({ type: 'float', default: 0 })
  subtotal: number;

  @ManyToOne(() => WorkOrder, (wo) => wo.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;
}
