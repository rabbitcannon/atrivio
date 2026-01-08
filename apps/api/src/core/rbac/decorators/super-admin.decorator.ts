import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard.js';

export const SUPER_ADMIN_KEY = 'superAdmin';

/**
 * Decorator to restrict a route to super admins only
 *
 * Combines the metadata and guard in one decorator
 *
 * @example
 * @SuperAdmin()
 * @Get('admin/users')
 * listAllUsers() {}
 */
export const SuperAdmin = () =>
  applyDecorators(SetMetadata(SUPER_ADMIN_KEY, true), UseGuards(SuperAdminGuard));
