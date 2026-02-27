import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async create(tenantId: string, data: Partial<Supplier>) {
    const supplier = this.repo.create({ ...data, tenant_id: tenantId });
    return await this.repo.save(supplier);
  }

  async findAll(tenantId: string) {
    return await this.repo.find({
      where: { tenant_id: tenantId },
      relations: ['materials'], // Optional: to see what they provide
    });
  }

  async findOne(tenantId: string, id: string) {
    const supplier = await this.repo.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(tenantId: string, id: string, data: Partial<Supplier>) {
    const supplier = await this.findOne(tenantId, id);
    Object.assign(supplier, data);
    return await this.repo.save(supplier);
  }

  async remove(tenantId: string, id: string) {
    const supplier = await this.findOne(tenantId, id);
    return await this.repo.remove(supplier);
  }
}
