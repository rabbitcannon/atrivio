import { SetMetadata } from '@nestjs/common';
import type { OrgRole } from '@haunt/shared';

export const ROLES_KEY = 'roles';

/**
 * Decorator to require specific roles for a route
 *
 * User must have one of the specified roles
 *
 * @example
 * @Roles('owner', 'admin')
 * @Delete()
 * deleteOrg() {}
 */
export const Roles = (...roles: OrgRole[]) => SetMetadata(ROLES_KEY, roles);
