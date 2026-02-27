import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedCostsController } from './fixed-costs.controller';
import { FixedCost } from './entities/fixed-costs.entity';
import { FixedCostsService } from './fixed-costs.service';
import { UserCompaniesModule } from '../companies/user-company.modules';

@Module({
  imports: [TypeOrmModule.forFeature([FixedCost]), UserCompaniesModule],
  controllers: [FixedCostsController],
  providers: [FixedCostsService],
  exports: [FixedCostsService],
})
export class FixedCostModule {}
