import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { Material } from './entities/materials.entity';
import { UserCompaniesModule } from '../companies/user-company.modules';

@Module({
  imports: [TypeOrmModule.forFeature([Material]), UserCompaniesModule],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
