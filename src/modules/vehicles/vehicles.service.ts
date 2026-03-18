import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  async create(tenantId: string, data: Partial<Vehicle>) {
    const vehicle = this.repo.create({ ...data, tenant_id: tenantId });
    return await this.repo.save(vehicle);
  }

  async findAll(tenantId: string) {
    return await this.repo.find({ where: { tenant_id: tenantId } });
  }

  async findByPlate(tenantId: string, plate: string) {
    const vehicle = await this.repo.findOne({
      where: { tenant_id: tenantId, plate: plate.toUpperCase() },
    });
    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    return vehicle;
  }

  async addPhotos(tenantId: string, vehicleId: string, newPhotos: string[]) {
    const vehicle = await this.repo.findOne({
      where: { id: vehicleId, tenant_id: tenantId },
    });
    vehicle.photos = [...vehicle.photos, ...newPhotos];
    return await this.repo.save(vehicle);
  }

  async remove(tenantId: string, id: string) {
    const vehicle = await this.repo.findOne({
      where: { id, tenant_id: tenantId },
    });
    return await this.repo.remove(vehicle);
  }
}
