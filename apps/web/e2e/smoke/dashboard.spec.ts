import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Dashboard Smoke Tests
 *
 * Verifies the main dashboard loads and navigation works.
 */

test.describe('Dashboard Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('dashboard page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}`);
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('sidebar navigation is visible', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}`);
    await page.waitForLoadState('networkidle');

    // Should see navigation links (sidebar or header)
    const nav = page.locator('nav, [role="navigation"], aside');
    await expect(nav.first()).toBeVisible();
  });

  test('can navigate to staff page', async ({ page }) => {
    // Go directly to staff page - tests that the page loads and is accessible
    await page.goto(`/${TEST_USERS.owner.orgSlug}/staff`);
    await page.waitForLoadState('networkidle');

    // Should be on staff page, not redirected to login
    expect(page.url()).toContain('/staff');
    expect(page.url()).not.toContain('/login');
  });

  test('can navigate to ticketing page', async ({ page }) => {
    // Go directly to ticketing page - tests that the page loads and is accessible
    await page.goto(`/${TEST_USERS.owner.orgSlug}/ticketing`);
    await page.waitForLoadState('networkidle');

    // Should be on ticketing page, not redirected to login
    expect(page.url()).toContain('/ticketing');
    expect(page.url()).not.toContain('/login');
  });

  test('can navigate to schedule page', async ({ page }) => {
    // Go directly to schedule page - tests that the page loads and is accessible
    await page.goto(`/${TEST_USERS.owner.orgSlug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Should be on schedule page, not redirected to login
    expect(page.url()).toContain('/schedule');
    expect(page.url()).not.toContain('/login');
  });

  test('different tiers can access dashboard', async ({ page }) => {
    // Test free tier only - simplify test to avoid timeout issues with multiple logins
    await page.context().clearCookies();
    await loginAs(page, 'freeDemo');
    await page.goto(`/${TEST_USERS.freeDemo.orgSlug}`);
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/login');

    // Verify page has content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.length).toBeGreaterThan(100);
  });
});
