import { DamageReportStatus } from '../entities/damage-report.entity';
import { DamageReportOperationType } from '../entities/damage-report-item.entity';

export class CreateDamageReportItemDto {
  description: string;
  operation_type: DamageReportOperationType;
  hours_suggested?: number;
  unit_price?: number;
  supplier_name?: string | null;
  item_photos?: string[];
}

export class CreateDamageReportDto {
  vehicle_id: string;
  insurance_company_id: string;
  siniestro_number: string;
  observations?: string | null;
  general_photos?: string[];
  /** Override; defaults to Company.default_tax_percent. */
  tax_percent?: number;
  items?: CreateDamageReportItemDto[];
}

export class AddDamageReportItemsDto {
  items: CreateDamageReportItemDto[];
}

export class UpdateDamageReportDto {
  observations?: string | null;
  general_photos?: string[];
  tax_percent?: number;
  siniestro_number?: string;
}

export class UpdateDamageReportStatusDto {
  status: DamageReportStatus;
}
