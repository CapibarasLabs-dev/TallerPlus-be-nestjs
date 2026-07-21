import { Test, TestingModule } from '@nestjs/testing';
import { UserCompaniesController } from './user-company.controller';
import { UserCompaniesService } from './user-company.service';

describe('UserCompaniesController', () => {
  let controller: UserCompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCompaniesController],
      providers: [
        {
          provide: UserCompaniesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByCompany: jest.fn(),
            findByUser: jest.fn(),
            updateRole: jest.fn(),
            remove: jest.fn(),
            getMyCompanies: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UserCompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
