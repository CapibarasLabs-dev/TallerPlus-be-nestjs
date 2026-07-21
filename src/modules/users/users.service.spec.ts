import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const user = {
    id: 'u-1',
    email: 'a@b.com',
    password: 'hashed',
    first_name: 'Ana',
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('create hashes password and saves', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(user);
    repo.save.mockResolvedValue(user);

    const result = await service.create({
      email: 'a@b.com',
      password: 'plain',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 'salt');
    expect(result).toEqual(user);
  });

  it('create throws if email exists', async () => {
    repo.findOne.mockResolvedValue(user);
    await expect(
      service.create({ email: 'a@b.com', password: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('findOne throws NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('findByEmail selects password fields', async () => {
    repo.findOne.mockResolvedValue(user);
    await service.findByEmail('a@b.com');
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { email: 'a@b.com' },
      select: ['id', 'email', 'password', 'first_name'],
    });
  });

  it('update re-hashes password', async () => {
    repo.findOne.mockResolvedValue({ ...user });
    repo.save.mockImplementation(async (u) => u);

    const result = await service.update('u-1', { password: 'new' });
    expect(bcrypt.hash).toHaveBeenCalledWith('new', 'salt');
    expect(result.password).toBe('hashed');
  });

  it('remove throws when not affected', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove('u-1')).rejects.toThrow(NotFoundException);
  });

  it('remove succeeds when affected', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });
    await expect(service.remove('u-1')).resolves.toBeUndefined();
  });
});
