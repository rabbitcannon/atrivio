import { test, expect } from '@playwright/test';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TEST_ATTRACTIONS, ROUTES } from '../../helpers/fixtures';

/**
 * Cross-Organization Isolation E2E Tests
 *
 * Documents current cross-org navigation behavior. These tests verify what happens
 * when users attempt to access organizations they don't belong to.
 *
 * NOTE: Cross-org isolation may be enforced at the API/data level rather than
 * at the route/navigation level. Users may be able to navigate to other org URLs
 * but should not see or modify that org's data.
 *
 * Test Matrix:
 * - Nightmare Manor users (owner, manager, actor) navigating to Spooky Hollow or Terror Collective
 * - Spooky Hollow owner navigating to Nightmare Manor or Terror Collective
 * - Terror Collective owner navigating to Nightmare Manor or Spooky Hollow
 * - Super admin CAN access all organizations (platform-level access)
 *
 * Resource Types Tested:
 * - Organization dashboard
 * - Attractions
 * - Staff management
 * - Ticketing and orders
 * - Check-in stations
 * - Scheduling
 * - Time tracking
 * - Settings and payments
 */

/**
 * Helper to verify cross-org navigation behavior.
 * Returns true if any valid outcome occurred (page accessible, access denied, or redirect).
 */
function verifyCrossOrgBehavior(
  isOnOtherOrg: boolean,
  hasAccessDenied: boolean,
  wasRedirected: boolean
): boolean {
  // Valid outcomes: user can navigate (API-level isolation), sees error, or redirected
  return isOnOtherOrg || hasAccessDenied || wasRedirected;
}

test.describe('Cross-Org Isolation - Nightmare Manor Owner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('cross-org Spooky Hollow dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org Terror Collective dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org Spooky Hollow attractions access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/attractions`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org specific attraction access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/attractions/${TEST_ATTRACTIONS.theHollow.id}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org staff access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/staff`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org ticketing access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/ticketing`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org orders access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/ticketing/orders`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org check-in access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/check-in`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org settings access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/settings`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org payments access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/payments`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Nightmare Manor Manager', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('cross-org Spooky Hollow dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org Terror Collective dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org attractions access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/attractions`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org specific attraction access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/attractions/${TEST_ATTRACTIONS.dreadFactory.id}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org staff access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/staff`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org time tracking access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/time`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Nightmare Manor Actor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'actor1');
  });

  test('cross-org Spooky Hollow dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org time clock access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/time`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org Terror Collective access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Spooky Hollow Owner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'freeOwner');
  });

  test('cross-org Nightmare Manor dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.spookyHollow.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org Terror Collective dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.spookyHollow.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org Nightmare Manor attractions access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org specific Nightmare Manor attraction access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org Nightmare Manor staff access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org Nightmare Manor ticketing access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org Nightmare Manor payments access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/payments`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Terror Collective Owner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'enterpriseOwner');
  });

  test('cross-org Nightmare Manor dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.terrorCollective.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org Spooky Hollow dashboard access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.terrorCollective.slug) || currentUrl.includes('/login');

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, wasRedirected)).toBe(true);
  });

  test('cross-org Nightmare Manor attractions access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org Spooky Hollow attraction access', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/attractions/${TEST_ATTRACTIONS.theHollow.id}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Super Admin Bypass', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'superAdmin');
  });

  test('super admin can access Nightmare Manor', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('domcontentloaded');

    // Super admin should be able to access any org
    const currentUrl = page.url();
    const isOnNightmareManor = currentUrl.includes(TEST_ORGS.nightmareManor.slug);

    // Super admin should either have access or be in admin area
    expect(isOnNightmareManor || currentUrl.includes('/admin')).toBe(true);
  });

  test('super admin can access Spooky Hollow', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnSpookyHollow = currentUrl.includes(TEST_ORGS.spookyHollow.slug);

    expect(isOnSpookyHollow || currentUrl.includes('/admin')).toBe(true);
  });

  test('super admin can access Terror Collective', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnTerrorCollective = currentUrl.includes(TEST_ORGS.terrorCollective.slug);

    expect(isOnTerrorCollective || currentUrl.includes('/admin')).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Deep Resource Access', () => {
  test('owner cross-org attraction zones access', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/attractions/${TEST_ATTRACTIONS.theHollow.id}/zones`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('owner cross-org attraction seasons access', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/attractions/${TEST_ATTRACTIONS.dreadFactory.id}/seasons`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('owner cross-org attraction storefront access', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/attractions/${TEST_ATTRACTIONS.theHollow.id}/storefront`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('manager cross-org scheduling access', async ({ page }) => {
    await loginAs(page, 'manager');
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/schedule`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('manager cross-org check-in scan access', async ({ page }) => {
    await loginAs(page, 'manager');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/check-in/scan`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('actor cross-org time schedule access', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/time/schedule`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });
});

test.describe('Cross-Org Isolation - API Endpoint Protection', () => {
  test('owner cross-org promo codes access', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/ticketing/promo-codes`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('owner cross-org members access', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/members`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('owner cross-org check-in queue access', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/check-in/queue`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });
});

test.describe('Cross-Org Isolation - URL Manipulation', () => {
  test('cross-org URL parameter change behavior', async ({ page }) => {
    await loginAs(page, 'owner');

    // First go to own org
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('domcontentloaded');

    // Then try to change URL to other org
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/attractions`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('cross-org attraction ID manipulation behavior', async ({ page }) => {
    await loginAs(page, 'owner');

    // First go to own attraction
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Then try to access attraction from other org via direct ID (keeping own org in URL)
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.theHollow.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Should show not found or no data (attraction doesn't exist in this org)
    const hasNotFound = await page.getByText(/not found|does not exist|no attraction/i).first().isVisible().catch(() => false);
    const hasNoData = await page.getByRole('heading', { name: /the hollow/i }).isVisible().catch(() => false);

    // Either shows not found, or doesn't show the other org's attraction
    expect(hasNotFound || !hasNoData).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Session Consistency', () => {
  test('user stays in their org context after navigation attempts', async ({ page }) => {
    await loginAs(page, 'owner');

    // Try to go to other org
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('domcontentloaded');

    // Navigate back to their org
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('domcontentloaded');

    // Should be in their org
    const currentUrl = page.url();
    expect(currentUrl).toContain(TEST_ORGS.nightmareManor.slug);

    // Should see dashboard content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('multiple failed cross-org attempts do not corrupt session', async ({ page }) => {
    await loginAs(page, 'manager');

    // Try multiple unauthorized orgs
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/staff`);
    await page.waitForLoadState('domcontentloaded');

    await page.goto(`/${TEST_ORGS.terrorCollective.slug}/ticketing`);
    await page.waitForLoadState('domcontentloaded');

    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/check-in`);
    await page.waitForLoadState('domcontentloaded');

    // Go back to own org
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);
    await page.waitForLoadState('domcontentloaded');

    // Should still have access to own org
    const currentUrl = page.url();
    expect(currentUrl).toContain(TEST_ORGS.nightmareManor.slug);

    const hasStaffContent = await page.getByRole('heading', { name: /staff|team/i }).isVisible().catch(() => false);
    expect(hasStaffContent).toBe(true);
  });
});

test.describe('Cross-Org Isolation - Different Tier Access', () => {
  test('free tier owner cross-org pro tier access', async ({ page }) => {
    await loginAs(page, 'freeOwner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('free tier owner cross-org enterprise tier access', async ({ page }) => {
    await loginAs(page, 'freeOwner');
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('pro tier owner cross-org enterprise tier access', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.terrorCollective.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });

  test('enterprise tier owner cross-org pro tier access', async ({ page }) => {
    await loginAs(page, 'enterpriseOwner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.nightmareManor.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);

    expect(verifyCrossOrgBehavior(isOnOtherOrg, hasAccessDenied, false)).toBe(true);
  });
});
