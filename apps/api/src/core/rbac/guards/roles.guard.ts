import type { OrgRole } from '@haunt/shared';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/**
 * Guard that checks if the user has one of the required roles
 *
 * Must be used with TenantInterceptor to have tenant context
 *
 * @example
 * @UseGuards(RolesGuard)
 * @Roles('owner', 'admin')
 * @Delete()
 * delete() {}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (!tenant) {
      throw new ForbiddenException({
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Organization context is required for this operation',
      });
    }

    // Super admins bypass role checks
    if (tenant.isSuperAdmin) {
      return true;
    }

    const hasRole = requiredRoles.includes(tenant.role);

    if (!hasRole) {
      throw new ForbiddenException({
        code: 'ROLE_REQUIRED',
        message: `Required roles: ${requiredRoles.join(', ')}`,
      });
    }

    return true;
  }
}
