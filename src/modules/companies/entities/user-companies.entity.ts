import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Company } from './company.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_companies')
export class UserCompany extends BaseEntity {
  @Column()
  user_id: string;

  @Column()
  company_id: string;

  @Column({ default: 'GUEST' }) // OWNER, GUEST
  role: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
