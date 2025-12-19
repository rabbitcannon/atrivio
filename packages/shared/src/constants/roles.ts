/**
 * Role definitions for the platform
 *
 * Two-tier access model:
 * - Platform level: Super Admin (god mode)
 * - Organization level: Owner, Admin, and staff roles
 */

// Platform-level roles (no org_id, bypass RLS)
export const PLATFORM_ROLES = ['super_admin', 'support'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

// Organization-level roles (scoped to org_id)
export const ORG_ROLES = [
  'owner', // Original signup, protected, can promote to admin
  'admin', // Promoted by owner, full permissions
  'manager', // Operational management
  'hr', // Staff/recruitment
  'box_office', // Ticket sales
  'finance', // Financial reports
  'actor', // Performer
  'scanner', // Check-in only
] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

// All roles combined
export const ALL_ROLES = [...PLATFORM_ROLES, ...ORG_ROLES] as const;
export type Role = (typeof ALL_ROLES)[number];

// Role hierarchy (higher index = more permissions within org)
export const ORG_ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 100,
  admin: 90,
  manager: 70,
  hr: 60,
  box_office: 50,
  finance: 50,
  actor: 30,
  scanner: 10,
};

/**
 * Check if a role can perform actions on another role
 */
export function canManageRole(actorRole: OrgRole, targetRole: OrgRole): boolean {
  return ORG_ROLE_HIERARCHY[actorRole] > ORG_ROLE_HIERARCHY[targetRole];
}
