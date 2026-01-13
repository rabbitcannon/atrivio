import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Auth Smoke Tests
 *
 * Verifies core authentication flows work correctly.
 */

test.describe('Auth Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.context().clearCookies();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('owner can login and reach dashboard', async ({ page }) => {
    await loginAs(page, 'owner');

    // Should be on dashboard or org page after login
    const url = page.url();
    expect(url.includes('/login')).toBeFalsy();

    // Should see some dashboard content
    await expect(page.locator('body')).toContainText(/dashboard|welcome|overview/i);
  });

  test('manager can login', async ({ page }) => {
    await loginAs(page, 'manager');
    expect(page.url().includes('/login')).toBeFalsy();
  });

  test('actor can login', async ({ page }) => {
    await loginAs(page, 'actor1');
    expect(page.url().includes('/login')).toBeFalsy();
  });

  test('super admin can login', async ({ page }) => {
    // Super admin login - manually handle since they don't have org
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', 'admin@haunt.dev');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect away from login
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Super admin might go to /admin or /dashboard
    const url = page.url();
    expect(url.includes('/login')).toBeFalsy();
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error or stay on login page
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('/login')).toBeTruthy();
  });

  test('session persists after page reload', async ({ page }) => {
    await loginAs(page, 'owner');

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in (not on login page)
    expect(page.url().includes('/login')).toBeFalsy();
  });

  test('logout works', async ({ page }) => {
    await loginAs(page, 'owner');

    // Clear cookies to simulate logout (Supabase uses cookie-based sessions)
    await page.context().clearCookies();

    // Try to access a protected page - should be redirected to login
    await page.goto(`/${TEST_USERS.owner.orgSlug}`);
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    // Should be redirected to login
    expect(page.url()).toContain('/login');
  });
});
