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

  /**
   * POST /work-orders
   * Create a work order.
   * Body can include existing customer_id + vehicle_id,
   * OR inline customer{} + vehicle{} objects for auto-creation.
   * Optional items[] can also be sent.
   */
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.service.create(req.tenantId, body);
  }

  /**
   * GET /work-orders
   * List all work orders for the active company.
   * Optional query filters: ?status= &vehicle_id= &customer_id=
   */
  @Get()
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('vehicle_id') vehicle_id?: string,
    @Query('customer_id') customer_id?: string,
  ) {
    return this.service.findAll(req.tenantId, { status, vehicle_id, customer_id });
  }

  /**
   * GET /work-orders/:id
   * Get a single work order with vehicle, customer, and items populated.
   */
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.service.findOne(req.tenantId, id);
  }

  /**
   * PATCH /work-orders/:id/status
   * Transition the status following the allowed state machine.
   * Body: { "status": "in_progress" }
   * Must be declared BEFORE :id to avoid routing conflicts.
   */
  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: WorkOrderStatus,
  ) {
    return this.service.updateStatus(req.tenantId, id, status);
  }

  /**
   * PATCH /work-orders/:id/items
   * Replace all line items and recalculate totals.
   * Body: { "items": [...] }
   */
  @Patch(':id/items')
  updateItems(
    @Request() req: any,
    @Param('id') id: string,
    @Body('items') items: any[],
  ) {
    return this.service.updateItems(req.tenantId, id, items);
  }

  /**
   * PATCH /work-orders/:id
   * Update general fields (description, diagnosis, notes, dates, mileage, etc.)
   * Status, totals, and identifying fields are protected.
   */
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.update(req.tenantId, id, body);
  }

  /**
   * DELETE /work-orders/:id
   * Only allowed when status is 'pending' or 'cancelled'.
   */
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.tenantId, id);
  }
}
