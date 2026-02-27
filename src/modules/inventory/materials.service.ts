import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/materials.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly repo: Repository<Material>,
  ) {}

  // List materials for the active tenant
  async findAll(tenantId: string): Promise<Material[]> {
    return await this.repo.find({ where: { tenant_id: tenantId } });
  }

  // Create a new material
  async create(tenantId: string, data: Partial<Material>): Promise<Material> {
    const material = this.repo.create({ ...data, tenant_id: tenantId });
    return await this.repo.save(material);
  }

  // Find one by ID ensuring it belongs to the tenant
  async findOne(tenantId: string, id: string): Promise<Material> {
    const material = await this.repo.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!material)
      throw new NotFoundException('Material not found for this company');
    return material;
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<Material>,
  ): Promise<Material> {
    const material = await this.findOne(tenantId, id);
    Object.assign(material, data);
    return await this.repo.save(material);
  }

  async remove(tenantId: string, id: string) {
    const material = await this.findOne(tenantId, id);
    return await this.repo.remove(material);
  }
}
