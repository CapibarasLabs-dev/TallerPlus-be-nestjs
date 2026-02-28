import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Product } from '../../products/entities/products.entity';
import { Material } from './materials.entity';

@Entity('product_materials')
export class ProductMaterial extends BaseEntity {
  @Column()
  product_id: string;

  @Column()
  material_id: string;

  @Column({ type: 'float' })
  quantity_used: number; // Ej: 0.5 si usa medio kilo

  @ManyToOne(() => Product, (p) => p.materials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Material, (m) => m.productMaterials)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
