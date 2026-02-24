import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('fixed_costs')
export class FixedCost extends BaseEntity {
  @Column()
  tenantId: string;

  @Column({ type: 'float', nullable: true })
  electricity: number;

  @Column({ type: 'float', nullable: true })
  water: number;

  @Column({ type: 'float', nullable: true })
  gas: number;

  @Column({ type: 'float' })
  internet: number;

  @Column({ type: 'jsonb', nullable: true })
  others: any;
}
