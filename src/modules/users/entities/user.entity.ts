import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: 'America/Montevideo' })
  timezone: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: any;

  @Column({ default: false })
  isGuest: boolean;
}
