import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { WorkOrder } from './work-order.entity';

export enum WorkOrderItemType {
  SERVICE = 'service',   // A service from the products catalog (labor-based)
  MATERIAL = 'material', // A raw material / part from inventory
  OTHER = 'other',       // Free-text item not linked to catalog
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

  /** FK → products (optional — for catalog services) */
  @Column({ nullable: true })
  product_id: string;

  /** FK → materials (optional — for inventory parts) */
  @Column({ nullable: true })
  material_id: string;

  /** Human-readable description (pre-filled from product/material but editable) */
  @Column({ nullable: true })
  description: string;

  @Column({ type: 'float', default: 1 })
  quantity: number;

  /** Price snapshot at time of order — not the live catalog price */
  @Column({ type: 'float', default: 0 })
  unit_price: number;

  /** Per-item discount percentage (0–100) */
  @Column({ type: 'float', default: 0 })
  discount_percent: number;

  /** quantity * unit_price * (1 - discount_percent / 100) */
  @Column({ type: 'float', default: 0 })
  subtotal: number;

  // ─── Relations ──────────────────────────────────────────

  @ManyToOne(() => WorkOrder, (wo) => wo.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;
}
