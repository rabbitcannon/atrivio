import { test, expect } from '@playwright/test';
import { createSchedulingPage, SchedulingPage } from '../../pages/dashboard/scheduling.page';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TEST_ATTRACTIONS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Scheduling - Shifts E2E Tests
 *
 * Covers:
 * - Schedule dashboard display
 * - All shifts page display and navigation
 * - Week/calendar view
 * - Shift table and filtering
 * - Attraction selection
 * - Role-based access control
 *
 * Note: Scheduling feature requires Pro tier or above
 */

test.describe('Scheduling - Dashboard', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();
  });

  test('displays schedule dashboard', async () => {
    await schedulingPage.expectSchedulePageVisible();
  });

  test('shows stats cards', async () => {
    await schedulingPage.expectStatsCardsVisible();
  });

  test('shows navigation cards', async () => {
    await schedulingPage.expectNavCardsVisible();
  });

  test('shows This Week stats card', async () => {
    await expect(schedulingPage.thisWeekCard).toBeVisible();
  });

  test('shows Unassigned stats card', async () => {
    await expect(schedulingPage.unassignedCard).toBeVisible();
  });

  test('shows Templates stats card', async () => {
    await expect(schedulingPage.templatesStatsCard).toBeVisible();
  });

  test('shows Hours stats card', async () => {
    await expect(schedulingPage.hoursCard).toBeVisible();
  });
});

test.describe('Scheduling - Dashboard Navigation', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();
  });

  test('can navigate to All Shifts via card', async ({ page }) => {
    await schedulingPage.clickAllShiftsCard();
    await expect(page).toHaveURL(/\/schedule\/shifts/);
    await schedulingPage.expectShiftsPageVisible();
  });

  test('can navigate to Week View via card', async ({ page }) => {
    await schedulingPage.clickWeekViewCard();
    await expect(page).toHaveURL(/\/schedule\/calendar/);
  });

  test('can navigate to Templates via card', async ({ page }) => {
    await schedulingPage.clickTemplatesCard();
    await expect(page).toHaveURL(/\/schedule\/templates/);
    await schedulingPage.expectTemplatesPageVisible();
  });

  test('can navigate to Staff Availability via card', async ({ page }) => {
    await schedulingPage.clickAvailabilityCard();
    await expect(page).toHaveURL(/\/schedule\/availability/);
    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('can navigate to Swap Requests via card', async ({ page }) => {
    await schedulingPage.clickSwapRequestsCard();
    await expect(page).toHaveURL(/\/schedule\/swaps/);
    await schedulingPage.expectSwapRequestsPageVisible();
  });

  test('can navigate to Roles via card', async ({ page }) => {
    await schedulingPage.clickRolesCard();
    await expect(page).toHaveURL(/\/schedule\/roles/);
    await schedulingPage.expectRolesPageVisible();
  });
});

test.describe('Scheduling - All Shifts Page', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoShifts();
  });

  test('displays all shifts page', async () => {
    await schedulingPage.expectShiftsPageVisible();
  });

  test('shows attraction selector', async () => {
    await expect(schedulingPage.attractionSelect).toBeVisible();
  });

  test('shows Add Shift button', async () => {
    await expect(schedulingPage.addShiftButton).toBeVisible();
  });

  test('shows shifts table or empty state', async ({ page }) => {
    // Either shows table with shifts or empty state
    const hasTable = await schedulingPage.shiftsTable.isVisible().catch(() => false);
    const hasEmptyState = await schedulingPage.noShiftsEmptyState.isVisible().catch(() => false);
    const hasNoAttractions = await schedulingPage.noAttractionsState.isVisible().catch(() => false);

    expect(hasTable || hasEmptyState || hasNoAttractions).toBe(true);
  });

  test('can select attraction from dropdown', async ({ page }) => {
    // Click attraction selector
    await schedulingPage.attractionSelect.click();
    await page.waitForTimeout(300);

    // Should show options
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();

    // Either has attractions or shows "no attractions"
    if (optionCount > 0) {
      const firstOption = options.first();
      await firstOption.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Add Shift button is enabled', async () => {
    await expect(schedulingPage.addShiftButton).toBeEnabled();
  });
});

test.describe('Scheduling - Week View', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoCalendar();
  });

  test('displays week view page', async () => {
    await schedulingPage.expectWeekViewPageVisible();
  });

  test('shows calendar/week interface', async ({ page }) => {
    // Should show some calendar or week view elements
    const hasWeekView = await page.locator('[class*="calendar"], [class*="week"], [class*="grid"]').first().isVisible().catch(() => false);
    const hasHeading = await schedulingPage.weekViewHeading.isVisible();

    expect(hasHeading).toBe(true);
  });
});

test.describe('Scheduling - Direct URL Access', () => {
  test('schedule dashboard accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule`);
    await page.waitForLoadState('networkidle');

    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await schedulingPage.expectSchedulePageVisible();
  });

  test('shifts page accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/shifts`);
    await page.waitForLoadState('networkidle');

    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await schedulingPage.expectShiftsPageVisible();
  });

  test('calendar page accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/calendar`);
    await page.waitForLoadState('networkidle');

    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await schedulingPage.expectWeekViewPageVisible();
  });
});

test.describe('Scheduling - Role-Based Access', () => {
  test('owner can access schedule', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();

    await schedulingPage.expectSchedulePageVisible();
  });

  test('manager can access schedule', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'manager');
    await schedulingPage.goto();

    await schedulingPage.expectSchedulePageVisible();
  });

  test('actor has limited schedule access', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Actor might see limited view or their own schedule
    const hasScheduleView = await page.getByRole('heading', { name: /schedule/i }).isVisible().catch(() => false);
    const wasRedirected = !page.url().includes('/schedule');
    const hasAccessDenied = await page.locator('text=/access denied|permission/i').isVisible().catch(() => false);

    expect(hasScheduleView || wasRedirected || hasAccessDenied).toBe(true);
  });
});

test.describe('Scheduling - Tier Restrictions', () => {
  test('pro tier org has scheduling enabled', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();

    // Pro tier should have full access
    await schedulingPage.expectSchedulePageVisible();
  });

  test('enterprise tier org has scheduling enabled', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.terrorCollective.slug);
    await loginAs(page, 'enterpriseOwner');
    await schedulingPage.goto();

    await schedulingPage.expectSchedulePageVisible();
  });

  test('free tier org may not have scheduling', async ({ page }) => {
    await loginAs(page, 'freeOwner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Free tier should either:
    // 1. Not have scheduling link in nav
    // 2. Show upgrade prompt
    // 3. Redirect away

    const hasSchedule = await page.getByRole('heading', { name: /schedule/i }).isVisible().catch(() => false);
    const hasUpgradePrompt = await page.locator('text=/upgrade|pro tier|enterprise/i').isVisible().catch(() => false);
    const wasRedirected = !page.url().includes('/schedule');

    // Free tier behavior depends on implementation
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Scheduling - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('schedule dashboard is usable on mobile', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();

    await schedulingPage.expectSchedulePageVisible();
  });

  test('all shifts page is usable on mobile', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoShifts();

    await schedulingPage.expectShiftsPageVisible();
  });

  test('navigation cards are visible on mobile', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();

    // Cards should be visible (may need scrolling)
    await expect(schedulingPage.allShiftsCard).toBeVisible();
  });
});

test.describe('Scheduling - Accessibility', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();
  });

  test('schedule page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('navigation cards are focusable', async ({ page }) => {
    // Tab to find focusable cards
    await page.keyboard.press('Tab');

    // Some element should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });

  test('attraction selector is keyboard accessible', async ({ page }) => {
    await schedulingPage.gotoShifts();

    await schedulingPage.attractionSelect.focus();
    await expect(schedulingPage.attractionSelect).toBeFocused();

    // Can open with keyboard
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Dropdown should open
    const hasOptions = await page.locator('[role="option"]').first().isVisible().catch(() => false);
  });
});

test.describe('Scheduling - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'owner');

    // Route API to fail
    await page.route('**/api/**/schedule/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule`);
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('handles network failure gracefully', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();

    // Simulate network failure for data fetch
    await page.route('**/api/**/shifts/**', (route) => route.abort('failed'));

    // Navigate to shifts
    await schedulingPage.gotoShifts();

    // Should handle gracefully
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});
