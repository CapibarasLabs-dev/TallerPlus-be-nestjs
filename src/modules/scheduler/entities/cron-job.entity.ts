import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('scheduler_tasks')
export class SchedulerTask extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'timestamp' })
  execution_date: Date;

  @Column()
  description: string;

  @Column()
  action: 'agenda' | 'notification';

  @Column({ type: 'text' })
  message: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
