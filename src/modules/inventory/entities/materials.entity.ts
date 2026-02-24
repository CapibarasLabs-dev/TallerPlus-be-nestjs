import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('materials')
export class Material extends BaseEntity {
  @Column()
  title: string;

  @Column()
  unit: string;

  @Column()
  currency: string;

  @Column()
  supplierId: string;
}
