import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('materials')
export class Material extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  title: string;

  @Column({ type: 'float' })
  unit_cost: number;

  @Column()
  unit_type: string;

  @Column({ nullable: true })
  supplier_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => Supplier, (sup) => sup.id)
  @JoinColumn({ name: 'supplier_id' })
  parent: Supplier;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
