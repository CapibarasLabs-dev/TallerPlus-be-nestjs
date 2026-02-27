import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCompaniesService } from './user-company.service';
import { UserCompaniesController } from './user-company.controller';
import { UserCompany } from './entities/user-companies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCompany])],
  controllers: [UserCompaniesController],
  providers: [UserCompaniesService],
  exports: [UserCompaniesService], // Exported for use in Auth or Register logic
})
export class UserCompaniesModule {}
