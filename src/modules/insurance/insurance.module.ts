import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceCompany } from './entities/insurance-company.entity';
import { InsuranceBareme } from './entities/insurance-bareme.entity';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { UserCompaniesModule } from '../companies/user-company.modules';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsuranceCompany, InsuranceBareme]),
    UserCompaniesModule,
  ],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
