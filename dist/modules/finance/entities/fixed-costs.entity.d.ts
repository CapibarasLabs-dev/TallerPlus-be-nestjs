import { BaseEntity } from '../../../common/base.entity';
export declare class FixedCost extends BaseEntity {
  tenantId: string;
  electricity: number;
  water: number;
  gas: number;
  internet: number;
  others: any;
}
