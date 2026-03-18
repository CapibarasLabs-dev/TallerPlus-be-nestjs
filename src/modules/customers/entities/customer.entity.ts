// src/modules/customers/entities/customer.entity.ts
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Company } from '../../companies/entities/company.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column()
  tenant_id: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  document_type: string;

  @Column({ nullable: true })
  document_number: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'tenant_id' })
  company: Company;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.client_id)
  vehicles: Vehicle[];
}
