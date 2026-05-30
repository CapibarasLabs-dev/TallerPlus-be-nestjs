import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { DamageReportsService } from './damage-reports.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('damage-reports')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DamageReportsController {
  constructor(private readonly damageReportsService: DamageReportsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10))
  create(
    @Request() req: any,
    @Body() data: any,
    @UploadedFiles() photos: Express.Multer.File[] = [],
  ) {
    return this.damageReportsService.create(req.tenantId, data, photos);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.damageReportsService.findAll(req.tenantId);
  }

  @Get('vehicle/:vehicleId')
  findByVehicle(@Request() req: any, @Param('vehicleId') vehicleId: string) {
    return this.damageReportsService.findByVehicle(req.tenantId, vehicleId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.damageReportsService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.damageReportsService.update(req.tenantId, id, data);
  }

  @Patch(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 10))
  addPhotos(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFiles() newPhotos: Express.Multer.File[] = [],
  ) {
    return this.damageReportsService.addPhotos(req.tenantId, id, newPhotos);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.damageReportsService.remove(req.tenantId, id);
  }
}
