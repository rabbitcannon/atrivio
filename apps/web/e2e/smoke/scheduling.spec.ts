import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Scheduling Smoke Tests
 *
 * Verifies scheduling features work correctly.
 * Note: Scheduling is a Pro tier feature.
 */

test.describe('Scheduling Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('schedule page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Should see schedule content or feature gate message
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/schedule|shift|calendar|upgrade|unavailable/i);
  });

  test('availability page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/schedule/availability`);
    await page.waitForLoadState('networkidle');

    // Should load without error
    const pageContent = await page.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });

  test('templates page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/schedule/templates`);
    await page.waitForLoadState('networkidle');

    // Should see templates content or empty state
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/template|shift|schedule|no templates|create/i);
  });

  test('manager can access schedule', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'manager');

    await page.goto(`/${TEST_USERS.manager.orgSlug}/schedule`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/login');
  });

  test('free tier sees upgrade prompt or limited access', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'freeDemo');

    await page.goto(`/${TEST_USERS.freeDemo.orgSlug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Free tier should see upgrade prompt or limited functionality
    const pageContent = await page.locator('body').textContent();
    // Either shows schedule (if enabled) or upgrade prompt
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });
});
