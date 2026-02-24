import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('companies')
export class Company extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Información extra sugerida (ej. RUT, moneda base)
}
