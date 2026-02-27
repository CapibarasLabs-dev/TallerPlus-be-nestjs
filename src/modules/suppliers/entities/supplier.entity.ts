import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Material } from '../../inventory/entities/materials.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  contact_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  metadata: { key: string; value: string }[];

  @OneToMany(() => Material, (mat) => mat.parent)
  materials: Material[];

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
