import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Material } from './materials.entity';
import { Product } from './products.entity';

@Entity('product_materials')
export class ProductMaterial extends BaseEntity {
  @Column()
  productId: string;

  @Column()
  materialId: string;

  @Column({ type: 'float' })
  quantityUsed: number;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Material)
  material: Material;
}
