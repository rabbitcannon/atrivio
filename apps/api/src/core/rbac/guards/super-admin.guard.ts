import type { UserId } from '@haunt/shared';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUPER_ADMIN_KEY } from '../decorators/super-admin.decorator.js';
import { RbacService } from '../rbac.service.js';

/**
 * Guard that restricts access to super admins only
 *
 * @example
 * @UseGuards(SuperAdminGuard)
 * @SuperAdmin()
 * @Get('admin/users')
 * listAllUsers() {}
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireSuperAdmin = this.reflector.getAllAndOverride<boolean>(SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireSuperAdmin) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
      });
    }

    const isSuperAdmin = await this.rbacService.isSuperAdmin(user.id as UserId);

    if (!isSuperAdmin) {
      throw new ForbiddenException({
        code: 'SUPER_ADMIN_REQUIRED',
        message: 'This action requires super admin privileges',
      });
    }

    return true;
  }
}
