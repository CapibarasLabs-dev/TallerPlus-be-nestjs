import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MaterialsService } from './materials.service';
import { Material } from './entities/materials.entity';

describe('MaterialsService', () => {
  let service: MaterialsService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const material = {
    id: 'm-1',
    tenant_id: tenantId,
    title: 'Masilla',
  } as unknown as Material;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        { provide: getRepositoryToken(Material), useValue: repo },
      ],
    }).compile();
    service = module.get(MaterialsService);
  });

  it('create sets tenant_id', async () => {
    repo.create.mockReturnValue(material);
    repo.save.mockResolvedValue(material);
    await service.create(tenantId, { title: 'Masilla' });
    expect(repo.create).toHaveBeenCalledWith({
      title: 'Masilla',
      tenant_id: tenantId,
    });
  });

  it('findAll scopes by tenant', async () => {
    repo.find.mockResolvedValue([material]);
    await service.findAll(tenantId);
    expect(repo.find).toHaveBeenCalledWith({ where: { tenant_id: tenantId } });
  });

  it('findOne throws company-scoped NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 'm-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 'm-1', tenant_id: tenantId },
    });
  });

  it('update and remove use tenant scope', async () => {
    repo.findOne.mockResolvedValue({ ...material });
    repo.save.mockImplementation(async (m) => m);
    repo.remove.mockResolvedValue(material);

    await service.update(tenantId, 'm-1', { title: 'Lija' });
    await service.remove(tenantId, 'm-1');
    expect(repo.save).toHaveBeenCalled();
    expect(repo.remove).toHaveBeenCalled();
  });
});
