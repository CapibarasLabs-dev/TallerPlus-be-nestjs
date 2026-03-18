import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.modules';
import { CompaniesModule } from './modules/companies/companies.modules';
import { UserCompaniesModule } from './modules/companies/user-company.modules';
import { AuthModule } from './modules/auth/auth.module';
import { FixedCostModule } from './modules/finance/fixed-costs.module';
import { MaterialsModule } from './modules/inventory/materials.module';
import { SuppliersModule } from './modules/suppliers/suppliers.controller';
import { ProductsModule } from './modules/products/products.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CustomersModule } from './modules/customers/customers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    UsersModule,
    CompaniesModule,
    UserCompaniesModule,
    AuthModule,
    FixedCostModule,
    MaterialsModule,
    SuppliersModule,
    ProductsModule,
    PaymentsModule,
    CustomersModule,
    VehiclesModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
