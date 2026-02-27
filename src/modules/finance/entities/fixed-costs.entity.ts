import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('fixed_costs')
export class FixedCost extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column({ type: 'float', nullable: true })
  electricity: number;

  @Column({ type: 'float', nullable: true })
  water: number;

  @Column({ type: 'float', nullable: true })
  gas: number;

  @Column({ type: 'float', nullable: true })
  internet: number;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  others: { titule: string; cost: number }[];

  @OneToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
