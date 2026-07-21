import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { InsuranceBareme } from './insurance-bareme.entity';

@Entity('insurance_companies')
export class InsuranceCompany extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  rut: string | null;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => InsuranceBareme, (bareme) => bareme.insuranceCompany)
  baremes: InsuranceBareme[];
}
