import { BaseEntity } from '../../../common/base.entity';
export declare class Company extends BaseEntity {
  name: string;
  ownerId: string;
  logo: string;
  location: string;
  phone: string;
  metadata: any;
}
