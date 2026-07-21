import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: { onModuleInit: jest.fn() } }],
    }).compile();

    controller = module.get(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
