import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DamageReportsService } from './damage-reports.service';
import {
  AddDamageReportItemsDto,
  CreateDamageReportDto,
  UpdateDamageReportDto,
  UpdateDamageReportStatusDto,
} from './dto/damage-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('damage-reports')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DamageReportsController {
  constructor(private readonly damageReportsService: DamageReportsService) {}

  @Post()
  create(@Request() req: any, @Body() body: CreateDamageReportDto) {
    return this.damageReportsService.create(req.tenantId, body);
  }

  @Post(':id/items')
  addItems(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: AddDamageReportItemsDto,
  ) {
    return this.damageReportsService.addItems(req.tenantId, id, body);
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
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateDamageReportDto,
  ) {
    return this.damageReportsService.update(req.tenantId, id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateDamageReportStatusDto,
  ) {
    return this.damageReportsService.updateStatus(req.tenantId, id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.damageReportsService.remove(req.tenantId, id);
  }
}
