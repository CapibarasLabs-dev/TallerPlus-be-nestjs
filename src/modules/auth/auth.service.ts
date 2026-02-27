// src/modules/auth/auth.service.ts
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { UserCompaniesService } from '../companies/user-company.service';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private userCompaniesService: UserCompaniesService,
    private jwtService: JwtService,
  ) {}

  async registerOwner(registerDto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the Company
      const company = await this.companiesService.create({
        name: registerDto.companyName,
        location: registerDto.location,
      });

      // 2. Create the User (Owner)
      const user = await this.usersService.create({
        first_name: registerDto.first_name,
        last_name: registerDto.last_name,
        phone: registerDto.phone,
        email: registerDto.email,
        password: registerDto.password,
      });

      // 3. Link them in UserCompany table
      await this.userCompaniesService.create({
        user_id: user.id,
        company_id: company.id,
        role: 'OWNER',
      });

      await queryRunner.commitTransaction();
      return { user, company };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Registration failed: ' + err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
    };

    console.log('payload', payload);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        ...user,
      },
    };
  }
}
