import { BaseEntity } from '../../../common/base.entity';
export declare class SchedulerTask extends BaseEntity {
  tenantId: string;
  userId: string;
  executionDate: Date;
  description: string;
  action: 'agenda' | 'notification';
  message: string;
}
