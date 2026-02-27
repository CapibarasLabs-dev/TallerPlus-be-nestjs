// src/modules/suppliers/suppliers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';

import { Supplier } from './entities/supplier.entity';
import { UserCompaniesModule } from '../companies/user-company.modules';
import { SuppliersController } from './suppliers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier]), UserCompaniesModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
