import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import {
  CreateInsuranceBaremeDto,
  CreateInsuranceCompanyDto,
  UpdateInsuranceBaremeDto,
  UpdateInsuranceCompanyDto,
} from './dto/insurance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/tenant.guard';

@Controller('insurance')
@UseGuards(JwtAuthGuard, TenantGuard)
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post('companies')
  createCompany(@Body() body: CreateInsuranceCompanyDto) {
    return this.insuranceService.createCompany(body);
  }

  @Get('companies')
  findAllCompanies(@Query('active_only') activeOnly?: string) {
    return this.insuranceService.findAllCompanies(activeOnly === 'true');
  }

  @Get('companies/:id')
  findCompany(@Param('id') id: string) {
    return this.insuranceService.findCompanyById(id);
  }

  @Patch('companies/:id')
  updateCompany(
    @Param('id') id: string,
    @Body() body: UpdateInsuranceCompanyDto,
  ) {
    return this.insuranceService.updateCompany(id, body);
  }

  @Post('baremes')
  createBareme(@Request() req: any, @Body() body: CreateInsuranceBaremeDto) {
    return this.insuranceService.createBareme(req.tenantId, body);
  }

  @Get('baremes')
  findBaremes(@Request() req: any) {
    return this.insuranceService.findBaremes(req.tenantId);
  }

  @Get('baremes/:insuranceCompanyId')
  findBaremeForCompany(
    @Request() req: any,
    @Param('insuranceCompanyId') insuranceCompanyId: string,
  ) {
    return this.insuranceService.findBaremeForCompany(
      req.tenantId,
      insuranceCompanyId,
    );
  }

  @Patch('baremes/:id')
  updateBareme(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateInsuranceBaremeDto,
  ) {
    return this.insuranceService.updateBareme(req.tenantId, id, body);
  }

  @Delete('baremes/:id')
  removeBareme(@Request() req: any, @Param('id') id: string) {
    return this.insuranceService.removeBareme(req.tenantId, id);
  }
}
