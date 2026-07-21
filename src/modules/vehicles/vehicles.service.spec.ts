import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';

const uploadMock = jest.fn().mockResolvedValue('https://cdn/file.jpg');

jest.mock('../../common/uploadFileToBucket', () => ({
  gcpBucketClass: jest.fn().mockImplementation(() => ({
    uploadFileFromBuffer: uploadMock,
  })),
}));

describe('VehiclesService', () => {
  let service: VehiclesService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const vehicle = {
    id: 'v-1',
    tenant_id: tenantId,
    plate: 'ABC1234',
    photos: ['https://cdn/old.jpg'],
    documents: [],
  } as Vehicle;

  beforeEach(async () => {
    jest.clearAllMocks();
    uploadMock.mockResolvedValue('https://cdn/file.jpg');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: getRepositoryToken(Vehicle), useValue: repo },
      ],
    }).compile();
    service = module.get(VehiclesService);
  });

  it('create uploads files and sets tenant_id', async () => {
    repo.create.mockImplementation((d) => d);
    repo.save.mockImplementation(async (v) => ({ id: 'v-1', ...v }));

    const photo = {
      buffer: Buffer.from('x'),
      originalname: 'a.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const result = await service.create(
      tenantId,
      { plate: 'abc1234' },
      [photo],
      [],
    );

    expect(uploadMock).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: tenantId,
        photos: ['https://cdn/file.jpg'],
        documents: [],
      }),
    );
    expect(result.id).toBe('v-1');
  });

  it('findByPlate uppercases and scopes tenant', async () => {
    repo.findOne.mockResolvedValue(vehicle);
    await service.findByPlate(tenantId, 'abc1234');
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { tenant_id: tenantId, plate: 'ABC1234' },
      relations: ['customer'],
    });
  });

  it('findByPlate throws NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findByPlate(tenantId, 'ZZZ')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findById throws NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById(tenantId, 'v-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update uppercases plate and strips protected fields', async () => {
    repo.findOne.mockResolvedValue({ ...vehicle });
    repo.save.mockImplementation(async (v) => v);

    const result = await service.update(tenantId, 'v-1', {
      plate: ' xyz999 ',
      tenant_id: 'hack',
      photos: ['nope'],
    } as any);

    expect(result.plate).toBe('XYZ999');
    expect(result.tenant_id).toBe(tenantId);
    expect(result.photos).toEqual(['https://cdn/old.jpg']);
  });

  it('addPhotos appends uploaded urls', async () => {
    repo.findOne.mockResolvedValue({ ...vehicle, photos: ['old'] });
    repo.save.mockImplementation(async (v) => v);

    const result = await service.addPhotos(tenantId, 'v-1', [
      {
        buffer: Buffer.from('x'),
        originalname: 'b.jpg',
        mimetype: 'image/jpeg',
      },
    ]);

    expect(result.photos).toEqual(['old', 'https://cdn/file.jpg']);
  });

  it('findAll scopes by tenant', async () => {
    repo.find.mockResolvedValue([vehicle]);
    await service.findAll(tenantId);
    expect(repo.find).toHaveBeenCalledWith({ where: { tenant_id: tenantId } });
  });
});
