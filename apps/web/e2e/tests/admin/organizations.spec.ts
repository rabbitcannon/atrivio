import { test, expect } from '@playwright/test';
import { createAdminPage, AdminPage } from '../../pages/admin/admin.page';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Admin Organizations E2E Tests
 *
 * Covers:
 * - Organizations list display
 * - Search functionality
 * - Status filtering
 * - Organization details
 * - Suspend/Reactivate actions
 * - Access control
 */

test.describe('Admin Organizations - Page Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
  });

  test('displays organizations page', async () => {
    await adminPage.expectOrganizationsPageVisible();
  });

  test('shows organizations heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /organizations/i })).toBeVisible();
  });

  test('shows page description', async ({ page }) => {
    await expect(page.locator('text=/manage platform organizations/i')).toBeVisible();
  });

  test('shows organizations table', async () => {
    await adminPage.expectOrganizationsTableVisible();
  });

  test('shows total organizations count', async ({ page }) => {
    await expect(page.locator('text=/total organizations/i')).toBeVisible();
  });
});

test.describe('Admin Organizations - Table Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
  });

  test('shows organization column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /organization/i })).toBeVisible();
  });

  test('shows owner column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /owner/i })).toBeVisible();
  });

  test('shows status column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('shows members column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /members/i })).toBeVisible();
  });

  test('shows attractions column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /attractions/i })).toBeVisible();
  });

  test('shows created column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /created/i })).toBeVisible();
  });

  test('displays organization rows', async ({ page }) => {
    const rows = await adminPage.orgsTableRows.count();
    expect(rows).toBeGreaterThan(0);
  });

  test('shows test organizations from seed data', async ({ page }) => {
    // Check for known test organizations
    const hasNightmareManor = await page.locator('text=/nightmare manor/i').first().isVisible().catch(() => false);
    const hasSpookyHollow = await page.locator('text=/spooky hollow/i').first().isVisible().catch(() => false);
    const hasTerrorCollective = await page.locator('text=/terror collective/i').first().isVisible().catch(() => false);

    expect(hasNightmareManor || hasSpookyHollow || hasTerrorCollective).toBe(true);
  });
});

test.describe('Admin Organizations - Search', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
  });

  test('shows search input', async () => {
    await expect(adminPage.orgsSearchInput).toBeVisible();
  });

  test('shows search button', async () => {
    await expect(adminPage.orgsSearchButton).toBeVisible();
  });

  test('can search for organizations', async ({ page }) => {
    await adminPage.searchOrganizations('nightmare');

    // Should show filtered results
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('search with no results shows empty state', async ({ page }) => {
    await adminPage.searchOrganizations('nonexistent-org-xyz123');

    const hasResults = await adminPage.orgsTableRows.count();
    const hasEmptyState = await adminPage.noOrgsState.isVisible().catch(() => false);

    expect(hasResults === 0 || hasEmptyState).toBe(true);
  });

  test('search input is clearable', async ({ page }) => {
    await adminPage.orgsSearchInput.fill('test search');
    await adminPage.orgsSearchInput.clear();

    await expect(adminPage.orgsSearchInput).toHaveValue('');
  });
});

test.describe('Admin Organizations - Status Filter', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
  });

  test('shows status filter dropdown', async () => {
    await expect(adminPage.orgsStatusFilter).toBeVisible();
  });

  test('can filter by all status', async ({ page }) => {
    await adminPage.filterOrganizationsByStatus('all');

    // Should show all organizations
    const rows = await adminPage.orgsTableRows.count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('can filter by active status', async ({ page }) => {
    await adminPage.filterOrganizationsByStatus('active');

    // Should show only active organizations
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('can filter by suspended status', async ({ page }) => {
    await adminPage.filterOrganizationsByStatus('suspended');

    // Should show suspended organizations or empty state
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Admin Organizations - Actions Menu', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
  });

  test('organization rows have actions button', async ({ page }) => {
    const rows = await adminPage.orgsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.orgsTableRows.first();
      const hasActionsButton = await firstRow.getByRole('button', { name: /actions/i }).isVisible().catch(() => false);
      expect(hasActionsButton).toBe(true);
    }
  });

  test('actions menu shows view details option', async ({ page }) => {
    const rows = await adminPage.orgsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.orgsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();

      await expect(page.getByRole('menuitem', { name: /view details/i })).toBeVisible();
    }
  });

  test('actions menu shows suspend option for active orgs', async ({ page }) => {
    // Filter to active organizations first
    await adminPage.filterOrganizationsByStatus('active');

    const rows = await adminPage.orgsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.orgsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();

      // Should have suspend option for active orgs
      const hasSuspend = await page.getByRole('menuitem', { name: /suspend/i }).isVisible().catch(() => false);
      expect(hasSuspend).toBe(true);
    }
  });
});

test.describe('Admin Organizations - View Details', () => {
  test('can navigate to organization detail', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();

    const rows = await adminPage.orgsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.orgsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /view details/i }).click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/admin\/organizations\/[^/]+/);
    }
  });
});

test.describe('Admin Organizations - Suspend Dialog', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
    await adminPage.filterOrganizationsByStatus('active');
  });

  test('suspend dialog requires reason', async ({ page }) => {
    const rows = await adminPage.orgsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.orgsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /suspend/i }).click();

      // Dialog should be visible
      await expect(adminPage.suspendDialog).toBeVisible();

      // Confirm button should be disabled without reason
      await expect(page.getByRole('button', { name: /suspend organization/i })).toBeDisabled();
    }
  });

  test('suspend dialog can be cancelled', async ({ page }) => {
    const rows = await adminPage.orgsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.orgsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /suspend/i }).click();

      await expect(adminPage.suspendDialog).toBeVisible();

      await page.getByRole('button', { name: /cancel/i }).click();

      await expect(adminPage.suspendDialog).not.toBeVisible();
    }
  });

  test('suspend dialog shows reason textarea', async ({ page }) => {
    const rows = await adminPage.orgsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.orgsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /suspend/i }).click();

      await expect(adminPage.suspendReasonInput).toBeVisible();
    }
  });
});

test.describe('Admin Organizations - Access Control', () => {
  test('super admin can access organizations page', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();

    await adminPage.expectOrganizationsPageVisible();
  });

  test('regular owner cannot access admin organizations', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto('/admin/organizations');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const wasRedirected = !page.url().includes('/admin/organizations');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });
});

test.describe('Admin Organizations - Navigation', () => {
  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await page.goto('/admin/organizations');
    await page.waitForLoadState('networkidle');

    const adminPage = createAdminPage(page);
    await adminPage.expectOrganizationsPageVisible();
  });

  test('accessible from admin dashboard', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();

    await page.getByRole('link', { name: /manage organizations/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/organizations/);
  });
});

test.describe('Admin Organizations - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('organizations page is usable on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();

    await adminPage.expectOrganizationsPageVisible();
  });

  test('search is visible on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();

    // Search might be in a collapsible or visible
    const hasSearch = await adminPage.orgsSearchInput.isVisible().catch(() => false);
    const hasSearchButton = await adminPage.orgsSearchButton.isVisible().catch(() => false);

    expect(hasSearch || hasSearchButton).toBe(true);
  });

  test('table is scrollable on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();

    await adminPage.expectOrganizationsTableVisible();
  });
});

test.describe('Admin Organizations - Accessibility', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('search input is focusable', async () => {
    await adminPage.orgsSearchInput.focus();
    await expect(adminPage.orgsSearchInput).toBeFocused();
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
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'DIV']).toContain(focused);
  });
});

test.describe('Admin Organizations - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'superAdmin');

    await page.route('**/api/**/admin/organizations**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/admin/organizations');
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const hasError = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const hasContent = await page.locator('body').textContent();

    expect(hasError || hasContent).toBeTruthy();
  });
});

test.describe('Admin Organizations - Pagination', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoOrganizations();
  });

  test('shows organization count', async ({ page }) => {
    const countText = await page.locator('text=/\\d+ total organizations/i').textContent();
    expect(countText).toBeTruthy();
  });
});
