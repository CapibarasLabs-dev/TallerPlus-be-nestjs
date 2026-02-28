import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { FixedCostsService } from '../finance/fixed-costs.service';
import { CompaniesService } from '../companies/companies.service';
import { Product } from './entities/products.entity';
import { ProductMaterial } from '../inventory/entities/products-materials.entity';

@Injectable()
export class ProductsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly fixedCostsService: FixedCostsService,
    private readonly companiesService: CompaniesService,
  ) {}

  async create(tenantId: string, data: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the Product head
      const newProduct = this.productRepo.create({
        title: data.title,
        labor_hours: data.labor_hours,
        profit_margin: data.profit_margin,
        tenant_id: tenantId,
      });
      const savedProduct = await queryRunner.manager.save(newProduct);

      if (data.materials && data.materials.length > 0) {
        const recipe = data.materials.map((m) => {
          return queryRunner.manager.create(ProductMaterial, {
            product_id: savedProduct.id,
            material_id: m.material_id,
            quantity_used: m.quantity_used,
          });
        });
        await queryRunner.manager.save(recipe);
      }

      await queryRunner.commitTransaction();
      return savedProduct;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error creating product recipe: ' + err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(tenant_id: string): Promise<Product[]> {
    return await this.productRepo.find({ where: { tenant_id } });
  }

  async calculatePrice(tenantId: string, productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId, tenant_id: tenantId },
      relations: ['materials', 'materials.material'],
    });

    // Get global settings from Company
    const company = await this.companiesService.findOne(tenantId);

    // 1. Sum materials
    const materialCost = product.materials.reduce((acc, pm) => {
      return acc + pm.material.unit_cost * pm.quantity_used;
    }, 0);

    // 2. Sum labor (based on Company config)
    //TODO - A MEJORAR LA LOGICA DE NEGOCIO, FABIANA TRABAJARÁ EN REALIZAR DICHA PARTE.
    const totalFixed = await this.fixedCostsService.getTotalMonthly(tenantId);
    const costPerHour = totalFixed / (company.monthly_working_hours || 160);
    const laborCost = product.labor_hours * costPerHour;

    const totalCost = materialCost + laborCost;
    const suggestedPrice = materialCost * (1 + product.profit_margin / 100);

    return {
      product: product.title,
      currency: company.currency,
      analysis: {
        materialCost,
        laborCost,
        totalCost,
        marginApplied: `${product.profit_margin}%`,
        suggestedPrice: Math.round(suggestedPrice),
      },
    };
  }
}
