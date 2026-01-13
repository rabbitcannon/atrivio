import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Ticketing Smoke Tests
 *
 * Verifies ticketing features work correctly.
 */

test.describe('Ticketing Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('ticketing page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/ticketing`);
    await page.waitForLoadState('networkidle');

    // Should see ticketing content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/ticket|type|admission/);
  });

  test('ticket types are displayed', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/ticketing`);
    await page.waitForLoadState('networkidle');

    // Should see ticket type content (table, cards, or list)
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
    const hasList = await page.locator('[class*="list"]').first().isVisible().catch(() => false);

    expect(hasTable || hasCards || hasList).toBeTruthy();
  });

  test('orders page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/ticketing/orders`);
    await page.waitForLoadState('networkidle');

    // Should see orders content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/order|purchase|transaction|no orders/i);
  });

  test('promo codes page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/ticketing/promo-codes`);
    await page.waitForLoadState('networkidle');

    // Should see promo codes content or empty state
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/promo|code|discount|no promo/i);
  });

  test('manager can access ticketing', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'manager');

    await page.goto(`/${TEST_USERS.manager.orgSlug}/ticketing`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/login');
    expect(page.url()).toContain('/ticketing');
  });

  test('box office can access ticketing', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'boxOffice');

    await page.goto(`/${TEST_USERS.boxOffice.orgSlug}/ticketing`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/login');
  });
});
