import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCompany } from './entities/user-companies.entity';

@Injectable()
export class UserCompaniesService {
  constructor(
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  async create(data: Partial<UserCompany>): Promise<UserCompany> {
    const existing = await this.userCompanyRepository.findOne({
      where: { user_id: data.user_id, company_id: data.company_id },
    });

    if (existing) {
      throw new BadRequestException('User is already assigned to this company');
    }

    const newUserCompany = this.userCompanyRepository.create(data);
    return await this.userCompanyRepository.save(newUserCompany);
  }

  async findAll(): Promise<UserCompany[]> {
    return await this.userCompanyRepository.find();
  }

  async findByCompany(companyId: string): Promise<UserCompany[]> {
    return await this.userCompanyRepository.find({
      where: { company_id: companyId },
      relations: ['user'],
    });
  }

  async findByUser(userId: string): Promise<UserCompany[]> {
    return await this.userCompanyRepository.find({
      where: { user_id: userId },
      relations: ['company'],
    });
  }

  async findOne(id: string): Promise<UserCompany> {
    const association = await this.userCompanyRepository.findOne({
      where: { id },
    });
    if (!association) throw new NotFoundException('Association not found');
    return association;
  }

  async findSpecific(
    user_id: string,
    company_id: string,
  ): Promise<UserCompany> {
    const association = await this.userCompanyRepository.findOne({
      where: { user_id, company_id },
    });
    if (!association) throw new NotFoundException('Association not found');
    return association;
  }

  async updateRole(id: string, role: string): Promise<UserCompany> {
    const association = await this.findOne(id);
    association.role = role;
    return await this.userCompanyRepository.save(association);
  }

  async remove(id: string): Promise<void> {
    const association = await this.findOne(id);
    await this.userCompanyRepository.remove(association);
  }

  async getMyCompanies(userId: string) {
    return await this.userCompanyRepository.find({
      where: { user_id: userId },
      relations: ['company'],
      select: {
        id: true,
        role: true,
        company_id: true,
        company: {
          name: true,
          logo: true,
        },
      },
    });
  }
}
