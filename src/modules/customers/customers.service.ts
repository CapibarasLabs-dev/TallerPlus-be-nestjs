// src/modules/customers/customers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async create(tenantId: string, data: Partial<Customer>) {
    const customer = this.repo.create({ ...data, tenant_id: tenantId });
    return await this.repo.save(customer);
  }

  async findAll(tenantId: string) {
    return await this.repo.find({ where: { tenant_id: tenantId } });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.repo.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['vehicles'],
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return customer;
  }

  async update(tenantId: string, id: string, data: Partial<Customer>) {
    const customer = await this.findOne(tenantId, id);
    Object.assign(customer, data);
    return await this.repo.save(customer);
  }

  async remove(tenantId: string, id: string) {
    const customer = await this.findOne(tenantId, id);
    return await this.repo.remove(customer);
  }
}
