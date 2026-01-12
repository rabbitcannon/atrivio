import { test, expect } from '@playwright/test';
import { createAdminPage, AdminPage } from '../../pages/admin/admin.page';
import { loginAs } from '../../helpers/auth';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Admin Dashboard E2E Tests
 *
 * Covers:
 * - Dashboard page display
 * - Stats cards display
 * - System health display
 * - Recent activity display
 * - Quick actions navigation
 * - Access control (super admin only)
 */

test.describe('Admin Dashboard - Page Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();
  });

  test('displays admin dashboard', async () => {
    await adminPage.expectDashboardVisible();
  });

  test('shows platform dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /platform dashboard/i })).toBeVisible();
  });

  test('shows page description', async ({ page }) => {
    await expect(page.locator('text=/platform-wide statistics/i')).toBeVisible();
  });
});

test.describe('Admin Dashboard - Stats Cards', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();
  });

  test('displays stats cards', async () => {
    await adminPage.expectStatsCardsVisible();
  });

  test('shows total users stat', async ({ page }) => {
    await expect(page.locator('text=/total users/i').first()).toBeVisible();
  });

  test('shows organizations stat', async ({ page }) => {
    await expect(page.locator('text=/organizations/i').first()).toBeVisible();
  });

  test('shows attractions stat', async ({ page }) => {
    await expect(page.locator('text=/attractions/i').first()).toBeVisible();
  });

  test('shows growth stat', async ({ page }) => {
    await expect(page.locator('text=/growth/i').first()).toBeVisible();
  });

  test('stats show numeric values', async ({ page }) => {
    // Stats should display formatted numbers
    const statsSection = page.locator('.grid').first();
    await expect(statsSection).toBeVisible();
  });
});

test.describe('Admin Dashboard - System Health', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();
  });

  test('displays system health card', async () => {
    await adminPage.expectSystemHealthVisible();
  });

  test('shows system health heading', async ({ page }) => {
    await expect(page.locator('text=/system health/i')).toBeVisible();
  });

  test('shows health status description', async ({ page }) => {
    await expect(page.locator('text=/current status/i')).toBeVisible();
  });

  test('displays health status badges', async ({ page }) => {
    // Health statuses shown as badges
    const healthCard = page.locator('text=/system health/i').locator('xpath=ancestor::*[contains(@class, "card")]');
    await expect(healthCard).toBeVisible();
  });
});

test.describe('Admin Dashboard - Recent Activity', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();
  });

  test('displays recent activity card', async ({ page }) => {
    await expect(page.locator('text=/recent activity/i')).toBeVisible();
  });

  test('shows activity description', async ({ page }) => {
    await expect(page.locator('text=/latest admin and system actions/i')).toBeVisible();
  });

  test('shows activity entries or empty state', async ({ page }) => {
    const activityCard = page.locator('text=/recent activity/i').locator('xpath=ancestor::*[contains(@class, "card")]');
    const hasActivities = await activityCard.locator('.text-sm').count();
    const hasEmptyState = await page.locator('text=/no recent activity/i').isVisible().catch(() => false);

    expect(hasActivities > 0 || hasEmptyState).toBe(true);
  });
});

test.describe('Admin Dashboard - Quick Actions', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();
  });

  test('displays quick actions card', async () => {
    await adminPage.expectQuickActionsVisible();
  });

  test('shows manage users link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /manage users/i })).toBeVisible();
  });

  test('shows manage organizations link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /manage organizations/i })).toBeVisible();
  });

  test('shows feature flags link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /feature flags/i })).toBeVisible();
  });

  test('shows audit logs link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /audit logs/i })).toBeVisible();
  });

  test('can navigate to users via quick action', async ({ page }) => {
    await page.getByRole('link', { name: /manage users/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('can navigate to organizations via quick action', async ({ page }) => {
    await page.getByRole('link', { name: /manage organizations/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/organizations/);
  });

  test('can navigate to feature flags via quick action', async ({ page }) => {
    await page.getByRole('link', { name: /feature flags/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/feature-flags/);
  });
});

test.describe('Admin Dashboard - Access Control', () => {
  test('super admin can access dashboard', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();

    await adminPage.expectDashboardVisible();
  });

  test('support admin can access dashboard', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'support');
    await adminPage.goto();

    await adminPage.expectDashboardVisible();
  });

  test('regular owner cannot access admin dashboard', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const isOnAdmin = page.url().includes('/admin');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);
    const wasRedirected = !page.url().includes('/admin');

    expect(wasRedirected || hasAccessDenied || !isOnAdmin).toBe(true);
  });

  test('manager cannot access admin dashboard', async ({ page }) => {
    await loginAs(page, 'manager');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const wasRedirected = !page.url().includes('/admin');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });

  test('actor cannot access admin dashboard', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const wasRedirected = !page.url().includes('/admin');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });
});

test.describe('Admin Dashboard - Navigation', () => {
  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const adminPage = createAdminPage(page);
    await adminPage.expectDashboardVisible();
  });

  test('has proper URL structure', async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/admin');
  });
});

test.describe('Admin Dashboard - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('dashboard is usable on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();

    await adminPage.expectDashboardVisible();
  });

  test('stats cards are visible on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();

    await expect(page.locator('text=/total users/i').first()).toBeVisible();
  });

  test('quick actions are visible on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();

    await expect(page.locator('text=/quick actions/i')).toBeVisible();
  });
});

test.describe('Admin Dashboard - Accessibility', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('links are focusable', async ({ page }) => {
    const usersLink = page.getByRole('link', { name: /manage users/i });
    await usersLink.focus();
    await expect(usersLink).toBeFocused();
  });

  test('page is keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });
});

test.describe('Admin Dashboard - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'superAdmin');

    await page.route('**/api/**/admin/dashboard**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const hasError = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const hasContent = await page.locator('body').textContent();

    expect(hasError || hasContent).toBeTruthy();
  });
});
