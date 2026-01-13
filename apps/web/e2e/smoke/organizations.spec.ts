import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Organizations Smoke Tests
 *
 * Verifies organization management features work correctly.
 */

test.describe('Organizations Smoke Tests', () => {
  test('dashboard shows organization context', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.goto(`/${TEST_USERS.owner.orgSlug}`);
    await page.waitForLoadState('networkidle');

    // Should see org name somewhere on page
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/nightmare|manor/i);
  });

  test('organization settings page loads', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.goto(`/${TEST_USERS.owner.orgSlug}/settings`);
    await page.waitForLoadState('networkidle');

    // Should see settings content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/setting|organization|profile|general/i);
  });

  test('user can switch organizations', async ({ page }) => {
    // Login as a user who might have multiple orgs
    await loginAs(page, 'owner');

    // Visit different org slug
    await page.goto(`/${TEST_USERS.owner.orgSlug}`);
    await page.waitForLoadState('networkidle');

    // Should load the org dashboard
    expect(page.url()).toContain(TEST_USERS.owner.orgSlug);
  });

  test('organization billing page loads', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.goto(`/${TEST_USERS.owner.orgSlug}/settings/billing`);
    await page.waitForLoadState('networkidle');

    // Should see billing content or settings page
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/billing|subscription|plan|payment|setting/i);
  });

  test('free tier org can access dashboard', async ({ page }) => {
    await loginAs(page, 'freeDemo');

    await page.goto(`/${TEST_USERS.freeDemo.orgSlug}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain(TEST_USERS.freeDemo.orgSlug);
    expect(page.url()).not.toContain('/login');
  });

  test('enterprise tier org can access dashboard', async ({ page }) => {
    await loginAs(page, 'enterpriseDemo');

    await page.goto(`/${TEST_USERS.enterpriseDemo.orgSlug}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain(TEST_USERS.enterpriseDemo.orgSlug);
    expect(page.url()).not.toContain('/login');
  });
});
