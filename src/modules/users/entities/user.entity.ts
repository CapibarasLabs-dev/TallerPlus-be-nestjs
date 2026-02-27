import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: 'America/Montevideo' })
  timezone: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: any;

  @Column({ default: 'CUSTOMER' })
  role: string;
}
