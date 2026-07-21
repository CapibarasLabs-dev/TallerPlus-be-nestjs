import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Company } from '../../companies/entities/company.entity';
import { InsuranceCompany } from './insurance-company.entity';

@Entity('insurance_baremes')
@Unique(['tenant_id', 'insurance_company_id'])
export class InsuranceBareme extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  insurance_company_id: string;

  @Column({ type: 'float' })
  hour_cost_chapa: number;

  @Column({ type: 'float' })
  hour_cost_mecanica: number;

  /** null = pintura a precio fijo por pieza (unit_price en el ítem). */
  @Column({ type: 'float', nullable: true })
  hour_cost_pintura: number | null;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;

  @ManyToOne(() => InsuranceCompany, (ic) => ic.baremes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'insurance_company_id' })
  insuranceCompany: InsuranceCompany;
}
