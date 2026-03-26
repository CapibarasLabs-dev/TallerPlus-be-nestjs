// src/modules/vehicles/entities/vehicle.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Company } from '../../companies/entities/company.entity';
import { Customer } from '../../customers/entities/customer.entity';

@Entity('vehicles')
export class Vehicle extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  plate: string;

  @Column({ nullable: true })
  padron: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  vin: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: false })
  client_id: string;

  @Column({ type: 'jsonb', default: [] })
  photos: string[];

  @Column({ type: 'jsonb', default: [] })
  documents: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'client_id' })
  customer: Customer;
}
