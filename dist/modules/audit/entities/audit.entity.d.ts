import { BaseEntity } from '../../../common/base.entity';
export declare class Audit extends BaseEntity {
  tenantId: string;
  code: string;
  event: string;
  clientId: string;
}
