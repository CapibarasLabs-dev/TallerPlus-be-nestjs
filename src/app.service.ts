import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    console.log('--- Testing connection ---');
    try {
      const time = await this.dataSource.query('SELECT NOW()');
      console.log('Datetime in DB:', time[0].now);
      const tables = await this.dataSource.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
      );
      console.log(
        'Tables:',
        tables.map((t) => t.table_name),
      );
    } catch (error) {
      console.error('Error during the DB tests: ', error);
    }
  }
}
