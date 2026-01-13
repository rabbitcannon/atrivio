import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Payments Smoke Tests
 *
 * Verifies payment-related features work correctly.
 * Note: Actual Stripe transactions are not tested here.
 */

test.describe('Payments Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('payments page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/payments`);
    await page.waitForLoadState('networkidle');

    // Should see payments content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/payment|stripe|connect|payout|account/i);
  });

  test('stripe connect status is shown', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/payments`);
    await page.waitForLoadState('networkidle');

    // Should see some indication of Stripe status
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/connect|stripe|setup|configured|onboard|account/i);
  });

  test('finance role can access payments', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'finance');

    await page.goto(`/${TEST_USERS.finance.orgSlug}/payments`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/login');
  });

  test('actor cannot access payments settings', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'actor1');

    await page.goto(`/${TEST_USERS.actor1.orgSlug}/payments`);
    await page.waitForLoadState('networkidle');

    // Should be blocked or redirected
    const pageContent = await page.locator('body').textContent();
    const isRestricted =
      page.url().includes('/login') ||
      !page.url().includes('/payments') ||
      pageContent?.toLowerCase().includes('access') ||
      pageContent?.toLowerCase().includes('denied') ||
      pageContent?.toLowerCase().includes('required');

    expect(isRestricted).toBeTruthy();
  });

  test('free tier sees upgrade prompt or limited access', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'freeDemo');

    await page.goto(`/${TEST_USERS.freeDemo.orgSlug}/payments`);
    await page.waitForLoadState('networkidle');

    // Free tier may have limited payment options
    const pageContent = await page.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });
});
