import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/entities/user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

export enum UserTier {
  FREE = 'free',
  PREMIUM = 'premium',
  SPECIAL = 'special',
}

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Column()
  user_id: string;

  @Column({ type: 'enum', enum: UserTier, default: UserTier.FREE })
  tier: UserTier;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ type: 'float', nullable: true })
  last_amount: number;

  @Column({ type: 'timestamp', nullable: true })
  last_payment_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  valid_until: Date;

  @Column({ nullable: true })
  external_reference: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
