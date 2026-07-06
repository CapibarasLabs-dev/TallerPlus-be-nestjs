import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrderStatus } from './entities/work-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WorkOrdersController {
  constructor(private readonly service: WorkOrdersService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.service.create(req.tenantId, body);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('vehicle_id') vehicle_id?: string,
    @Query('customer_id') customer_id?: string,
  ) {
    return this.service.findAll(req.tenantId, {
      status,
      vehicle_id,
      customer_id,
    });
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.service.findOne(req.tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: WorkOrderStatus,
  ) {
    return this.service.updateStatus(req.tenantId, id, status);
  }

  @Patch(':id/items')
  updateItems(
    @Request() req: any,
    @Param('id') id: string,
    @Body('items') items: any[],
  ) {
    return this.service.updateItems(req.tenantId, id, items);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.update(req.tenantId, id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.tenantId, id);
  }
}
