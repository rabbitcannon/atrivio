import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Time Tracking Smoke Tests
 *
 * Verifies time tracking features work correctly.
 */

test.describe('Time Tracking Smoke Tests', () => {
  test('public time clock page loads', async ({ page }) => {
    // Time clock is publicly accessible
    await page.goto('/time');
    await page.waitForLoadState('networkidle');

    // Should see time clock or login prompt
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/time|clock|pin|login|sign in/i);
  });

  test('staff status page loads for manager', async ({ page }) => {
    await loginAs(page, 'manager');

    await page.goto(`/${TEST_USERS.manager.orgSlug}/time/status`);
    await page.waitForLoadState('networkidle');

    // Should see time status content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/time|status|currently|working|staff/i);
  });

  test('owner can view staff time tracking', async ({ page }) => {
    await loginAs(page, 'owner');

    // Go to the time status page to view staff time tracking
    await page.goto(`/${TEST_USERS.owner.orgSlug}/time/status`);
    await page.waitForLoadState('networkidle');

    // Should see time tracking status page (staff list, status, etc.)
    const pageContent = await page.locator('body').textContent();
    const hasTimeContent = pageContent?.toLowerCase().match(/time|status|staff|clock|working|currently/i);

    // Should be authenticated (not redirected to login)
    expect(page.url()).not.toContain('/login');
    expect(hasTimeContent).toBeTruthy();
  });

  test('actor can access time clock', async ({ page }) => {
    await loginAs(page, 'actor1');

    await page.goto('/time');
    await page.waitForLoadState('networkidle');

    // Should see time clock interface
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/time|clock|in|out/i);
  });

  test('actor cannot access staff status page', async ({ page }) => {
    await loginAs(page, 'actor1');

    await page.goto(`/${TEST_USERS.actor1.orgSlug}/time/status`);
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const pageContent = await page.locator('body').textContent();
    const isRestricted =
      page.url().includes('/login') ||
      !page.url().includes('/time/status') ||
      pageContent?.toLowerCase().includes('access') ||
      pageContent?.toLowerCase().includes('denied') ||
      pageContent?.toLowerCase().includes('required');

    expect(isRestricted).toBeTruthy();
  });
});
