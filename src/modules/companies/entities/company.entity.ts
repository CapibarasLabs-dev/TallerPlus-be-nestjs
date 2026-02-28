import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('companies')
export class Company extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  rut: string;

  @Column({ default: 'UYU' })
  currency: string;

  @Column({ default: 0 })
  monthly_working_hours: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
