// src/modules/finance/fixed-costs.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FixedCostsService } from './fixed-costs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('fixed-costs')
@UseGuards(JwtAuthGuard, TenantGuard) // Protected area
export class FixedCostsController {
  constructor(private readonly fixedCostsService: FixedCostsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.fixedCostsService.findAll(req.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.fixedCostsService.create(req.tenantId, data);
  }

  @Get('total')
  getTotal(@Request() req: any) {
    return this.fixedCostsService.getTotalMonthly(req.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fixedCostsService.remove(id);
  }
}
