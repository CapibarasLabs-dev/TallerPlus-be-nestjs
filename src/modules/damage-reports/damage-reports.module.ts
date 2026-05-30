import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DamageReportsService } from './damage-reports.service';
import { DamageReportsController } from './damage-reports.controller';
import { DamageReport } from './entities/damage-report.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { UserCompaniesModule } from '../companies/user-company.modules';

@Module({
  imports: [
    TypeOrmModule.forFeature([DamageReport]),
    VehiclesModule,
    UserCompaniesModule,
  ],
  controllers: [DamageReportsController],
  providers: [DamageReportsService],
  exports: [DamageReportsService],
})
export class DamageReportsModule {}
