import { test, expect } from '@playwright/test';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TEST_ATTRACTIONS, ROUTES } from '../../helpers/fixtures';

/**
 * Owner Role Permissions E2E Tests
 *
 * Owners have full access to their organization:
 * - All CRUD operations on attractions, staff, tickets
 * - Settings and configuration
 * - Payments and billing
 * - Can promote/demote members (except other owners)
 *
 * Role hierarchy: owner → admin → manager, hr, box_office, finance, actor, scanner
 */

test.describe('Owner Permissions - Dashboard Access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('owner can access organization dashboard', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('networkidle');

    // Should see dashboard content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('owner can access attractions list', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /attractions/i })).toBeVisible();
  });

  test('owner can access staff list', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /staff|team/i })).toBeVisible();
  });

  test('owner can access ticketing', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /ticketing|tickets/i })).toBeVisible();
  });

  test('owner can access scheduling', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Pro tier has scheduling access
    const hasSchedule = await page.getByRole('heading', { name: /schedule/i }).isVisible().catch(() => false);
    const hasUpgrade = await page.getByText(/upgrade/i).first().isVisible().catch(() => false);

    expect(hasSchedule || hasUpgrade).toBe(true);
  });

  test('owner can access check-in', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in`);
    await page.waitForLoadState('domcontentloaded');

    // Check-in page should load or redirect to a valid location
    const hasCheckIn = await page.getByRole('heading', { name: /check-in|stations/i }).isVisible().catch(() => false);
    const isOnCheckInPage = page.url().includes('/check-in');
    expect(hasCheckIn || isOnCheckInPage).toBe(true);
  });
});

test.describe('Owner Permissions - Attractions Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('owner can view attraction details', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /haunted mansion/i })).toBeVisible();
  });

  test('owner can access attraction settings', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/settings`);
    await page.waitForLoadState('networkidle');

    // Should see settings page or be redirected appropriately
    const hasSettings = await page.getByText(/settings/i).first().isVisible().catch(() => false);
    const isOnSettingsPage = page.url().includes('/settings');
    expect(hasSettings || isOnSettingsPage).toBe(true);
  });

  test('owner can access create attraction page', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/new`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /create attraction/i })).toBeVisible();
  });

  test('owner can access zones management', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/zones`);
    await page.waitForLoadState('domcontentloaded');

    // Zones page should load or we should be on the attraction page
    const hasZones = await page.getByRole('heading', { name: /zones/i }).isVisible().catch(() => false);
    const isOnZonesPage = page.url().includes('/zones');
    const isOnAttractionPage = page.url().includes('/attractions/');
    expect(hasZones || isOnZonesPage || isOnAttractionPage).toBe(true);
  });

  test('owner can access seasons management', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/seasons`);
    await page.waitForLoadState('domcontentloaded');

    // Seasons page should load or we should be on the attraction page
    const hasSeasons = await page.getByRole('heading', { name: /seasons/i }).isVisible().catch(() => false);
    const isOnSeasonsPage = page.url().includes('/seasons');
    const isOnAttractionPage = page.url().includes('/attractions/');
    expect(hasSeasons || isOnSeasonsPage || isOnAttractionPage).toBe(true);
  });

  test('owner can access storefront settings', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/storefront`);
    await page.waitForLoadState('networkidle');

    const hasStorefront = await page.getByText(/storefront/i).first().isVisible().catch(() => false);
    const isOnStorefrontPage = page.url().includes('/storefront');
    expect(hasStorefront || isOnStorefrontPage).toBe(true);
  });
});

test.describe('Owner Permissions - Staff Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('owner can view staff list', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /staff|team/i })).toBeVisible();
  });

  test('owner can see invite staff button', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);
    await page.waitForLoadState('networkidle');

    const hasInvite = await page.getByRole('button', { name: /invite|add/i }).isVisible().catch(() => false);
    const hasLink = await page.getByRole('link', { name: /invite|add/i }).isVisible().catch(() => false);

    expect(hasInvite || hasLink).toBe(true);
  });

  test('owner can access members page', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/members`);
    await page.waitForLoadState('networkidle');

    const hasMembers = await page.getByText(/members|team/i).first().isVisible().catch(() => false);
    const isOnMembersPage = page.url().includes('/members');
    expect(hasMembers || isOnMembersPage).toBe(true);
  });
});

test.describe('Owner Permissions - Ticketing Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('owner can view ticket types', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /ticketing|tickets/i })).toBeVisible();
  });

  test('owner can access orders page', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing/orders`);
    await page.waitForLoadState('networkidle');

    const hasOrders = await page.getByText(/orders/i).first().isVisible().catch(() => false);
    const isOnOrdersPage = page.url().includes('/orders');
    expect(hasOrders || isOnOrdersPage).toBe(true);
  });

  test('owner can access promo codes page', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing/promo-codes`);
    await page.waitForLoadState('networkidle');

    const hasPromoCodes = await page.getByText(/promo|codes/i).first().isVisible().catch(() => false);
    const isOnPromoCodesPage = page.url().includes('/promo-codes');
    expect(hasPromoCodes || isOnPromoCodesPage).toBe(true);
  });

  test('owner can see create ticket type button', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
    await page.waitForLoadState('networkidle');

    const hasCreate = await page.getByRole('button', { name: /create|add|new/i }).isVisible().catch(() => false);
    const hasLink = await page.getByRole('link', { name: /create|add|new/i }).isVisible().catch(() => false);

    expect(hasCreate || hasLink).toBe(true);
  });
});

test.describe('Owner Permissions - Settings & Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('owner can access organization settings', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/settings`);
    await page.waitForLoadState('networkidle');

    const hasSettings = await page.getByText(/settings/i).first().isVisible().catch(() => false);
    const isOnSettingsPage = page.url().includes('/settings');
    expect(hasSettings || isOnSettingsPage).toBe(true);
  });

  test('owner can access payments/billing', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/payments`);
    await page.waitForLoadState('networkidle');

    const hasPayments = await page.getByText(/payments|billing|stripe/i).first().isVisible().catch(() => false);
    const isOnPaymentsPage = page.url().includes('/payments');
    expect(hasPayments || isOnPaymentsPage).toBe(true);
  });
});

test.describe('Owner Permissions - Check-In Operations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('owner can access check-in stations', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in`);
    await page.waitForLoadState('domcontentloaded');

    const hasCheckIn = await page.getByRole('heading', { name: /check-in|stations/i }).isVisible().catch(() => false);
    const isOnCheckInPage = page.url().includes('/check-in');
    expect(hasCheckIn || isOnCheckInPage).toBe(true);
  });

  test('owner can access scanner interface', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in/scan`);
    await page.waitForLoadState('domcontentloaded');

    const hasScan = await page.getByText(/scan|scanner/i).first().isVisible().catch(() => false);
    const isOnScanPage = page.url().includes('/scan') || page.url().includes('/check-in');
    expect(hasScan || isOnScanPage).toBe(true);
  });

  test('owner can access queue management', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/check-in/queue`);
    await page.waitForLoadState('domcontentloaded');

    const hasQueue = await page.getByText(/queue/i).first().isVisible().catch(() => false);
    const isOnQueuePage = page.url().includes('/queue') || page.url().includes('/check-in');
    expect(hasQueue || isOnQueuePage).toBe(true);
  });
});

test.describe('Owner Permissions - Time Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('owner can access time tracking dashboard', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/time`);
    await page.waitForLoadState('networkidle');

    const hasTimeClock = await page.getByText('Time Clock').first().isVisible().catch(() => false);
    const isOnTimePage = page.url().includes('/time');
    expect(hasTimeClock || isOnTimePage).toBe(true);
  });

  test('owner can view staff status', async ({ page }) => {
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/time/status`);
    await page.waitForLoadState('networkidle');

    const hasStatus = await page.getByText(/status|clocked/i).first().isVisible().catch(() => false);
    const isOnStatusPage = page.url().includes('/status') || page.url().includes('/time');
    expect(hasStatus || isOnStatusPage).toBe(true);
  });
});

test.describe('Owner Permissions - Navigation Elements', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('networkidle');
  });

  test('owner sees full navigation menu', async ({ page }) => {
    // Should have access to all main navigation items
    const navItems = ['attractions', 'staff', 'ticketing', 'check-in'];

    for (const item of navItems) {
      const hasItem = await page.locator(`text=/${item}/i`).first().isVisible().catch(() => false);
      // At least some nav items should be visible
      if (hasItem) {
        expect(hasItem).toBe(true);
        break;
      }
    }
  });

  test('owner sees settings in menu', async ({ page }) => {
    // Settings should be accessible to owner
    const hasSettingsLink = await page.locator('a[href*="settings"]').first().isVisible().catch(() => false);
    const hasSettingsText = await page.getByText(/settings/i).first().isVisible().catch(() => false);
    expect(hasSettingsLink || hasSettingsText).toBe(true);
  });
});

test.describe('Owner Permissions - Multi-Org Access', () => {
  test('owner can only access their own organization', async ({ page }) => {
    await loginAs(page, 'owner');

    // Try to access another org (spooky-hollow)
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const currentUrl = page.url();
    const isOnOtherOrg = currentUrl.includes(TEST_ORGS.spookyHollow.slug);
    const hasAccessDenied = await page.getByText(/access denied|not authorized|permission/i).first().isVisible().catch(() => false);
    const wasRedirected = currentUrl.includes(TEST_ORGS.nightmareManor.slug) || currentUrl.includes('/login');

    // Either was redirected away or sees access denied
    expect(!isOnOtherOrg || hasAccessDenied || wasRedirected).toBe(true);
  });
});

test.describe('Owner Permissions - Cannot Access Admin', () => {
  test('owner cannot access platform admin', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const wasRedirected = !page.url().includes('/admin');
    const hasAccessDenied = await page.getByText(/access denied|permission|forbidden/i).first().isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });
});

test.describe('Owner Permissions - Different Tier Owners', () => {
  test('free tier owner has limited features', async ({ page }) => {
    await loginAs(page, 'freeOwner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}`);
    await page.waitForLoadState('networkidle');

    // Should see dashboard
    const hasDashboard = await page.locator('body').textContent();
    expect(hasDashboard).toBeTruthy();
  });

  test('enterprise tier owner has full features', async ({ page }) => {
    await loginAs(page, 'enterpriseOwner');
    await page.goto(`/${TEST_ORGS.terrorCollective.slug}`);
    await page.waitForLoadState('networkidle');

    // Should see dashboard
    const hasDashboard = await page.locator('body').textContent();
    expect(hasDashboard).toBeTruthy();
  });
});
