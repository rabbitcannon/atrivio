import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Check-In Smoke Tests
 *
 * Verifies check-in features work correctly.
 */

test.describe('Check-In Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('check-in page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in`);
    await page.waitForLoadState('networkidle');

    // Should see check-in content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/check-?in|scan|station|queue/i);
  });

  test('scan page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in/scan`);
    await page.waitForLoadState('networkidle');

    // Should see scan interface or select station prompt
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/scan|barcode|camera|station|select/i);
  });

  test('queue page loads', async ({ page }) => {
    // Increase timeout for this test since queue page loads attractions
    test.setTimeout(45000);

    await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in/queue`);

    // Wait for loading state to start (page has loading indicator)
    await page.waitForTimeout(1000);

    // Wait for any of: queue content, no attractions message, or loading complete
    try {
      await page.waitForSelector('text=/queue|guests|attraction|loading/i', { timeout: 15000 });
    } catch {
      // If no specific text found, just wait for page to settle
      await page.waitForTimeout(3000);
    }

    // Should not be on login page
    expect(page.url()).not.toContain('/login');

    // Page should have some content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.length).toBeGreaterThan(50);
  });

  test('scanner role can access check-in', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'scanner');

    await page.goto(`/${TEST_USERS.scanner.orgSlug}/check-in`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/login');
  });

  test('manager can access check-in', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'manager');

    await page.goto(`/${TEST_USERS.manager.orgSlug}/check-in`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/login');
  });
});
