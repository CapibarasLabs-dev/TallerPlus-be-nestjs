// src/modules/inventory/materials.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('materials')
@UseGuards(JwtAuthGuard, TenantGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.materialsService.create(req.tenantId, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.materialsService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.materialsService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.materialsService.update(req.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.materialsService.remove(req.tenantId, id);
  }
}
