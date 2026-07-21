import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Company } from '../../companies/entities/company.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { DamageReportItem } from './damage-report-item.entity';

export enum DamageReportStatus {
  PENDING_PERITAJE = 'pending_peritaje',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_REPAIR = 'in_repair',
  DELIVERED = 'delivered',
}

@Entity('damage_reports')
export class DamageReport extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  vehicle_id: string;

  @Column()
  insurance_company_id: string;

  @Column()
  siniestro_number: string;

  @Column({
    type: 'enum',
    enum: DamageReportStatus,
    default: DamageReportStatus.PENDING_PERITAJE,
  })
  status: DamageReportStatus;

  @Column({ type: 'jsonb', default: [] })
  general_photos: string[];

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @Column({ type: 'float', default: 0 })
  subtotal_repuestos: number;

  @Column({ type: 'float', default: 0 })
  subtotal_chapa: number;

  @Column({ type: 'float', default: 0 })
  subtotal_mecanica: number;

  @Column({ type: 'float', default: 0 })
  subtotal_pintura: number;

  @Column({ type: 'float', default: 0 })
  subtotal: number;

  @Column({ type: 'float', default: 22 })
  tax_percent: number;

  @Column({ type: 'float', default: 0 })
  tax_amount: number;

  @Column({ type: 'float', default: 0 })
  total: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => InsuranceCompany, { eager: false })
  @JoinColumn({ name: 'insurance_company_id' })
  insuranceCompany: InsuranceCompany;

  @OneToMany(() => DamageReportItem, (item) => item.damageReport, {
    cascade: true,
    eager: false,
  })
  items: DamageReportItem[];
}
