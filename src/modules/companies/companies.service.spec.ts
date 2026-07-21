import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

describe('CompaniesService', () => {
  let service: CompaniesService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const company = {
    id: 'c-1',
    name: 'Taller',
    rut: '123',
  } as Company;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: getRepositoryToken(Company), useValue: repo },
      ],
    }).compile();
    service = module.get(CompaniesService);
  });

  it('create rejects duplicate RUT', async () => {
    repo.findOne.mockResolvedValue(company);
    await expect(
      service.create({ name: 'X', rut: '123' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create saves when RUT free', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(company);
    repo.save.mockResolvedValue(company);

    await expect(
      service.create({ name: 'Taller', rut: '123' }),
    ).resolves.toEqual(company);
  });

  it('findOne throws NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('update assigns and saves', async () => {
    repo.findOne.mockResolvedValue({ ...company });
    repo.save.mockImplementation(async (c) => c);
    const result = await service.update('c-1', { name: 'Nuevo' });
    expect(result.name).toBe('Nuevo');
  });

  it('remove deletes existing', async () => {
    repo.findOne.mockResolvedValue(company);
    repo.remove.mockResolvedValue(company);
    await service.remove('c-1');
    expect(repo.remove).toHaveBeenCalledWith(company);
  });
});
