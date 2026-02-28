import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Request() req: any, @Body() data: any) {
    return await this.productsService.create(req.tenantId, data);
  }

  @Get()
  async findAll(@Request() req: any) {
    // Es bueno tener un listado básico
    return await this.productsService.findAll(req.tenantId);
  }

  @Get(':id/calculate')
  async calculate(@Request() req: any, @Param('id') id: string) {
    const result = await this.productsService.calculatePrice(req.tenantId, id);
    if (!result) throw new NotFoundException('Product not found');
    return result;
  }
}
