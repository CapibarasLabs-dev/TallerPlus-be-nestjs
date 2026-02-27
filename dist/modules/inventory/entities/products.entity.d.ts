import { BaseEntity } from '../../../common/base.entity';
export declare class Product extends BaseEntity {
  tenantId: string;
  title: string;
  price: number;
  currencyRate: number;
  categories: string[];
  materials: {
    materialId: string;
    quantity: number;
  }[];
  photos: string[];
  parentId: string;
  parent: Product;
  variants: Product[];
}
