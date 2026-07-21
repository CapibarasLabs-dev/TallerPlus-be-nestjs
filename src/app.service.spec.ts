import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: DataSource, useValue: { query: jest.fn() } },
      ],
    }).compile();

    service = module.get(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
