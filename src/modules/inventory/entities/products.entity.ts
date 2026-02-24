import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float', default: 1 })
  currencyRate: number;

  @Column('text', { array: true, default: [] })
  categories: string[];

  @Column('jsonb', { default: [] })
  materials: { materialId: string; quantity: number }[]; //

  @Column('text', { array: true, default: [] })
  photos: string[];

  //Variants
  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'parentId' })
  parent: Product;

  @OneToMany(() => Product, (product) => product.parent)
  variants: Product[];
}
