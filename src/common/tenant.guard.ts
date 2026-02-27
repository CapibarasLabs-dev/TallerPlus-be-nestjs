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
    const user = request.user; // Set by JwtStrategy

    // We expect the frontend to send the active business ID in this header
    const companyId = request.headers['x-company-id'];

    if (!companyId) {
      throw new UnauthorizedException(
        'No business context provided (x-company-id header missing)',
      );
    }

    // Check database for the link between this User and this Company
    const membership = await this.userCompaniesService.findSpecific(
      user.sub,
      companyId,
    );

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this business unit',
      );
    }

    // Attach membership info to the request for use in controllers/services
    request.tenantId = companyId;
    request.userRole = membership.role;

    return true;
  }
}
