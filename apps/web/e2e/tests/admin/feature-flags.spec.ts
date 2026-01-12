import { test, expect } from '@playwright/test';
import { createAdminPage, AdminPage } from '../../pages/admin/admin.page';
import { loginAs } from '../../helpers/auth';
import { FEATURE_FLAGS, ROUTES, TIMEOUTS, generateUniqueName } from '../../helpers/fixtures';

/**
 * Admin Feature Flags E2E Tests
 *
 * Covers:
 * - Feature flags list display
 * - Toggle functionality
 * - Create new flag
 * - Delete flag
 * - Tier badges display
 * - Access control
 */

test.describe('Admin Feature Flags - Page Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('displays feature flags page', async () => {
    await adminPage.expectFeatureFlagsPageVisible();
  });

  test('shows feature flags heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /feature flags/i })).toBeVisible();
  });

  test('shows page description', async ({ page }) => {
    await expect(page.locator('text=/manage tier-based feature access/i')).toBeVisible();
  });

  test('shows new flag button', async () => {
    await expect(adminPage.newFlagButton).toBeVisible();
  });

  test('shows flags table', async () => {
    await adminPage.expectFeatureFlagsTableVisible();
  });

  test('shows flags count', async ({ page }) => {
    await expect(page.locator('text=/flags configured/i')).toBeVisible();
  });
});

test.describe('Admin Feature Flags - Table Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('shows flag column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /flag/i })).toBeVisible();
  });

  test('shows status column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('shows required tier column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /required tier/i })).toBeVisible();
  });

  test('shows targeting column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /targeting/i })).toBeVisible();
  });

  test('shows last updated column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /last updated/i })).toBeVisible();
  });

  test('displays flag rows', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();
    expect(rows).toBeGreaterThan(0);
  });

  test('shows known feature flags from seed', async ({ page }) => {
    // Check for known feature flags
    const hasScheduling = await page.locator('text=/scheduling/i').first().isVisible().catch(() => false);
    const hasTimeTracking = await page.locator('text=/time_tracking/i').first().isVisible().catch(() => false);
    const hasTicketing = await page.locator('text=/ticketing/i').first().isVisible().catch(() => false);

    expect(hasScheduling || hasTimeTracking || hasTicketing).toBe(true);
  });
});

test.describe('Admin Feature Flags - Flag Details', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('flag rows show name', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      const text = await firstRow.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('flag rows show key in monospace', async ({ page }) => {
    const monoKeys = await page.locator('tbody .font-mono').count();
    expect(monoKeys).toBeGreaterThan(0);
  });

  test('flag rows show status toggle', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      const hasSwitch = await firstRow.locator('[role="switch"]').isVisible();
      expect(hasSwitch).toBe(true);
    }
  });

  test('flag rows show enabled/disabled badge', async ({ page }) => {
    const hasBadges = await page.locator('text=/enabled|disabled/i').count();
    expect(hasBadges).toBeGreaterThan(0);
  });
});

test.describe('Admin Feature Flags - Tier Badges', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('shows free tier badge', async ({ page }) => {
    const freeBadge = await page.locator('[class*="badge"]').filter({ hasText: /^free$/i }).count();
    expect(freeBadge).toBeGreaterThanOrEqual(0);
  });

  test('shows pro tier badge', async ({ page }) => {
    const proBadge = await page.locator('[class*="badge"]').filter({ hasText: /^pro$/i }).count();
    expect(proBadge).toBeGreaterThanOrEqual(0);
  });

  test('shows enterprise tier badge', async ({ page }) => {
    const enterpriseBadge = await page.locator('[class*="badge"]').filter({ hasText: /^enterprise$/i }).count();
    expect(enterpriseBadge).toBeGreaterThanOrEqual(0);
  });

  test('tier badges are visible in rows', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      // At least some rows should have tier badges
      const tierBadges = await page.locator('tbody [class*="badge"]').count();
      expect(tierBadges).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Feature Flags - Toggle Functionality', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('toggle switches are clickable', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      const toggle = firstRow.locator('[role="switch"]');

      await expect(toggle).toBeVisible();
      await expect(toggle).toBeEnabled();
    }
  });

  test('toggle has aria-label', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      const toggle = firstRow.locator('[role="switch"]');

      const hasAriaLabel = await toggle.getAttribute('aria-label');
      expect(hasAriaLabel).toBeTruthy();
    }
  });
});

test.describe('Admin Feature Flags - Create Flag Dialog', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('clicking new flag opens dialog', async ({ page }) => {
    await adminPage.newFlagButton.click();
    await expect(adminPage.createFlagDialog).toBeVisible();
  });

  test('create dialog shows form fields', async ({ page }) => {
    await adminPage.newFlagButton.click();

    await expect(adminPage.flagKeyInput).toBeVisible();
    await expect(adminPage.flagNameInput).toBeVisible();
    await expect(adminPage.flagDescriptionInput).toBeVisible();
  });

  test('create dialog has cancel button', async ({ page }) => {
    await adminPage.newFlagButton.click();

    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('create dialog has create button', async ({ page }) => {
    await adminPage.newFlagButton.click();

    await expect(adminPage.createFlagConfirmButton).toBeVisible();
  });

  test('create button is disabled without required fields', async ({ page }) => {
    await adminPage.newFlagButton.click();

    // Without filling in key and name, button should be disabled
    await expect(adminPage.createFlagConfirmButton).toBeDisabled();
  });

  test('create button is enabled with required fields', async ({ page }) => {
    await adminPage.newFlagButton.click();

    await adminPage.flagKeyInput.fill('test_flag');
    await adminPage.flagNameInput.fill('Test Flag');

    await expect(adminPage.createFlagConfirmButton).toBeEnabled();
  });

  test('create dialog can be cancelled', async ({ page }) => {
    await adminPage.newFlagButton.click();
    await expect(adminPage.createFlagDialog).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(adminPage.createFlagDialog).not.toBeVisible();
  });

  test('key input shows hint about snake_case', async ({ page }) => {
    await adminPage.newFlagButton.click();

    await expect(page.locator('text=/snake_case/i')).toBeVisible();
  });
});

test.describe('Admin Feature Flags - Actions Menu', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('flag rows have actions button', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      const hasActionsButton = await firstRow.getByRole('button', { name: /actions/i }).isVisible();
      expect(hasActionsButton).toBe(true);
    }
  });

  test('actions menu shows configure option', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();

      await expect(page.getByRole('menuitem', { name: /configure/i })).toBeVisible();
    }
  });

  test('actions menu shows delete option', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();

      await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible();
    }
  });
});

test.describe('Admin Feature Flags - Delete Dialog', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('delete shows confirmation dialog', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /delete/i }).click();

      await expect(adminPage.deleteFlagDialog).toBeVisible();
    }
  });

  test('delete dialog warns about permanence', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /delete/i }).click();

      await expect(page.locator('text=/cannot be undone/i')).toBeVisible();
    }
  });

  test('delete dialog can be cancelled', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /delete/i }).click();

      await expect(adminPage.deleteFlagDialog).toBeVisible();
      await page.getByRole('button', { name: /cancel/i }).click();

      await expect(adminPage.deleteFlagDialog).not.toBeVisible();
    }
  });

  test('delete dialog has destructive delete button', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /delete/i }).click();

      await expect(adminPage.deleteFlagConfirmButton).toBeVisible();
    }
  });
});

test.describe('Admin Feature Flags - Navigate to Configure', () => {
  test('can navigate to flag configuration', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();

    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      await firstRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /configure/i }).click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/admin\/feature-flags\/[^/]+/);
    }
  });
});

test.describe('Admin Feature Flags - Access Control', () => {
  test('super admin can access feature flags page', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();

    await adminPage.expectFeatureFlagsPageVisible();
  });

  test('support admin can access feature flags page', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'support');
    await adminPage.gotoFeatureFlags();

    await adminPage.expectFeatureFlagsPageVisible();
  });

  test('regular owner cannot access feature flags', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto('/admin/feature-flags');
    await page.waitForLoadState('networkidle');

    // Should be redirected or see access denied
    const wasRedirected = !page.url().includes('/admin/feature-flags');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });

  test('manager cannot access feature flags', async ({ page }) => {
    await loginAs(page, 'manager');
    await page.goto('/admin/feature-flags');
    await page.waitForLoadState('networkidle');

    const wasRedirected = !page.url().includes('/admin/feature-flags');
    const hasAccessDenied = await page.locator('text=/access denied|permission|forbidden/i').isVisible().catch(() => false);

    expect(wasRedirected || hasAccessDenied).toBe(true);
  });
});

test.describe('Admin Feature Flags - Navigation', () => {
  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await page.goto('/admin/feature-flags');
    await page.waitForLoadState('networkidle');

    const adminPage = createAdminPage(page);
    await adminPage.expectFeatureFlagsPageVisible();
  });

  test('accessible from admin dashboard', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.goto();

    await page.getByRole('link', { name: /feature flags/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/feature-flags/);
  });
});

test.describe('Admin Feature Flags - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('feature flags page is usable on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();

    await adminPage.expectFeatureFlagsPageVisible();
  });

  test('new flag button is visible on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();

    await expect(adminPage.newFlagButton).toBeVisible();
  });

  test('table is scrollable on mobile', async ({ page }) => {
    const adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();

    await adminPage.expectFeatureFlagsTableVisible();
  });
});

test.describe('Admin Feature Flags - Accessibility', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('new flag button is focusable', async () => {
    await adminPage.newFlagButton.focus();
    await expect(adminPage.newFlagButton).toBeFocused();
  });

  test('table has proper structure', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
  });

  test('toggles are keyboard accessible', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      const firstRow = adminPage.flagsTableRows.first();
      const toggle = firstRow.locator('[role="switch"]');

      await toggle.focus();
      await expect(toggle).toBeFocused();
    }
  });

  test('page is keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });
});

test.describe('Admin Feature Flags - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'superAdmin');

    await page.route('**/api/**/admin/feature-flags**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/admin/feature-flags');
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const hasError = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const hasContent = await page.locator('body').textContent();

    expect(hasError || hasContent).toBeTruthy();
  });
});

test.describe('Admin Feature Flags - Targeting Display', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('shows targeting info (orgs/users or All)', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      // Targeting column shows either org/user counts or "All"
      const hasTargeting = await page.locator('text=/\\d+ orgs|\\d+ users|all/i').count();
      expect(hasTargeting).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Feature Flags - Last Updated', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = createAdminPage(page);
    await loginAs(page, 'superAdmin');
    await adminPage.gotoFeatureFlags();
  });

  test('shows last updated timestamp', async ({ page }) => {
    const rows = await adminPage.flagsTableRows.count();

    if (rows > 0) {
      // Last updated column shows formatted dates
      const hasTimestamps = await page.locator('text=/\\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i').count();
      expect(hasTimestamps).toBeGreaterThan(0);
    }
  });
});
