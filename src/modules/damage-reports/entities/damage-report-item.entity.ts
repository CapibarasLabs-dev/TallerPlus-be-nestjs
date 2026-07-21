import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { DamageReport } from './damage-report.entity';

export enum DamageReportOperationType {
  REPUESTO = 'repuesto',
  CHAPA = 'chapa',
  PINTURA = 'pintura',
  MECANICA = 'mecanica',
  DESMONTAJE_MONTAJE = 'desmontaje_montaje',
}

@Entity('damage_report_items')
export class DamageReportItem extends BaseEntity {
  @Column()
  damage_report_id: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: DamageReportOperationType,
  })
  operation_type: DamageReportOperationType;

  @Column({ type: 'float', default: 0 })
  hours_suggested: number;

  @Column({ type: 'float', default: 0 })
  unit_price: number;

  @Column({ nullable: true })
  supplier_name: string | null;

  @Column({ type: 'jsonb', default: [] })
  item_photos: string[];

  @ManyToOne(() => DamageReport, (report) => report.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'damage_report_id' })
  damageReport: DamageReport;
}
