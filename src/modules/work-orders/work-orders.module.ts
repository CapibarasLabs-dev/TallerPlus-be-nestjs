import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrderItem } from './entities/work-order-item.entity';
import { UserCompaniesModule } from '../companies/user-company.modules';
import { CustomersModule } from '../customers/customers.module';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrder, WorkOrderItem]),
    UserCompaniesModule,
    CustomersModule,
    VehiclesModule,
  ],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
