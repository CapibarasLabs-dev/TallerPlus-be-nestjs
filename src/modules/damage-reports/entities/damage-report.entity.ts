import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('damage_reports')
export class DamageReport extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  vehicle_id: string;

  @Column({ nullable: true })
  report_number: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  damage_location: string;

  @Column({
    type: 'enum',
    enum: ['minor', 'moderate', 'severe', 'total_loss'],
    default: 'moderate',
  })
  severity: 'minor' | 'moderate' | 'severe' | 'total_loss';

  @Column({ type: 'text', nullable: true })
  damage_details: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_review', 'approved', 'rejected', 'completed'],
    default: 'pending',
  })
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_cost: number;

  @Column({ nullable: true })
  reported_by: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  report_date: Date;

  @Column({ type: 'jsonb', default: [] })
  photos: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
