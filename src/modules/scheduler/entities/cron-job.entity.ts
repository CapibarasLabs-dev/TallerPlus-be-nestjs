import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('scheduler_tasks')
export class SchedulerTask extends BaseEntity {
  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column({ type: 'timestamp' })
  executionDate: Date;

  @Column()
  description: string;

  @Column()
  action: 'agenda' | 'notification';

  @Column({ type: 'text' })
  message: string;
}
