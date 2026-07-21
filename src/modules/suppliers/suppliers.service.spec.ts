import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';

describe('SuppliersService', () => {
  let service: SuppliersService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const supplier = {
    id: 's-1',
    tenant_id: tenantId,
    name: 'Pinturas SA',
  } as Supplier;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: getRepositoryToken(Supplier), useValue: repo },
      ],
    }).compile();
    service = module.get(SuppliersService);
  });

  it('create sets tenant_id', async () => {
    repo.create.mockReturnValue(supplier);
    repo.save.mockResolvedValue(supplier);
    await service.create(tenantId, { name: 'Pinturas SA' });
    expect(repo.create).toHaveBeenCalledWith({
      name: 'Pinturas SA',
      tenant_id: tenantId,
    });
  });

  it('findAll scopes and loads materials', async () => {
    repo.find.mockResolvedValue([supplier]);
    await service.findAll(tenantId);
    expect(repo.find).toHaveBeenCalledWith({
      where: { tenant_id: tenantId },
      relations: ['materials'],
    });
  });

  it('findOne throws when missing for tenant', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 's-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update and remove work for tenant resource', async () => {
    repo.findOne.mockResolvedValue({ ...supplier });
    repo.save.mockImplementation(async (s) => s);
    repo.remove.mockResolvedValue(supplier);

    await service.update(tenantId, 's-1', { name: 'Nuevo' });
    await service.remove(tenantId, 's-1');
    expect(repo.save).toHaveBeenCalled();
    expect(repo.remove).toHaveBeenCalledWith(expect.objectContaining({ id: 's-1' }));
  });
});
