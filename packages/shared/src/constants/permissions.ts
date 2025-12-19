/**
 * Permission definitions using template literal types
 *
 * Format: `${resource}:${action}`
 * Example: "ticket:refund", "schedule:publish"
 */

// Resources in the system
export const RESOURCES = [
  'organization',
  'haunt',
  'staff',
  'schedule',
  'ticket',
  'order',
  'payment',
  'inventory',
  'report',
  'settings',
] as const;
export type Resource = (typeof RESOURCES)[number];

// Actions that can be performed
export const ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'manage', // Full CRUD
  'publish',
  'refund',
  'export',
  'impersonate',
] as const;
export type Action = (typeof ACTIONS)[number];

// Permission type using template literals
export type Permission = `${Resource}:${Action}`;

// Helper to create permission strings with type safety
export function createPermission(resource: Resource, action: Action): Permission {
  return `${resource}:${action}`;
}

// Common permission sets by role
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'organization:manage',
    'haunt:manage',
    'staff:manage',
    'schedule:manage',
    'ticket:manage',
    'order:manage',
    'payment:manage',
    'inventory:manage',
    'report:read',
    'report:export',
    'settings:manage',
  ],
  admin: [
    'organization:read',
    'organization:update',
    'haunt:manage',
    'staff:manage',
    'schedule:manage',
    'ticket:manage',
    'order:manage',
    'payment:manage',
    'inventory:manage',
    'report:read',
    'report:export',
    'settings:read',
    'settings:update',
  ],
  manager: [
    'organization:read',
    'haunt:read',
    'haunt:update',
    'staff:read',
    'staff:update',
    'schedule:manage',
    'ticket:read',
    'order:read',
    'inventory:manage',
    'report:read',
  ],
  hr: ['organization:read', 'haunt:read', 'staff:manage', 'schedule:read', 'report:read'],
  box_office: [
    'organization:read',
    'haunt:read',
    'ticket:create',
    'ticket:read',
    'ticket:update',
    'order:create',
    'order:read',
    'payment:create',
    'payment:read',
    'payment:refund',
  ],
  finance: [
    'organization:read',
    'haunt:read',
    'ticket:read',
    'order:read',
    'payment:read',
    'report:read',
    'report:export',
  ],
  actor: ['organization:read', 'haunt:read', 'schedule:read', 'inventory:read'],
  scanner: ['organization:read', 'haunt:read', 'ticket:read', 'ticket:update'],
};
