import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('audit_logs')
export class Audit extends BaseEntity {
  @Column()
  tenantId: string;

  @Column()
  code: string; // Ej: 'PAYMENT_REMINDER'

  @Column()
  event: string; // Suceso

  @Column({ nullable: true })
  clientId: string; // Cliente involucrado [cite: 211]
}
