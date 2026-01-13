import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Admin Smoke Tests
 *
 * Verifies platform admin features work correctly.
 * Super admin only.
 */

test.describe('Admin Smoke Tests', () => {
  test('super admin can access admin dashboard', async ({ page }) => {
    await loginAs(page, 'superAdmin', { waitForOrg: false });

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should see admin content, not access denied
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/admin|dashboard|platform|organizations|users/i);
    expect(page.url()).not.toContain('/login');
  });

  test('admin organizations page loads', async ({ page }) => {
    await loginAs(page, 'superAdmin', { waitForOrg: false });

    await page.goto('/admin/organizations');
    await page.waitForLoadState('networkidle');

    // Should see organizations list
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/organization|nightmare|spooky|terror/i);
  });

  test('admin users page loads', async ({ page }) => {
    await loginAs(page, 'superAdmin', { waitForOrg: false });

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Should see users content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/user|email|admin/i);
  });

  test('regular owner cannot access admin', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const isBlocked =
      page.url().includes('/login') ||
      !page.url().includes('/admin') ||
      (await page.locator('body').textContent())?.toLowerCase().includes('access') ||
      (await page.locator('body').textContent())?.toLowerCase().includes('denied') ||
      (await page.locator('body').textContent())?.toLowerCase().includes('not found');

    expect(isBlocked).toBeTruthy();
  });

  test('manager cannot access admin', async ({ page }) => {
    await loginAs(page, 'manager');

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or blocked
    const isBlocked =
      page.url().includes('/login') ||
      !page.url().includes('/admin') ||
      (await page.locator('body').textContent())?.toLowerCase().includes('access') ||
      (await page.locator('body').textContent())?.toLowerCase().includes('denied');

    expect(isBlocked).toBeTruthy();
  });

  test('actor cannot access admin', async ({ page }) => {
    await loginAs(page, 'actor1');

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected or blocked
    expect(page.url().includes('/admin')).toBeFalsy();
  });
});
