export class CreateInsuranceCompanyDto {
  name: string;
  rut?: string | null;
  is_active?: boolean;
}

export class UpdateInsuranceCompanyDto {
  name?: string;
  rut?: string | null;
  is_active?: boolean;
}

export class CreateInsuranceBaremeDto {
  insurance_company_id: string;
  hour_cost_chapa: number;
  hour_cost_mecanica: number;
  hour_cost_pintura?: number | null;
}

export class UpdateInsuranceBaremeDto {
  hour_cost_chapa?: number;
  hour_cost_mecanica?: number;
  hour_cost_pintura?: number | null;
}
