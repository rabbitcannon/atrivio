import type { OrgRole } from '@atrivio/shared';
import { SetMetadata } from '@nestjs/common';

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
