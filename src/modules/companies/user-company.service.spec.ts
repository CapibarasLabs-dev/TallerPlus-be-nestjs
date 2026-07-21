import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserCompaniesService } from './user-company.service';
import { UserCompany } from './entities/user-companies.entity';

describe('UserCompaniesService', () => {
  let service: UserCompaniesService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const link = {
    id: 'uc-1',
    user_id: 'u-1',
    company_id: 'c-1',
    role: 'OWNER',
  } as UserCompany;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCompaniesService,
        { provide: getRepositoryToken(UserCompany), useValue: repo },
      ],
    }).compile();
    service = module.get(UserCompaniesService);
  });

  it('create rejects duplicate assignment', async () => {
    repo.findOne.mockResolvedValue(link);
    await expect(
      service.create({ user_id: 'u-1', company_id: 'c-1', role: 'OWNER' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create saves new link', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(link);
    repo.save.mockResolvedValue(link);
    await expect(
      service.create({ user_id: 'u-1', company_id: 'c-1', role: 'OWNER' }),
    ).resolves.toEqual(link);
  });

  it('findByCompany loads user relation', async () => {
    repo.find.mockResolvedValue([link]);
    await service.findByCompany('c-1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { company_id: 'c-1' },
      relations: ['user'],
    });
  });

  it('findSpecific throws NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findSpecific('u-1', 'c-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updateRole saves new role', async () => {
    repo.findOne.mockResolvedValue({ ...link });
    repo.save.mockImplementation(async (a) => a);
    const result = await service.updateRole('uc-1', 'ADMIN');
    expect(result.role).toBe('ADMIN');
  });

  it('getMyCompanies scopes by user', async () => {
    repo.find.mockResolvedValue([]);
    await service.getMyCompanies('u-1');
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: 'u-1' },
        relations: ['company'],
      }),
    );
  });
});
