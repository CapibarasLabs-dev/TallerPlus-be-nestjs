import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DamageReport } from './entities/damage-report.entity';
import { gcpBucketClass } from '../../common/uploadFileToBucket';
import { randomUUID } from 'crypto';

@Injectable()
export class DamageReportsService {
  constructor(
    @InjectRepository(DamageReport)
    private readonly repo: Repository<DamageReport>,
  ) {}

  async create(
    tenantId: string,
    data: Partial<DamageReport>,
    photos: Express.Multer.File[] = [],
  ) {
    // Validate that vehicle_id is provided
    if (!data.vehicle_id) {
      throw new BadRequestException('vehicle_id is required');
    }

    const bucket = new gcpBucketClass();
    let photosUrls: string[] = [];

    // Upload photos if provided
    if (photos && photos.length > 0) {
      photosUrls = await this.uploadPhotos(photos, data.vehicle_id, bucket);
    }

    // Generate report number if not provided
    if (!data.report_number) {
      data.report_number = `DMG-${Date.now()}-${randomUUID().slice(0, 8)}`;
    }

    const damageReport = this.repo.create({
      ...data,
      photos: photosUrls,
      tenant_id: tenantId,
    });

    return await this.repo.save(damageReport);
  }

  async findAll(tenantId: string) {
    return await this.repo.find({
      where: { tenant_id: tenantId },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByVehicle(tenantId: string, vehicleId: string) {
    return await this.repo.find({
      where: { tenant_id: tenantId, vehicle_id: vehicleId },
      order: { report_date: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const damageReport = await this.repo.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['vehicle'],
    });

    if (!damageReport) {
      throw new NotFoundException('Damage report not found');
    }

    return damageReport;
  }

  async update(tenantId: string, id: string, data: Partial<DamageReport>) {
    const damageReport = await this.findOne(tenantId, id);

    Object.assign(damageReport, data);

    return await this.repo.save(damageReport);
  }

  async addPhotos(
    tenantId: string,
    damageReportId: string,
    newPhotos: Express.Multer.File[] = [],
  ) {
    const damageReport = await this.findOne(tenantId, damageReportId);

    if (!newPhotos || newPhotos.length === 0) {
      throw new BadRequestException('No photos provided');
    }

    try {
      const bucket = new gcpBucketClass();
      const uploadedUrls = await this.uploadPhotos(
        newPhotos,
        damageReport.vehicle_id,
        bucket,
      );

      damageReport.photos = [...damageReport.photos, ...uploadedUrls];
      return await this.repo.save(damageReport);
    } catch (e) {
      throw new BadRequestException(`Failed to upload photos: ${e.message}`);
    }
  }

  async remove(tenantId: string, id: string) {
    const damageReport = await this.findOne(tenantId, id);
    return await this.repo.remove(damageReport);
  }

  /**
   * Helper method to upload photos to GCP bucket
   */
  private async uploadPhotos(
    files: Express.Multer.File[],
    vehicleId: string,
    bucket: gcpBucketClass,
  ): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
      const destFileName = `damage-reports/${vehicleId}/${Date.now()}-${file.originalname}`;
      const url = await bucket.uploadFileFromBuffer(
        file.buffer,
        destFileName,
        process.env.GCP_VEHICLES_BUCKET,
        file.mimetype,
      );
      urls.push(url as string);
    }

    return urls;
  }
}
