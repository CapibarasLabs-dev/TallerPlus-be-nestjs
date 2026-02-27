export interface User {
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  address?: string;
  timezone: string;
  preferences: any;
  role: Role;
  email: string;
}

export enum Role {
  user = 'CUSTOMER',
  admin = 'ADMIN',
  support = 'SUPPORT',
}
