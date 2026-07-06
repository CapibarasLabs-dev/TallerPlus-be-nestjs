import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserCompaniesService } from '../modules/companies/user-company.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private userCompaniesService: UserCompaniesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const companyId = request.headers['x-company-id'];

    if (!companyId) {
      throw new UnauthorizedException(
        'No business context provided (x-company-id header missing)',
      );
    }

    const membership = await this.userCompaniesService.findSpecific(
      user.sub,
      companyId,
    );

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this business unit',
      );
    }

    request.tenantId = companyId;
    request.userRole = membership.role;

    return true;
  }
}
