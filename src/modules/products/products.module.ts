// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/products.entity';
import { ProductMaterial } from '../inventory/entities/products-materials.entity';
import { FixedCostModule } from '../finance/fixed-costs.module';
import { CompaniesModule } from '../companies/companies.modules';
import { UserCompaniesModule } from '../companies/user-company.modules';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductMaterial]),
    FixedCostModule,
    CompaniesModule,
    UserCompaniesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
