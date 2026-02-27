import { BaseEntity } from '../../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('materials')
export class Material extends BaseEntity {
  @Column()
  title: string;

  @Column()
  unit: string;

  @Column()
  currency: string;

  @Column()
  supplier_id: string;

  @ManyToOne(() => Supplier, (supp) => supp.id)
  @JoinColumn({ name: 'supplier_id' })
  parent: Supplier;
}
