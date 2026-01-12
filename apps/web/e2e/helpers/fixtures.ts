/**
 * Test fixtures and constants for E2E tests
 *
 * All IDs match the seed data in supabase/seed.sql
 */

/**
 * Organization IDs and details
 */
export const TEST_ORGS = {
  // Nightmare Manor - Pro Tier (primary demo org)
  nightmareManor: {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Nightmare Manor',
    slug: 'nightmare-manor',
    tier: 'pro' as const,
  },
  // Spooky Hollow - Free/Basic Tier
  spookyHollow: {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Spooky Hollow',
    slug: 'spooky-hollow',
    tier: 'free' as const,
  },
  // Terror Collective - Enterprise Tier
  terrorCollective: {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Terror Collective',
    slug: 'terror-collective',
    tier: 'enterprise' as const,
  },
  // Newhouse Haunts - Onboarding (incomplete setup)
  newhouseHaunts: {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Newhouse Haunts',
    slug: 'newhouse-haunts',
    tier: 'free' as const,
  },
} as const;

/**
 * Attraction IDs and details
 */
export const TEST_ATTRACTIONS = {
  // Nightmare Manor Attractions
  hauntedMansion: {
    id: 'c0000000-0000-0000-0000-000000000001',
    orgId: TEST_ORGS.nightmareManor.id,
    name: 'The Haunted Mansion',
    slug: 'haunted-mansion',
  },
  terrorTrail: {
    id: 'c0000000-0000-0000-0000-000000000002',
    orgId: TEST_ORGS.nightmareManor.id,
    name: 'Terror Trail',
    slug: 'terror-trail',
  },
  escapeAsylum: {
    id: 'c0000000-0000-0000-0000-000000000003',
    orgId: TEST_ORGS.nightmareManor.id,
    name: 'Escape the Asylum',
    slug: 'escape-asylum',
  },

  // Spooky Hollow Attraction
  theHollow: {
    id: 'c1000000-0000-0000-0000-000000000001',
    orgId: TEST_ORGS.spookyHollow.id,
    name: 'The Hollow',
    slug: 'the-hollow',
  },

  // Terror Collective Attractions
  dreadFactory: {
    id: 'c3000000-0000-0000-0000-000000000001',
    orgId: TEST_ORGS.terrorCollective.id,
    name: 'Dread Factory',
    slug: 'dread-factory',
  },
  darkExperiment: {
    id: 'c3000000-0000-0000-0000-000000000002',
    orgId: TEST_ORGS.terrorCollective.id,
    name: 'The Dark Experiment',
    slug: 'dark-experiment',
  },
} as const;

/**
 * Season IDs
 */
export const TEST_SEASONS = {
  halloween2024: {
    id: 'f0000000-0000-0000-0000-000000000001',
    attractionId: TEST_ATTRACTIONS.hauntedMansion.id,
    name: 'Halloween Season',
    year: 2024,
    status: 'completed' as const,
  },
  halloween2025: {
    id: 'f0000000-0000-0000-0000-000000000002',
    attractionId: TEST_ATTRACTIONS.hauntedMansion.id,
    name: 'Halloween Season',
    year: 2025,
    status: 'active' as const,
  },
} as const;

/**
 * Centralized route constants
 */
export const ROUTES = {
  // Auth routes
  auth: {
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },

  // Dashboard routes (requires orgId)
  dashboard: (orgId: string) => ({
    home: `/${orgId}`,
    attractions: `/${orgId}/attractions`,
    attractionDetail: (attractionId: string) => `/${orgId}/attractions/${attractionId}`,
    staff: `/${orgId}/staff`,
    staffDetail: (staffId: string) => `/${orgId}/staff/${staffId}`,
    schedule: `/${orgId}/schedule`,
    scheduleTemplates: `/${orgId}/schedule/templates`,
    scheduleAvailability: `/${orgId}/schedule/availability`,
    ticketing: `/${orgId}/ticketing`,
    ticketingOrders: `/${orgId}/ticketing/orders`,
    ticketingPromoCodes: `/${orgId}/ticketing/promo-codes`,
    checkIn: `/${orgId}/check-in`,
    checkInScan: `/${orgId}/check-in/scan`,
    checkInQueue: `/${orgId}/check-in/queue`,
    payments: `/${orgId}/payments`,
    settings: `/${orgId}/settings`,
    members: `/${orgId}/members`,
    notifications: `/${orgId}/notifications`,
    inventory: `/${orgId}/inventory`,
    storefrontSettings: (attractionId: string) =>
      `/${orgId}/attractions/${attractionId}/storefront`,
    storefrontPages: (attractionId: string) =>
      `/${orgId}/attractions/${attractionId}/storefront/pages`,
  }),

  // Admin routes
  admin: {
    home: '/admin',
    organizations: '/admin/organizations',
    users: '/admin/users',
    featureFlags: '/admin/feature-flags',
    auditLogs: '/admin/audit-logs',
    health: '/admin/health',
    revenue: '/admin/revenue',
  },

  // Public storefront routes
  storefront: (identifier: string) => ({
    home: `/s/${identifier}`,
    checkout: `/s/${identifier}/checkout`,
    checkoutSuccess: `/s/${identifier}/checkout/success`,
    faq: `/s/${identifier}/faq`,
    customPage: (slug: string) => `/s/${identifier}/${slug}`,
  }),

  // Time clock routes
  timeClock: (orgId: string) => ({
    home: `/${orgId}/time`,
    schedule: `/${orgId}/time/schedule`,
    availability: `/${orgId}/time/availability`,
    swaps: `/${orgId}/time/swaps`,
    status: `/${orgId}/time/status`,
  }),
} as const;

/**
 * Stripe test cards
 */
export const STRIPE_TEST_CARDS = {
  success: {
    number: '4242424242424242',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
  decline: {
    number: '4000000000000002',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
  requires3ds: {
    number: '4000002500003155',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
  insufficientFunds: {
    number: '4000000000009995',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
} as const;

/**
 * Feature flags by tier
 */
export const FEATURE_FLAGS = {
  free: ['time_tracking', 'ticketing', 'checkin', 'notifications'],
  pro: [
    'time_tracking',
    'ticketing',
    'checkin',
    'notifications',
    'scheduling',
    'inventory',
    'analytics_pro',
    'storefronts',
    'media_uploads',
  ],
  enterprise: [
    'time_tracking',
    'ticketing',
    'checkin',
    'notifications',
    'scheduling',
    'inventory',
    'analytics_pro',
    'storefronts',
    'media_uploads',
    'virtual_queue',
    'sms_notifications',
    'custom_domains',
  ],
} as const;

/**
 * Common test timeouts
 */
export const TIMEOUTS = {
  /** Fast operations like clicking, typing */
  fast: 5000,
  /** Standard page loads and navigation */
  standard: 15000,
  /** Long operations like file uploads, API calls */
  long: 30000,
  /** Very long operations like Stripe redirects */
  veryLong: 60000,
} as const;

/**
 * Generate a unique test code with the given prefix.
 * Uses timestamp + random suffix to ensure uniqueness across test runs.
 *
 * @param prefix - The prefix for the code (e.g., 'TEST', 'EDIT', 'FIXED')
 * @param maxLength - Maximum length of the final code (default: 12)
 * @returns A unique uppercase code
 *
 * @example
 * ```ts
 * const code = generateUniqueCode('TEST'); // e.g., "TESTABC123XY"
 * const code = generateUniqueCode('FIXED', 10); // e.g., "FIXED1A2B3"
 * ```
 */
export function generateUniqueCode(prefix: string = 'TEST', maxLength: number = 12): string {
  // Use combination of timestamp and random characters for uniqueness
  const timestamp = Date.now().toString(36); // Base36 is more compact
  const random = Math.random().toString(36).slice(2, 6); // 4 random chars
  const fullCode = `${prefix}${timestamp}${random}`.toUpperCase();
  return fullCode.slice(0, maxLength);
}

/**
 * Generate a unique test name with the given prefix.
 * Uses timestamp + random suffix to ensure uniqueness across test runs.
 *
 * @param prefix - The prefix for the name (e.g., 'Test GA', 'VIP Package')
 * @returns A unique name string
 *
 * @example
 * ```ts
 * const name = generateUniqueName('Test GA'); // e.g., "Test GA ABC123"
 * const name = generateUniqueName('VIP Package'); // e.g., "VIP Package XY789Z"
 * ```
 */
export function generateUniqueName(prefix: string = 'Test'): string {
  // Use combination of timestamp and random characters for uniqueness
  const random = Math.random().toString(36).slice(2, 8).toUpperCase(); // 6 random chars
  return `${prefix} ${random}`;
}
