// src/modules/finance/fixed-costs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedCost } from './entities/fixed-costs.entity';
import { animationFrameScheduler } from 'rxjs';

@Injectable()
export class FixedCostsService {
  constructor(
    @InjectRepository(FixedCost)
    private readonly repo: Repository<FixedCost>,
  ) {}

  // List all costs for the active business
  async findAll(companyId: string) {
    return await this.repo.findOne({ where: { tenant_id: companyId } });
  }

  // Create a new fixed cost
  async create(companyId: string, data: Partial<FixedCost>) {
    try {
      const newCost = this.repo.create({ ...data, tenant_id: companyId });
      return await this.repo.save(newCost);
    } catch (error) {
      throw new Error(`Failed to create fixed cost: ${error.message}`);
    }
  }

  // Calculate total monthly fixed costs (The engine for the calculator)
  async getTotalMonthly(companyId: string): Promise<number> {
    const costs = await this.findAll(companyId);

    if (!costs) {
      return 0;
    }

    const fixedcosts = Object.values(costs).reduce(
      (acc, cost) => acc + (typeof cost == 'number' ? cost : 0),
      0,
    );

    const others =
      costs.others?.reduce(
        (acc, cost) => acc + (typeof cost?.cost == 'number' ? cost.cost : 0),
        0,
      ) || 0;

    const total = fixedcosts + others;
    return total;
  }

  async remove(id: string) {
    return await this.repo.delete({ id });
  }
}
