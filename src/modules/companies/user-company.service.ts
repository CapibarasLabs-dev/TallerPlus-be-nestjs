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

  // Assign a user to a company
  async create(data: Partial<UserCompany>): Promise<UserCompany> {
    // Check if the association already exists to avoid duplicates
    const existing = await this.userCompanyRepository.findOne({
      where: { user_id: data.user_id, company_id: data.company_id },
    });

    if (existing) {
      throw new BadRequestException('User is already assigned to this company');
    }

    const newUserCompany = this.userCompanyRepository.create(data);
    return await this.userCompanyRepository.save(newUserCompany);
  }

  //Get all relations
  async findAll(): Promise<UserCompany[]> {
    return await this.userCompanyRepository.find();
  }

  // Get all users for a specific company
  async findByCompany(companyId: string): Promise<UserCompany[]> {
    return await this.userCompanyRepository.find({
      where: { company_id: companyId },
      relations: ['user'], // Includes basic user info
    });
  }

  // Get all companies for a specific user
  async findByUser(userId: string): Promise<UserCompany[]> {
    return await this.userCompanyRepository.find({
      where: { user_id: userId },
      relations: ['company'], // Includes basic company info
    });
  }

  // Find a specific association
  async findOne(id: string): Promise<UserCompany> {
    const association = await this.userCompanyRepository.findOne({
      where: { id },
    });
    if (!association) throw new NotFoundException('Association not found');
    return association;
  }

  // Find a specific association by user and company
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

  // Update role (e.g., change GUEST to OWNER)
  async updateRole(id: string, role: string): Promise<UserCompany> {
    const association = await this.findOne(id);
    association.role = role;
    return await this.userCompanyRepository.save(association);
  }

  // Remove a user from a company
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
