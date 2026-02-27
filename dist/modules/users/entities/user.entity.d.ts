import { BaseEntity } from '../../../common/base.entity';
export declare class User extends BaseEntity {
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  address: string;
  timezone: string;
  preferences: any;
  isGuest: boolean;
}
