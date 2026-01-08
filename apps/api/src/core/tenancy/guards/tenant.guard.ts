import type { UserId } from '@atrivio/shared';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenancyService } from '../tenancy.service.js';

export const SKIP_TENANT_CHECK = 'skipTenantCheck';

/**
 * Guard that resolves tenant context from :orgId route parameter
 *
 * Must be applied BEFORE RolesGuard so tenant context is available for role checks.
 * Automatically skipped for routes without :orgId parameter.
 *
 * @example
 * @UseGuards(TenantGuard, RolesGuard)
 * @Controller('organizations/:orgId/staff')
 * export class StaffController {}
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private tenancyService: TenancyService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgIdentifier = request.params?.orgId as string | undefined;

    // Skip if no orgId in route (e.g., /auth/login, /organizations list)
    if (!orgIdentifier) {
      return true;
    }

    // Skip if explicitly marked
    const skipCheck = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_CHECK, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCheck) {
      return true;
    }

    if (!user) {
      throw new ForbiddenException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
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
    const isSuperAdmin = await this.tenancyService.isSuperAdmin(user.id as UserId);

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
      return true;
    }

    // Resolve tenant context for regular users
    const tenant = await this.tenancyService.resolveTenantContext(user.id as UserId, orgId);

    // Attach to request for use in controllers
    request.tenant = tenant;

    return true;
  }
}
