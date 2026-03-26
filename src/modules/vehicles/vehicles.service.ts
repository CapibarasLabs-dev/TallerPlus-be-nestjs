import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { gcpBucketClass } from '../../common/uploadFileToBucket';
import { randomUUID } from 'crypto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  async create(
    tenantId: string,
    data: Partial<Vehicle>,
    photos: Express.Multer.File[],
    documents: Express.Multer.File[],
  ) {
    const bucket = new gcpBucketClass();
    const plateFolder = data.plate || randomUUID();

    const uploadProcess = async (
      files: Express.Multer.File[],
      folder: string,
    ) => {
      const urls: string[] = [];
      for (const file of files) {
        const destFileName = `vehicles/${plateFolder}/${folder}/${Date.now()}-${file.originalname}`;
        const url = await bucket.uploadFileFromBuffer(
          file.buffer,
          destFileName,
          process.env.GCP_VEHICLES_BUCKET,
          file.mimetype,
        );
        urls.push(url as string);
      }
      return urls;
    };

    const photosUrls = await uploadProcess(photos, 'photos');
    const documentsUrls = await uploadProcess(documents, 'documents');

    const vehicle = this.repo.create({
      ...data,
      photos: photosUrls,
      documents: documentsUrls,
      tenant_id: tenantId,
    });

    return await this.repo.save(vehicle);
  }

  async findAll(tenantId: string) {
    return await this.repo.find({ where: { tenant_id: tenantId } });
  }

  async findByPlate(tenantId: string, plate: string) {
    const vehicle = await this.repo.findOne({
      where: { tenant_id: tenantId, plate: plate.toUpperCase() },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async addPhotos(tenantId: string, vehicleId: string, newPhotos: any[]) {
    const vehicle = await this.repo.findOne({
      where: { id: vehicleId, tenant_id: tenantId },
    });

    console.log('vehicle', vehicle);
    let uploadedUrls: string[] = [];

    try {
      const bucket = new gcpBucketClass();

      for (const file of newPhotos) {
        const destFileName = `vehicles/${vehicle.plate || vehicle.vin || randomUUID()}/${Date.now()}-${file.originalname}`;
        const url = await bucket.uploadFileFromBuffer(
          file.buffer,
          destFileName,
          process.env.GCP_VEHICLES_BUCKET,
          file.mimetype,
        );
        uploadedUrls.push(url as string);
      }
    } catch (e) {
      throw new Error(e.message);
    }

    console.info('uploadedURLs', uploadedUrls);
    vehicle.photos = [...vehicle.photos, ...uploadedUrls];
    return await this.repo.save(vehicle);
  }

  async remove(tenantId: string, id: string) {
    const vehicle = await this.repo.findOne({
      where: { id, tenant_id: tenantId },
    });
    return await this.repo.remove(vehicle);
  }
}
