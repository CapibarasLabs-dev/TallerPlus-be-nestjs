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
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.vehiclesService.create(req.tenantId, data);
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
  addPhotos(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { urls: string[] },
  ) {
    return this.vehiclesService.addPhotos(req.tenantId, id, body.urls);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.vehiclesService.remove(req.tenantId, id);
  }
}
