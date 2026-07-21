import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const customer = {
    id: 'cu-1',
    tenant_id: tenantId,
    full_name: 'Juan',
  } as unknown as Customer;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getRepositoryToken(Customer), useValue: repo },
      ],
    }).compile();
    service = module.get(CustomersService);
  });

  it('create sets tenant_id', async () => {
    repo.create.mockReturnValue(customer);
    repo.save.mockResolvedValue(customer);
    await service.create(tenantId, { full_name: 'Juan' });
    expect(repo.create).toHaveBeenCalledWith({
      full_name: 'Juan',
      tenant_id: tenantId,
    });
  });

  it('findAll scopes by tenant', async () => {
    repo.find.mockResolvedValue([customer]);
    await service.findAll(tenantId);
    expect(repo.find).toHaveBeenCalledWith({ where: { tenant_id: tenantId } });
  });

  it('findOne scopes and throws NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 'cu-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 'cu-1', tenant_id: tenantId },
      relations: ['vehicles'],
    });
  });

  it('update and remove use tenant-scoped findOne', async () => {
    repo.findOne.mockResolvedValue({ ...customer });
    repo.save.mockImplementation(async (c) => c);
    repo.remove.mockResolvedValue(customer);

    await service.update(tenantId, 'cu-1', { full_name: 'Pedro' });
    await service.remove(tenantId, 'cu-1');
    expect(repo.save).toHaveBeenCalled();
    expect(repo.remove).toHaveBeenCalled();
  });
});
