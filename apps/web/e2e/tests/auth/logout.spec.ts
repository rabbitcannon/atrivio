import { test, expect } from '@playwright/test';
import { loginAs, ensureLoggedOut, TEST_USERS, TEST_PASSWORD } from '../../helpers/auth';
import { TEST_ORGS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Logout E2E Tests
 *
 * Covers:
 * - Logout via user menu
 * - Session clearing
 * - Redirect after logout
 * - Protection of routes after logout
 * - Different user types logging out
 */

test.describe('Logout', () => {
  test.describe('User Menu Logout', () => {
    test('owner can logout via user menu', async ({ page }) => {
      await loginAs(page, 'owner');

      // Verify we're logged in on dashboard
      await expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);

      // Open user menu (click on avatar)
      const userMenuTrigger = page.getByRole('button').filter({ has: page.locator('img, .avatar, [class*="avatar"]') }).first();

      // If avatar trigger not found, try the button with aria-label
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') });

      // Click on user dropdown
      await avatarButton.first().click();
      await page.waitForTimeout(200);

      // Click sign out
      const signOutButton = page.getByRole('menuitem', { name: /sign.*out|log.*out/i });
      await expect(signOutButton).toBeVisible();
      await signOutButton.click();

      // Should redirect to login
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
      expect(page.url()).toContain('/login');
    });

    test('manager can logout successfully', async ({ page }) => {
      await loginAs(page, 'manager');
      await expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);

      // Open user dropdown and sign out
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);

      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
    });

    test('actor can logout successfully', async ({ page }) => {
      await loginAs(page, 'actor1');
      await expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);

      // Open user dropdown and sign out
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);

      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
    });

    test('super admin can logout successfully', async ({ page }) => {
      await loginAs(page, 'superAdmin');
      await expect(page.url()).toContain('/admin');

      // Open user dropdown and sign out
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);

      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
    });
  });

  test.describe('Session Clearing', () => {
    test('clears session data on logout', async ({ page }) => {
      await loginAs(page, 'owner');

      // Open user dropdown and sign out
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);

      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });

      // Try to access a protected route
      await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
      await page.waitForLoadState('networkidle');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('cannot access protected routes after logout', async ({ page }) => {
      await loginAs(page, 'owner');

      // Logout
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);
      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });

      // Try to access various protected routes
      const protectedRoutes = [
        `/${TEST_ORGS.nightmareManor.slug}`,
        `/${TEST_ORGS.nightmareManor.slug}/staff`,
        `/${TEST_ORGS.nightmareManor.slug}/ticketing`,
        `/${TEST_ORGS.nightmareManor.slug}/attractions`,
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('session persists across page reloads when not logged out', async ({ page }) => {
      await loginAs(page, 'owner');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in (not redirected to login)
      expect(page.url()).not.toContain('/login');
      expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);
    });
  });

  test.describe('Redirect Behavior', () => {
    test('redirects to login page after logout', async ({ page }) => {
      await loginAs(page, 'owner');

      // Logout
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);
      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();

      // Should redirect to login
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
      expect(page.url()).toContain('/login');

      // Login form should be visible
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });
  });

  test.describe('Re-login After Logout', () => {
    test('can login again after logout', async ({ page }) => {
      // Login
      await loginAs(page, 'owner');
      await expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);

      // Logout
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);
      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });

      // Login again
      await page.fill('input[name="email"]', TEST_USERS.owner.email);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');

      // Should be logged in again
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: TIMEOUTS.standard });
      expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);
    });

    test('can login as different user after logout', async ({ page }) => {
      // Login as owner
      await loginAs(page, 'owner');
      await expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);

      // Logout
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);
      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });

      // Login as manager
      await page.fill('input[name="email"]', TEST_USERS.manager.email);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');

      // Should be logged in as manager
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: TIMEOUTS.standard });
      expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);
    });
  });

  test.describe('Different User Tiers', () => {
    test('free tier user can logout', async ({ page }) => {
      await loginAs(page, 'freeOwner');
      await expect(page.url()).toContain(TEST_ORGS.spookyHollow.slug);

      // Logout
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);
      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();

      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
    });

    test('enterprise tier user can logout', async ({ page }) => {
      await loginAs(page, 'enterpriseOwner');
      await expect(page.url()).toContain(TEST_ORGS.terrorCollective.slug);

      // Logout
      const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
      await avatarButton.click();
      await page.waitForTimeout(200);
      await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();

      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
    });
  });
});

test.describe('Logout - Edge Cases', () => {
  test('handles logout when on different pages', async ({ page }) => {
    await loginAs(page, 'owner');

    // Navigate to a nested page
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
    await page.waitForLoadState('networkidle');

    // Logout from nested page
    const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
    await avatarButton.click();
    await page.waitForTimeout(200);
    await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();

    // Should still redirect to login
    await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
  });

  test('back button after logout does not restore session', async ({ page }) => {
    await loginAs(page, 'owner');
    const dashboardUrl = page.url();

    // Logout
    const avatarButton = page.locator('button').filter({ has: page.locator('span.relative') }).first();
    await avatarButton.click();
    await page.waitForTimeout(200);
    await page.getByRole('menuitem', { name: /sign.*out|log.*out/i }).click();
    await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should not be able to access the dashboard (redirected to login or shows login)
    // Due to client-side routing, this might vary, but protected routes should not be accessible
    await page.waitForTimeout(500);

    // Either on login or trying to access dashboard redirects to login
    if (!page.url().includes('/login')) {
      await page.waitForURL('**/login', { timeout: TIMEOUTS.standard });
    }
  });
});
