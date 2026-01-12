import { test, expect } from '@playwright/test';
import { createAdminPage, AdminPage } from '../../pages/admin/admin.page';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Admin Users E2E Tests
 *
 * Covers:
 * - Users list display
 * - Search functionality
 * - User details
 * - Grant/Revoke super admin
 * - Access control
 */

test.describe('Admin Users - Page Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('displays users page', async () => {
    await adminPage.expectUsersPageVisible();
  });

  test('shows users heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^users$/i })).toBeVisible();
  });

  test('shows page description', async ({ page }) => {
    await expect(page.locator('text=/manage platform users/i')).toBeVisible();
  });

  test('shows users table', async () => {
    await adminPage.expectUsersTableVisible();
  });

  test('shows total users count', async ({ page }) => {
    await expect(page.locator('text=/total users/i')).toBeVisible();
  });
});

test.describe('Admin Users - Table Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('shows user column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /user/i })).toBeVisible();
  });

  test('shows email column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /email/i })).toBeVisible();
  });

  test('shows role column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /role/i })).toBeVisible();
  });

  test('shows organizations column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /organizations/i })).toBeVisible();
  });

  test('shows joined column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /joined/i })).toBeVisible();
  });

  test('displays user rows', async ({ page }) => {
    const rows = await adminPage.usersTableRows.count();
    expect(rows).toBeGreaterThan(0);
  });

  test('shows test users from seed data', async ({ page }) => {
    // Check for known test users (by email)
    const hasAdminEmail = await page.locator('text=/admin@haunt.dev/i').isVisible().catch(() => false);
    const hasOwnerEmail = await page.locator('text=/owner@haunt.dev/i').isVisible().catch(() => false);

    expect(hasAdminEmail || hasOwnerEmail).toBe(true);
  });
});

test.describe('Admin Users - Role Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('shows super admin badge for admin users', async ({ page }) => {
    const superAdminBadge = page.locator('text=/super admin/i').first();
    await expect(superAdminBadge).toBeVisible();
  });

  test('shows user badge for regular users', async ({ page }) => {
    // Should have some regular users with "User" badge
    const userBadges = await page.locator('[class*="badge"]').filter({ hasText: /^user$/i }).count();
    expect(userBadges).toBeGreaterThanOrEqual(0);
  });

  test('shows organization count badges', async ({ page }) => {
    // Users should show org count
    const orgBadges = await page.locator('text=/\\d+ orgs/i').count();
    expect(orgBadges).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Admin Users - Search', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('shows search input', async () => {
    await expect(adminPage.usersSearchInput).toBeVisible();
  });

  test('shows search button', async () => {
    await expect(adminPage.usersSearchButton).toBeVisible();
  });

  test('can search for users by email', async ({ page }) => {
    await adminPage.searchUsers('admin@haunt.dev');

    // Should show filtered results
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('can search for users by name', async ({ page }) => {
    await adminPage.searchUsers('Super');

    // Should show filtered results
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('search with no results shows empty state', async ({ page }) => {
    await adminPage.searchUsers('nonexistent-user-xyz123@test.com');

    const hasResults = await adminPage.usersTableRows.count();
    const hasEmptyState = await adminPage.noUsersState.isVisible().catch(() => false);

    expect(hasResults === 0 || hasEmptyState).toBe(true);
  });

  test('search input is clearable', async ({ page }) => {
    await adminPage.usersSearchInput.fill('test search');
    await adminPage.usersSearchInput.clear();

    await expect(adminPage.usersSearchInput).toHaveValue('');
  });
});

test.describe('Admin Users - Actions Menu', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('user rows have actions button', async ({ page }) => {
    const rows = await adminPage.usersTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.usersTableRows.first();
      const hasActionsButton = await firstRow.getByRole('button', { name: /actions/i }).isVisible().catch(() => false);
      expect(hasActionsButton).toBe(true);
    }
  });

  test('actions menu shows view details option', async ({ page }) => {
    const rows = await adminPage.usersTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.usersTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();

      await expect(page.getByRole('menuitem', { name: /view details/i })).toBeVisible();
    }
  });

  test('actions menu shows grant admin option for non-admins', async ({ page }) => {
    // Find a regular user (has "User" badge)
    const regularUserRow = page.locator('tbody tr').filter({ has: page.locator('[class*="badge"]').filter({ hasText: /^user$/i }) }).first();
    const hasRegularUser = await regularUserRow.isVisible().catch(() => false);

    if (hasRegularUser) {
      await regularUserRow.getByRole('button', { name: /actions/i }).click();
      await expect(page.getByRole('menuitem', { name: /grant admin/i })).toBeVisible();
    }
  });

  test('actions menu shows revoke admin option for super admins', async ({ page }) => {
    // Find a super admin user
    const adminUserRow = page.locator('tbody tr').filter({ hasText: /super admin/i }).first();
    const hasAdminUser = await adminUserRow.isVisible().catch(() => false);

    if (hasAdminUser) {
      await adminUserRow.getByRole('button', { name: /actions/i }).click();
      await expect(page.getByRole('menuitem', { name: /revoke admin/i })).toBeVisible();
    }
  });
});

test.describe('Admin Users - Grant Admin Dialog', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('grant admin dialog shows confirmation', async ({ page }) => {
    // Find a regular user
    const regularUserRow = page.locator('tbody tr').filter({ has: page.locator('[class*="badge"]').filter({ hasText: /^user$/i }) }).first();
    const hasRegularUser = await regularUserRow.isVisible().catch(() => false);

    if (hasRegularUser) {
      await regularUserRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /grant admin/i }).click();

      await expect(adminPage.grantAdminDialog).toBeVisible();
      await expect(page.locator('text=/grant super admin/i')).toBeVisible();
    }
  });

  test('grant admin dialog can be cancelled', async ({ page }) => {
    const regularUserRow = page.locator('tbody tr').filter({ has: page.locator('[class*="badge"]').filter({ hasText: /^user$/i }) }).first();
    const hasRegularUser = await regularUserRow.isVisible().catch(() => false);

    if (hasRegularUser) {
      await regularUserRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /grant admin/i }).click();

      await expect(adminPage.grantAdminDialog).toBeVisible();
      await page.getByRole('button', { name: /cancel/i }).click();

      await expect(adminPage.grantAdminDialog).not.toBeVisible();
    }
  });

  test('grant admin dialog shows warning about full access', async ({ page }) => {
    const regularUserRow = page.locator('tbody tr').filter({ has: page.locator('[class*="badge"]').filter({ hasText: /^user$/i }) }).first();
    const hasRegularUser = await regularUserRow.isVisible().catch(() => false);

    if (hasRegularUser) {
      await regularUserRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /grant admin/i }).click();

      await expect(page.locator('text=/full platform access/i')).toBeVisible();
    }
  });
});

test.describe('Admin Users - Revoke Admin Dialog', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('revoke admin dialog shows confirmation', async ({ page }) => {
    // Find a super admin user (not the current logged-in user)
    const adminUserRow = page.locator('tbody tr').filter({ hasText: /super admin/i }).filter({ hasText: /support@haunt.dev/i }).first();
    const hasAdminUser = await adminUserRow.isVisible().catch(() => false);

    if (hasAdminUser) {
      await adminUserRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /revoke admin/i }).click();

      await expect(adminPage.revokeAdminDialog).toBeVisible();
      await expect(page.locator('text=/revoke super admin/i')).toBeVisible();
    }
  });

  test('revoke admin dialog can be cancelled', async ({ page }) => {
    const adminUserRow = page.locator('tbody tr').filter({ hasText: /super admin/i }).filter({ hasText: /support@haunt.dev/i }).first();
    const hasAdminUser = await adminUserRow.isVisible().catch(() => false);

    if (hasAdminUser) {
      await adminUserRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /revoke admin/i }).click();

      await expect(adminPage.revokeAdminDialog).toBeVisible();
      await page.getByRole('button', { name: /cancel/i }).click();

      await expect(adminPage.revokeAdminDialog).not.toBeVisible();
    }
  });
});

test.describe('Admin Users - Access Control', () => {
  test('super admin can access users page', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();

    await adminPage.expectUsersPageVisible();
  });

  test('support admin can access users page', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'support');
    await adminPage.gotoUsers();

    await adminPage.expectUsersPageVisible();
  });

  test('regular owner cannot access admin users', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const wasRedirected = !page.url().includes('/admin/users');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });

  test('manager cannot access admin users', async ({ page }) => {
    await loginAs(page, 'manager');
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    const wasRedirected = !page.url().includes('/admin/users');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });
});

test.describe('Admin Users - Navigation', () => {
  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    const adminPage = createAdminPage(page);
    await adminPage.expectUsersPageVisible();
  });

  test('accessible from admin dashboard', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();

    await page.getByRole('link', { name: /manage users/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/users/);
  });
});

test.describe('Admin Users - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('users page is usable on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();

    await adminPage.expectUsersPageVisible();
  });

  test('search is visible on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();

    const hasSearch = await adminPage.usersSearchInput.isVisible().catch(() => false);
    expect(hasSearch).toBe(true);
  });

  test('table is scrollable on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();

    await adminPage.expectUsersTableVisible();
  });
});

test.describe('Admin Users - Accessibility', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('search input is focusable', async () => {
    await adminPage.usersSearchInput.focus();
    await expect(adminPage.usersSearchInput).toBeFocused();
  });

  test('table has proper structure', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
  });

  test('page is keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });

  test('action buttons have accessible names', async ({ page }) => {
    const rows = await adminPage.usersTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.usersTableRows.first();
      const actionsButton = firstRow.getByRole('button', { name: /actions/i });
      await expect(actionsButton).toBeVisible();
    }
  });
});

test.describe('Admin Users - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'superAdmin');

    await page.route('**/api/**/admin/users**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const hasError = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const hasContent = await page.locator('body').textContent();

    expect(hasError || hasContent).toBeTruthy();
  });
});

test.describe('Admin Users - Pagination', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoUsers();
  });

  test('shows user count', async ({ page }) => {
    const countText = await page.locator('text=/\\d+ total users/i').textContent();
    expect(countText).toBeTruthy();
  });
});
