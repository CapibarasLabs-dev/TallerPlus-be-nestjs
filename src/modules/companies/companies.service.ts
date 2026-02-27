import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createDto: Partial<Company>): Promise<Company> {
    if (createDto.rut) {
      const exists = await this.companyRepository.findOne({
        where: { rut: createDto.rut },
      });
      if (exists) throw new BadRequestException('RUT already exists');
    }
    const company = this.companyRepository.create(createDto);
    return await this.companyRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, updateDto: Partial<Company>): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateDto);
    return await this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companyRepository.remove(company);
  }
}
