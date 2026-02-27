import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserCompany } from './entities/user-companies.entity';
import { UserCompaniesService } from './user-company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user-companies')
export class UserCompaniesController {
  constructor(private readonly userCompaniesService: UserCompaniesService) {}

  @Post()
  create(@Body() data: Partial<UserCompany>) {
    return this.userCompaniesService.create(data);
  }

  @Get()
  findAll() {
    return this.userCompaniesService.findAll();
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.userCompaniesService.findByCompany(companyId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userCompaniesService.findByUser(userId);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: string,
  ) {
    return this.userCompaniesService.updateRole(id, role);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userCompaniesService.remove(id);
  }

  @Get('my-organizations')
  @UseGuards(JwtAuthGuard) // Assuming you have a standard JWT Guard
  async getMyOrganizations(@Request() req) {
    // req.user.sub is the ID from the JWT payload
    return this.userCompaniesService.getMyCompanies(req.user.sub);
  }
}
