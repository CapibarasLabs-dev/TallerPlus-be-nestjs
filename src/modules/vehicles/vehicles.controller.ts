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
import { VehiclesService } from './vehicles.service';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 10 },
      { name: 'documents', maxCount: 5 },
    ]),
  )
  create(
    @Request() req: any,
    @Body() data: any,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.vehiclesService.create(
      req.tenantId,
      data,
      files.photos || [],
      files.documents || [],
    );
  }

  @Get()
  findAll(@Request() req: any) {
    return this.vehiclesService.findAll(req.tenantId);
  }

  @Get(':plate')
  findOne(@Request() req: any, @Param('plate') plate: string) {
    return this.vehiclesService.findByPlate(req.tenantId, plate);
  }

  @Patch(':id/photos')
  @UseInterceptors(FilesInterceptor('files'))
  async addPhotos(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.vehiclesService.addPhotos(req.tenantId, id, files);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.vehiclesService.remove(req.tenantId, id);
  }
}
