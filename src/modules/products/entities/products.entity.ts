import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  title: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float', default: 1 })
  currency_rate: number;

  @Column('text', { array: true, default: [] })
  categories: string[];

  @Column('jsonb', { default: [] })
  materials: any;

  @Column('text', { array: true, default: [] })
  photos: string[];

  @Column({ nullable: true })
  parent_id: string;

  @Column({ default: 10 })
  profit_margin: number;

  @Column({ default: 0 })
  labor_hours: number;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'parent_id' })
  parent: Product;

  @OneToMany(() => Product, (product) => product.parent)
  variants: Product[];

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;
}
