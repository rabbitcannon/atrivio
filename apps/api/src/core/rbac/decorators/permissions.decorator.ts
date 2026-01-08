import type { Permission } from '@atrivio/shared';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for a route
 *
 * User must have at least one of the specified permissions
 *
 * @example
 * @Permissions('ticket:create')
 * @Post()
 * createTicket() {}
 *
 * @example
 * // Multiple permissions (OR logic)
 * @Permissions('ticket:create', 'ticket:manage')
 * @Post()
 * createTicket() {}
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
