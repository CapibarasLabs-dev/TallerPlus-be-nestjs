import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('audit_logs')
export class Audit extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  code: string; // Ej: 'PAYMENT_REMINDER'

  @Column()
  event: string; // Suceso

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
