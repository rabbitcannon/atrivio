import { type Page } from '@playwright/test';

/**
 * Authentication helper utilities for E2E tests
 *
 * All test users have password: "password123"
 */

// Password used for all test accounts
export const TEST_PASSWORD = 'password123';

/**
 * Test users from seed data organized by role/tier
 */
export const TEST_USERS = {
  // Platform Admins
  superAdmin: {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@haunt.dev',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin' as const,
  },
  support: {
    id: 'a0000000-0000-0000-0000-000000000099',
    email: 'support@haunt.dev',
    firstName: 'Support',
    lastName: 'Admin',
    role: 'super_admin' as const,
  },

  // Nightmare Manor (Pro Tier)
  owner: {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'owner@haunt.dev',
    firstName: 'Marcus',
    lastName: 'Holloway',
    role: 'owner' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  manager: {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'manager@haunt.dev',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'manager' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  actor1: {
    id: 'a0000000-0000-0000-0000-000000000004',
    email: 'actor1@haunt.dev',
    firstName: 'Jake',
    lastName: 'Morrison',
    role: 'actor' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  actor2: {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'actor2@haunt.dev',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: 'actor' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  boxOffice: {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'boxoffice@haunt.dev',
    firstName: 'Lisa',
    lastName: 'Park',
    role: 'box_office' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  hr: {
    id: 'a0000000-0000-0000-0000-000000000008',
    email: 'hr@haunt.dev',
    firstName: 'Rachel',
    lastName: 'Kim',
    role: 'hr' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  finance: {
    id: 'a0000000-0000-0000-0000-000000000009',
    email: 'finance@haunt.dev',
    firstName: 'David',
    lastName: 'Miller',
    role: 'finance' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  scanner: {
    id: 'a0000000-0000-0000-0000-000000000010',
    email: 'scanner@haunt.dev',
    firstName: 'Tom',
    lastName: 'Garcia',
    role: 'scanner' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },

  // Spooky Hollow (Free/Basic Tier)
  freeOwner: {
    id: 'a1000000-0000-0000-0000-000000000001',
    email: 'hollow.owner@haunt.dev',
    firstName: 'Ben',
    lastName: 'Crawford',
    role: 'owner' as const,
    orgId: 'b0000000-0000-0000-0000-000000000002',
    orgSlug: 'spooky-hollow',
  },

  // Terror Collective (Enterprise Tier) - CEO is the owner
  enterpriseOwner: {
    id: 'a3000000-0000-0000-0000-000000000001',
    email: 'ceo@terror.dev',
    firstName: 'Victoria',
    lastName: 'Sterling',
    role: 'owner' as const,
    orgId: 'b0000000-0000-0000-0000-000000000003',
    orgSlug: 'terror-collective',
  },

  // Demo/Tier-specific accounts (quick login for testing)
  freeDemo: {
    id: 'a0000000-0000-0000-0000-000000000f01',
    email: 'free@haunt.dev',
    firstName: 'Free',
    lastName: 'Demo',
    role: 'owner' as const,
    orgId: 'b0000000-0000-0000-0000-000000000002',
    orgSlug: 'spooky-hollow',
  },
  proDemo: {
    id: 'a0000000-0000-0000-0000-000000000f02',
    email: 'pro@haunt.dev',
    firstName: 'Pro',
    lastName: 'Demo',
    role: 'owner' as const,
    orgId: 'b0000000-0000-0000-0000-000000000001',
    orgSlug: 'nightmare-manor',
  },
  enterpriseDemo: {
    id: 'a0000000-0000-0000-0000-000000000f03',
    email: 'enterprise@haunt.dev',
    firstName: 'Enterprise',
    lastName: 'Demo',
    role: 'owner' as const,
    orgId: 'b0000000-0000-0000-0000-000000000003',
    orgSlug: 'terror-collective',
  },
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

/**
 * Login as a predefined test user
 *
 * @example
 * ```ts
 * test.beforeEach(async ({ page }) => {
 *   await loginAs(page, 'owner');
 * });
 * ```
 */
export async function loginAs(
  page: Page,
  userKey: TestUserKey,
  options?: { waitForOrg?: boolean }
): Promise<void> {
  const user = TEST_USERS[userKey];
  await loginWithCredentials(page, user.email, TEST_PASSWORD, {
    waitForOrg: options?.waitForOrg ?? true,
    expectedOrgSlug: 'orgSlug' in user ? user.orgSlug : undefined,
  });
}

/**
 * Login with custom credentials
 *
 * @example
 * ```ts
 * await loginWithCredentials(page, 'custom@email.com', 'custompass');
 * ```
 */
export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
  options?: { waitForOrg?: boolean; expectedOrgSlug?: string }
): Promise<void> {
  // First, clear any existing session to handle user switching
  await page.context().clearCookies();

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Verify we're on the login page (not redirected away due to cached state)
  const currentUrl = page.url();
  if (!currentUrl.includes('/login')) {
    // Still have an active session somehow, force clear and retry
    await page.context().clearCookies();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  }

  // Wait for the login form to be visible
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });

  // Fill login form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect - could go to org-specific URL or /dashboard
  if (options?.waitForOrg !== false) {
    // Wait for navigation away from login page
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // If we're at /dashboard and expected a specific org, navigate there
    if (options?.expectedOrgSlug && page.url().includes('/dashboard')) {
      await page.goto(`/${options.expectedOrgSlug}`);
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  // Try to find and click logout button/link
  const logoutButton = page.getByRole('button', { name: /log\s?out|sign\s?out/i });
  const logoutLink = page.getByRole('link', { name: /log\s?out|sign\s?out/i });

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else if (await logoutLink.isVisible()) {
    await logoutLink.click();
  } else {
    // Fallback: navigate to logout route
    await page.goto('/logout');
  }

  // Wait for redirect to login
  await page.waitForURL('**/login', { timeout: 10000 });
}

/**
 * Ensure the user is logged out by clearing storage and cookies
 */
export async function ensureLoggedOut(page: Page): Promise<void> {
  // Clear all storage
  await page.context().clearCookies();

  // Navigate to login to verify logged out state
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
}

/**
 * Check if currently logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // If we can access dashboard without redirect, we're logged in
  const response = await page.goto('/dashboard');
  const url = page.url();

  // If redirected to login, not logged in
  return !url.includes('/login');
}
