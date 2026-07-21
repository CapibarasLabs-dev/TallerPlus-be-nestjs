import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { UserCompaniesService } from '../companies/user-company.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };
  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };
  const companiesService = { create: jest.fn() };
  const userCompaniesService = { create: jest.fn() };
  const jwtService = { signAsync: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DataSource,
          useValue: { createQueryRunner: () => queryRunner },
        },
        { provide: UsersService, useValue: usersService },
        { provide: CompaniesService, useValue: companiesService },
        { provide: UserCompaniesService, useValue: userCompaniesService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('registerOwner', () => {
    it('creates company, user, OWNER link and commits', async () => {
      companiesService.create.mockResolvedValue({ id: 'c-1' });
      usersService.create.mockResolvedValue({ id: 'u-1' });
      userCompaniesService.create.mockResolvedValue({});

      const result = await service.registerOwner({
        companyName: 'Taller',
        location: 'MVD',
        first_name: 'Ana',
        last_name: 'Perez',
        email: 'a@b.com',
        password: 'x',
      });

      expect(userCompaniesService.create).toHaveBeenCalledWith({
        user_id: 'u-1',
        company_id: 'c-1',
        role: 'OWNER',
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual({
        user: { id: 'u-1' },
        company: { id: 'c-1' },
      });
    });

    it('rolls back and throws InternalServerError on failure', async () => {
      companiesService.create.mockRejectedValue(new Error('boom'));

      await expect(
        service.registerOwner({ companyName: 'X' }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns token when password matches', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'u-1',
        email: 'a@b.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login('a@b.com', 'plain');
      expect(result.access_token).toBe('jwt-token');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'u-1',
        email: 'a@b.com',
      });
    });

    it('throws Unauthorized when password mismatch', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'u-1',
        email: 'a@b.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
