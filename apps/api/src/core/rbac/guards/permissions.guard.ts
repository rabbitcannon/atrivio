import type { Permission } from '@haunt/shared';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { RbacService } from '../rbac.service.js';

/**
 * Guard that checks if the user has required permissions
 *
 * Must be used with TenantInterceptor to have tenant context
 *
 * @example
 * @UseGuards(PermissionsGuard)
 * @Permissions('ticket:create', 'ticket:read')
 * @Post()
 * createTicket() {}
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
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

    // Super admins bypass permission checks
    if (tenant.isSuperAdmin || tenant.permissions?.includes('*')) {
      return true;
    }

    // Check if user has any of the required permissions
    const hasPermission = this.rbacService.hasAnyPermission(tenant.role, requiredPermissions);

    if (!hasPermission) {
      throw new ForbiddenException({
        code: 'PERMISSION_DENIED',
        message: `Required permissions: ${requiredPermissions.join(', ')}`,
      });
    }

    return true;
  }
}
