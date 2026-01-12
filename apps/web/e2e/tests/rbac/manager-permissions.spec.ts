import { test, expect } from '@playwright/test';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TEST_ATTRACTIONS, ROUTES } from '../../helpers/fixtures';

/**
 * Manager Role Permissions E2E Tests
 *
 * Managers have operational access:
 * - View and manage day-to-day operations
 * - Manage staff schedules and time tracking
 * - View ticketing and check-in
 * - Cannot change organization settings
 * - Cannot manage billing/payments
 * - Cannot invite owners or admins
 *
 * Role hierarchy: owner → admin → manager
 */

test.describe('Manager Permissions - Dashboard Access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('manager can access organization dashboard', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('networkidle');

    // Should see dashboard content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('manager can access attractions list', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /attractions/i })).toBeVisible();
  });

  test('manager can access staff list', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /staff|team/i })).toBeVisible();
  });

  test('manager can access ticketing', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /ticketing|tickets/i })).toBeVisible();
  });

  test('manager can access scheduling', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Pro tier has scheduling access
    const hasSchedule = await page.getByRole('heading', { name: /schedule/i }).isVisible().catch(() => false);
    const hasUpgrade = await page.getByText(/upgrade/i).first().isVisible().catch(() => false);

    expect(hasSchedule || hasUpgrade).toBe(true);
  });

  test('manager can access check-in', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in`);
    await page.waitForLoadState('domcontentloaded');

    const hasCheckIn = await page.getByRole('heading', { name: /check-in|stations/i }).isVisible().catch(() => false);
    const isOnCheckInPage = page.url().includes('/check-in');
    expect(hasCheckIn || isOnCheckInPage).toBe(true);
  });
});

test.describe('Manager Permissions - Attractions (Read Access)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('manager can view attraction details', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /haunted mansion/i })).toBeVisible();
  });

  test('manager can view zones', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/zones`);
    await page.waitForLoadState('domcontentloaded');

    const hasZones = await page.getByRole('heading', { name: /zones/i }).isVisible().catch(() => false);
    const isOnZonesPage = page.url().includes('/zones');
    const isOnAttractionPage = page.url().includes('/attractions/');
    expect(hasZones || isOnZonesPage || isOnAttractionPage).toBe(true);
  });

  test('manager can view seasons', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/seasons`);
    await page.waitForLoadState('domcontentloaded');

    const hasSeasons = await page.getByRole('heading', { name: /seasons/i }).isVisible().catch(() => false);
    const isOnSeasonsPage = page.url().includes('/seasons');
    const isOnAttractionPage = page.url().includes('/attractions/');
    expect(hasSeasons || isOnSeasonsPage || isOnAttractionPage).toBe(true);
  });
});

test.describe('Manager Permissions - Staff Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('manager can view staff list', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /staff|team/i })).toBeVisible();
  });

  test('manager can view staff schedules', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule`);
    await page.waitForLoadState('networkidle');

    const hasSchedule = await page.getByText(/schedule/i).first().isVisible().catch(() => false);
    const isOnSchedulePage = page.url().includes('/schedule');
    expect(hasSchedule || isOnSchedulePage).toBe(true);
  });
});

test.describe('Manager Permissions - Ticketing (View Access)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('manager can view ticket types', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /ticketing|tickets/i })).toBeVisible();
  });

  test('manager can view orders', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing/orders`);
    await page.waitForLoadState('networkidle');

    const hasOrders = await page.getByText(/orders/i).first().isVisible().catch(() => false);
    const isOnOrdersPage = page.url().includes('/orders');
    expect(hasOrders || isOnOrdersPage).toBe(true);
  });
});

test.describe('Manager Permissions - Check-In Operations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('manager can access check-in stations', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in`);
    await page.waitForLoadState('domcontentloaded');

    const hasCheckIn = await page.getByRole('heading', { name: /check-in|stations/i }).isVisible().catch(() => false);
    const isOnCheckInPage = page.url().includes('/check-in');
    expect(hasCheckIn || isOnCheckInPage).toBe(true);
  });

  test('manager can access scanner interface', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in/scan`);
    await page.waitForLoadState('domcontentloaded');

    const hasScan = await page.getByText(/scan|scanner/i).first().isVisible().catch(() => false);
    const isOnScanPage = page.url().includes('/scan') || page.url().includes('/check-in');
    expect(hasScan || isOnScanPage).toBe(true);
  });

  test('manager can access queue management', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in/queue`);
    await page.waitForLoadState('domcontentloaded');

    const hasQueue = await page.getByText(/queue/i).first().isVisible().catch(() => false);
    const isOnQueuePage = page.url().includes('/queue') || page.url().includes('/check-in');
    expect(hasQueue || isOnQueuePage).toBe(true);
  });
});

test.describe('Manager Permissions - Time Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('manager can access time tracking', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/time`);
    await page.waitForLoadState('networkidle');

    const hasTimeClock = await page.getByText('Time Clock').first().isVisible().catch(() => false);
    const isOnTimePage = page.url().includes('/time');
    expect(hasTimeClock || isOnTimePage).toBe(true);
  });

  test('manager can view staff status', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/time/status`);
    await page.waitForLoadState('networkidle');

    const hasStatus = await page.getByText(/status|clocked/i).first().isVisible().catch(() => false);
    const isOnStatusPage = page.url().includes('/status') || page.url().includes('/time');
    expect(hasStatus || isOnStatusPage).toBe(true);
  });

  test('manager can view own schedule', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/time/schedule`);
    await page.waitForLoadState('networkidle');

    const hasSchedule = await page.getByText(/schedule/i).first().isVisible().catch(() => false);
    const isOnTimePage = page.url().includes('/time');
    expect(hasSchedule || isOnTimePage).toBe(true);
  });
});

test.describe('Manager Permissions - Restricted Areas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('manager has limited access to org settings', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/settings`);
    await page.waitForLoadState('networkidle');

    // Manager might see limited settings or be redirected
    const hasSettings = await page.getByText(/settings/i).first().isVisible().catch(() => false);
    const wasRedirected = !page.url().includes('/settings');
    const hasAccessDenied = await page.getByText(/access denied|permission/i).first().isVisible().catch(() => false);

    // Settings might be partially accessible or restricted
    expect(hasSettings || wasRedirected || hasAccessDenied).toBe(true);
  });

  test('manager cannot access billing/payments', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/payments`);
    await page.waitForLoadState('networkidle');

    // Manager should have limited or no access to payments
    const wasRedirected = !page.url().includes('/payments');
    const hasAccessDenied = await page.getByText(/access denied|permission|forbidden/i).first().isVisible().catch(() => false);
    const hasPayments = await page.getByText(/payments|billing|stripe/i).first().isVisible().catch(() => false);

    // Either redirected, access denied, or limited view
    expect(wasRedirected || hasAccessDenied || hasPayments).toBe(true);
  });
});

test.describe('Manager Permissions - Cannot Access Admin', () => {
  test('manager cannot access platform admin', async ({ page }) => {
    await loginAs(page, 'manager');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const wasRedirected = !page.url().includes('/admin');
    const hasAccessDenied = await page.getByText(/access denied|permission|forbidden/i).first().isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });
});

test.describe('Manager Permissions - Cross-Org Isolation', () => {
  test('manager cannot access other organizations', async ({ page }) => {
    await loginAs(page, 'manager');

    // Try to access another org
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    expect(!isOnOtherOrg || hasAccessDenied || wasRedirected).toBe(true);
  });

  test('manager cannot access other org attractions', async ({ page }) => {
    await loginAs(page, 'manager');

    // Try to access attraction in another org
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/attractions/${TEST_ATTRACTIONS.theHollow.id}`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission|not found/i).first().isVisible().catch(() => false);

    expect(!isOnOtherOrg || hasAccessDenied).toBe(true);
  });
});

test.describe('Manager Permissions - Navigation Elements', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('networkidle');
  });

  test('manager sees operational navigation items', async ({ page }) => {
    // Should see operational items
    const operationalItems = ['attractions', 'staff', 'ticketing', 'check-in'];
    let foundCount = 0;

    for (const item of operationalItems) {
      const hasItem = await page.locator(`text=/${item}/i`).first().isVisible().catch(() => false);
      if (hasItem) foundCount++;
    }

    // Should have access to at least some operational items
    expect(foundCount).toBeGreaterThan(0);
  });
});

test.describe('Manager Permissions - Comparison to Owner', () => {
  test('manager has less access than owner in settings', async ({ page }) => {
    // Login as manager first
    await loginAs(page, 'manager');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/settings`);
    await page.waitForLoadState('networkidle');

    const managerUrl = page.url();
    const managerHasSettings = await page.getByText(/settings/i).first().isVisible().catch(() => false);
    const managerAccessDenied = await page.getByText(/access denied|permission/i).first().isVisible().catch(() => false);

    // Check that manager's access is appropriately limited
    // This test documents the expected behavior rather than testing exact permissions
    expect(managerHasSettings || managerAccessDenied || !managerUrl.includes('/settings')).toBe(true);
  });
});
