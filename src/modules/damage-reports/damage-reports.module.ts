import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DamageReportsService } from './damage-reports.service';
import { DamageReportsController } from './damage-reports.controller';
import { DamageReport } from './entities/damage-report.entity';
import { DamageReportItem } from './entities/damage-report-item.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { UserCompaniesModule } from '../companies/user-company.modules';
import { CompaniesModule } from '../companies/companies.modules';
import { InsuranceModule } from '../insurance/insurance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DamageReport, DamageReportItem]),
    VehiclesModule,
    UserCompaniesModule,
    CompaniesModule,
    InsuranceModule,
  ],
  controllers: [DamageReportsController],
  providers: [DamageReportsService],
  exports: [DamageReportsService],
})
export class DamageReportsModule {}
