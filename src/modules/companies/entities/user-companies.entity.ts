import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Company } from './company.entity';

@Entity('user_companies')
export class UserCompany extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  companyId: string;

  @Column({ default: 'GUEST' }) // OWNER, ADMIN, GUEST
  role: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;
}
