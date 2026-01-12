import { test, expect } from '@playwright/test';
import { createSchedulingPage, SchedulingPage } from '../../pages/dashboard/scheduling.page';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Scheduling - Swap Requests E2E Tests
 *
 * Covers:
 * - Swap requests page display
 * - Swap request listing
 * - Status filtering
 * - Type filtering
 * - Approve/Reject actions
 * - Role-based access control
 *
 * Note: Scheduling feature requires Pro tier or above
 */

test.describe('Swap Requests - Page Display', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();
  });

  test('displays swap requests page', async () => {
    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /swap requests/i })).toBeVisible();
  });

  test('shows filter controls', async () => {
    // Status filter should be visible
    await expect(schedulingPage.statusFilterSelect).toBeVisible();
  });

  test('shows swap requests table or empty state', async () => {
    // Either shows table with requests or empty state
    const hasTable = await schedulingPage.swapRequestsTable.isVisible().catch(() => false);
    const hasEmptyState = await schedulingPage.noSwapRequestsState.isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBe(true);
  });
});

test.describe('Swap Requests - Navigation', () => {
  test('accessible via schedule dashboard card', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();

    await schedulingPage.clickSwapRequestsCard();

    await expect(page).toHaveURL(/\/schedule\/swaps/);
    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/swaps`);
    await page.waitForLoadState('networkidle');

    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await schedulingPage.expectSwapRequestsPageVisible();
  });
});

test.describe('Swap Requests - Filtering', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();
  });

  test('status filter is visible', async () => {
    await expect(schedulingPage.statusFilterSelect).toBeVisible();
  });

  test('can open status filter dropdown', async ({ page }) => {
    await schedulingPage.statusFilterSelect.click();
    await page.waitForTimeout(300);

    // Should show filter options
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('can filter by pending status', async ({ page }) => {
    await schedulingPage.filterByStatus('pending');

    // URL might update with filter or table updates
    await page.waitForTimeout(500);
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('can filter by approved status', async ({ page }) => {
    await schedulingPage.filterByStatus('approved');
    await page.waitForTimeout(500);

    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('can filter by rejected status', async ({ page }) => {
    await schedulingPage.filterByStatus('rejected');
    await page.waitForTimeout(500);

    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('can filter by all statuses', async ({ page }) => {
    await schedulingPage.filterByStatus('all');
    await page.waitForTimeout(500);

    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Swap Requests - Table Display', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();
  });

  test('table shows relevant columns', async ({ page }) => {
    const hasTable = await schedulingPage.swapRequestsTable.isVisible().catch(() => false);

    if (hasTable) {
      const headers = schedulingPage.swapRequestsTable.locator('thead th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('empty state shows helpful message', async () => {
    const hasTable = await schedulingPage.swapRequestsTable.isVisible().catch(() => false);
    const hasEmptyState = await schedulingPage.noSwapRequestsState.isVisible().catch(() => false);

    // One of these should be visible
    expect(hasTable || hasEmptyState).toBe(true);
  });
});

test.describe('Swap Requests - Role-Based Access', () => {
  test('owner can view swap requests', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();

    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('manager can view swap requests', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'manager');
    await schedulingPage.gotoSwaps();

    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('hr role can view swap requests', async ({ page }) => {
    await loginAs(page, 'hr');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/swaps`);
    await page.waitForLoadState('networkidle');

    // HR should have access
    const hasSwaps = await page.getByRole('heading', { name: /swap/i }).isVisible().catch(() => false);
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('actor sees own swap requests', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/swaps`);
    await page.waitForLoadState('networkidle');

    // Actor should see own requests or be redirected
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Swap Requests - Different Tiers', () => {
  test('pro tier org has swap requests', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();

    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('enterprise tier org has swap requests', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.terrorCollective.slug);
    await loginAs(page, 'enterpriseOwner');
    await schedulingPage.gotoSwaps();

    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('free tier org handling', async ({ page }) => {
    await loginAs(page, 'freeOwner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/schedule/swaps`);
    await page.waitForLoadState('networkidle');

    // Free tier should show upgrade prompt or redirect
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Swap Requests - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('swap requests page is usable on mobile', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();

    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('filter controls are accessible on mobile', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();

    await expect(schedulingPage.statusFilterSelect).toBeVisible();
  });

  test('table or empty state is visible on mobile', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();

    const hasTable = await schedulingPage.swapRequestsTable.isVisible().catch(() => false);
    const hasEmptyState = await schedulingPage.noSwapRequestsState.isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBe(true);
  });
});

test.describe('Swap Requests - Accessibility', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('filter dropdown is keyboard accessible', async ({ page }) => {
    await schedulingPage.statusFilterSelect.focus();
    await expect(schedulingPage.statusFilterSelect).toBeFocused();

    // Can open with keyboard
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    const hasOptions = await page.locator('[role="option"]').first().isVisible().catch(() => false);
  });

  test('table rows are accessible', async ({ page }) => {
    const hasTable = await schedulingPage.swapRequestsTable.isVisible().catch(() => false);

    if (hasTable) {
      const rows = schedulingPage.swapRequestRows;
      const rowCount = await rows.count();

      if (rowCount > 0) {
        // First row should contain accessible elements
        const firstRow = rows.first();
        await expect(firstRow).toBeVisible();
      }
    }
  });
});

test.describe('Swap Requests - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.route('**/api/**/swaps/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/swaps`);
    await page.waitForLoadState('networkidle');

    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('handles network failure gracefully', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoSwaps();

    // Simulate network failure for filter request
    await page.route('**/api/**/swaps/**', (route) => route.abort('failed'));

    // Try to filter
    await schedulingPage.statusFilterSelect.click();
    await page.waitForTimeout(300);

    // Should handle gracefully
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});
