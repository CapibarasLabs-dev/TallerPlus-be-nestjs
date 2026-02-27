import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column({ nullable: true })
  created_by: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  user: User;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
