import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { TenancyService } from '../tenancy.service.js';
import type { OrgId, UserId } from '@haunt/shared';

/**
 * Interceptor that resolves tenant context from :orgId route parameter
 * Accepts both UUID and slug for organization identification
 *
 * Usage: Apply to controllers/routes that need org context
 *
 * @example
 * @UseInterceptors(TenantInterceptor)
 * @Controller('organizations/:orgId/attractions')
 * export class AttractionsController {}
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private tenancyService: TenancyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgIdentifier = request.params.orgId as string;

    if (!user) {
      throw new ForbiddenException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
      });
    }

    if (!orgIdentifier) {
      throw new ForbiddenException({
        code: 'ORG_ID_REQUIRED',
        message: 'Organization ID is required',
      });
    }

    // Resolve org from UUID or slug
    const org = await this.tenancyService.resolveOrg(orgIdentifier);
    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    const orgId = org.id;

    // Check if user is super admin (bypasses org membership check)
    const isSuperAdmin = await this.tenancyService.isSuperAdmin(
      user.id as UserId,
    );

    if (isSuperAdmin) {
      // Super admins get full access with owner permissions
      request.tenant = {
        orgId: org.id,
        orgName: org.name,
        orgSlug: org.slug,
        userId: user.id as UserId,
        role: 'owner' as const,
        isOwner: false,
        isSuperAdmin: true,
        permissions: ['*'], // Super admin has all permissions
      };
      return next.handle();
    }

    // Resolve tenant context for regular users
    const tenant = await this.tenancyService.resolveTenantContext(
      user.id as UserId,
      orgId,
    );

    // Attach to request for use in controllers
    request.tenant = tenant;

    return next.handle();
  }
}
