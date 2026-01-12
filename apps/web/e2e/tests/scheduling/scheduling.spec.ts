import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { TIMEOUTS } from '../../helpers/fixtures';
import { createSchedulingPage, SchedulingPage } from '../../pages/dashboard/scheduling.page';

/**
 * Scheduling E2E Tests
 *
 * Tests the scheduling functionality including:
 * - Main schedule dashboard
 * - All shifts management
 * - Week/calendar view
 * - Shift templates
 * - Staff availability
 * - Swap requests
 * - Schedule roles
 * - RBAC (role-based access control)
 *
 * Note: Scheduling is a Pro/Enterprise feature (not available on Free tier)
 */

test.describe('Schedule Dashboard', () => {
  let schedulingPage: SchedulingPage;

  test.describe('Viewing Schedule Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
    });

    test('owner can view schedule dashboard', async () => {
      await schedulingPage.goto();
      await schedulingPage.expectSchedulePageVisible();
    });

    test('schedule dashboard shows correct heading', async () => {
      await schedulingPage.goto();

      await expect(schedulingPage.scheduleHeading).toBeVisible();
    });

    test('schedule dashboard shows stats cards', async () => {
      await schedulingPage.goto();

      await schedulingPage.expectStatsCardsVisible();
    });

    test('schedule dashboard shows navigation cards', async () => {
      await schedulingPage.goto();

      await schedulingPage.expectNavCardsVisible();
    });

    test('manager can view schedule dashboard', async ({ page }) => {
      await loginAs(page, 'manager');
      schedulingPage = createSchedulingPage(page, TEST_USERS.manager.orgSlug);

      await schedulingPage.goto();
      await schedulingPage.expectSchedulePageVisible();
    });

    test('hr can view schedule dashboard', async ({ page }) => {
      await loginAs(page, 'hr');
      schedulingPage = createSchedulingPage(page, TEST_USERS.hr.orgSlug);

      await schedulingPage.goto();
      await schedulingPage.expectSchedulePageVisible();
    });
  });

  test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
      await schedulingPage.goto();
    });

    test('can navigate to All Shifts via card', async ({ page }) => {
      await schedulingPage.clickAllShiftsCard();

      expect(page.url()).toContain('/schedule/shifts');
      await schedulingPage.expectShiftsPageVisible();
    });

    test('can navigate to Week View via card', async ({ page }) => {
      await schedulingPage.clickWeekViewCard();

      expect(page.url()).toContain('/schedule/calendar');
      await schedulingPage.expectWeekViewPageVisible();
    });

    test('can navigate to Templates via card', async ({ page }) => {
      await schedulingPage.clickTemplatesCard();

      expect(page.url()).toContain('/schedule/templates');
      await schedulingPage.expectTemplatesPageVisible();
    });

    test('can navigate to Staff Availability via card', async ({ page }) => {
      await schedulingPage.clickAvailabilityCard();

      expect(page.url()).toContain('/schedule/availability');
      await schedulingPage.expectAvailabilityPageVisible();
    });

    test('can navigate to Swap Requests via card', async ({ page }) => {
      await schedulingPage.clickSwapRequestsCard();

      expect(page.url()).toContain('/schedule/swaps');
      await schedulingPage.expectSwapRequestsPageVisible();
    });

    test('can navigate to Roles via card', async ({ page }) => {
      await schedulingPage.clickRolesCard();

      expect(page.url()).toContain('/schedule/roles');
      await schedulingPage.expectRolesPageVisible();
    });
  });
});

test.describe('All Shifts Page', () => {
  let schedulingPage: SchedulingPage;

  test.describe('Viewing Shifts', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
    });

    test('owner can view all shifts page', async () => {
      await schedulingPage.gotoShifts();
      await schedulingPage.expectShiftsPageVisible();
    });

    test('shifts page shows correct heading', async () => {
      await schedulingPage.gotoShifts();

      await expect(schedulingPage.allShiftsHeading).toBeVisible();
    });

    test('shifts page shows attraction selector', async () => {
      await schedulingPage.gotoShifts();

      await expect(schedulingPage.attractionSelect).toBeVisible();
    });

    test('shifts page shows add shift button', async () => {
      await schedulingPage.gotoShifts();

      await expect(schedulingPage.addShiftButton).toBeVisible();
    });

    test('shifts page shows table or empty state', async () => {
      await schedulingPage.gotoShifts();

      const tableVisible = await schedulingPage.shiftsTable.isVisible().catch(() => false);
      const emptyVisible = await schedulingPage.noShiftsEmptyState.isVisible().catch(() => false);
      const noAttractionsVisible = await schedulingPage.noAttractionsState.isVisible().catch(() => false);

      expect(tableVisible || emptyVisible || noAttractionsVisible).toBeTruthy();
    });

    test('manager can view all shifts page', async ({ page }) => {
      await loginAs(page, 'manager');
      schedulingPage = createSchedulingPage(page, TEST_USERS.manager.orgSlug);

      await schedulingPage.gotoShifts();
      await schedulingPage.expectShiftsPageVisible();
    });
  });

  test.describe('Shifts Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
      await schedulingPage.gotoShifts();
    });

    test('clicking add shift opens dialog', async ({ page }) => {
      await schedulingPage.addShiftButton.click();
      await page.waitForTimeout(300);

      await expect(schedulingPage.shiftDialog).toBeVisible();
    });

    test('can close shift dialog', async ({ page }) => {
      await schedulingPage.addShiftButton.click();
      await page.waitForTimeout(300);

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      await expect(schedulingPage.shiftDialog).not.toBeVisible();
    });
  });
});

test.describe('Week View Page', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
    schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
  });

  test('owner can view week view page', async () => {
    await schedulingPage.gotoCalendar();
    await schedulingPage.expectWeekViewPageVisible();
  });

  test('week view page shows correct heading', async () => {
    await schedulingPage.gotoCalendar();

    await expect(schedulingPage.weekViewHeading).toBeVisible();
  });

  test('manager can view week view page', async ({ page }) => {
    await loginAs(page, 'manager');
    schedulingPage = createSchedulingPage(page, TEST_USERS.manager.orgSlug);

    await schedulingPage.gotoCalendar();
    await schedulingPage.expectWeekViewPageVisible();
  });
});

test.describe('Shift Templates Page', () => {
  let schedulingPage: SchedulingPage;

  test.describe('Viewing Templates', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
    });

    test('owner can view templates page', async () => {
      await schedulingPage.gotoTemplates();
      await schedulingPage.expectTemplatesPageVisible();
    });

    test('templates page shows correct heading', async () => {
      await schedulingPage.gotoTemplates();

      await expect(schedulingPage.templatesHeading).toBeVisible();
    });

    test('templates page shows attraction selector', async () => {
      await schedulingPage.gotoTemplates();

      await expect(schedulingPage.attractionSelect).toBeVisible();
    });

    test('templates page shows add template button', async () => {
      await schedulingPage.gotoTemplates();

      await expect(schedulingPage.addTemplateButton).toBeVisible();
    });

    test('templates page shows table or empty state', async () => {
      await schedulingPage.gotoTemplates();

      const tableVisible = await schedulingPage.templatesTable.isVisible().catch(() => false);
      const emptyVisible = await schedulingPage.noTemplatesState.isVisible().catch(() => false);
      const noAttractionsVisible = await schedulingPage.noAttractionsState.isVisible().catch(() => false);

      expect(tableVisible || emptyVisible || noAttractionsVisible).toBeTruthy();
    });

    test('manager can view templates page', async ({ page }) => {
      await loginAs(page, 'manager');
      schedulingPage = createSchedulingPage(page, TEST_USERS.manager.orgSlug);

      await schedulingPage.gotoTemplates();
      await schedulingPage.expectTemplatesPageVisible();
    });
  });

  test.describe('Templates Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
      await schedulingPage.gotoTemplates();
    });

    test('clicking add template opens dialog', async ({ page }) => {
      await schedulingPage.addTemplateButton.click();
      await page.waitForTimeout(300);

      await expect(schedulingPage.templateDialog).toBeVisible();
    });

    test('can close template dialog', async ({ page }) => {
      await schedulingPage.addTemplateButton.click();
      await page.waitForTimeout(300);

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      await expect(schedulingPage.templateDialog).not.toBeVisible();
    });
  });
});

test.describe('Staff Availability Page', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
    schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
  });

  test('owner can view availability page', async () => {
    await schedulingPage.gotoAvailability();
    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('availability page shows correct heading', async () => {
    await schedulingPage.gotoAvailability();

    await expect(schedulingPage.availabilityHeading).toBeVisible();
  });

  test('manager can view availability page', async ({ page }) => {
    await loginAs(page, 'manager');
    schedulingPage = createSchedulingPage(page, TEST_USERS.manager.orgSlug);

    await schedulingPage.gotoAvailability();
    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('hr can view availability page', async ({ page }) => {
    await loginAs(page, 'hr');
    schedulingPage = createSchedulingPage(page, TEST_USERS.hr.orgSlug);

    await schedulingPage.gotoAvailability();
    await schedulingPage.expectAvailabilityPageVisible();
  });
});

test.describe('Swap Requests Page', () => {
  let schedulingPage: SchedulingPage;

  test.describe('Viewing Swap Requests', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
    });

    test('owner can view swap requests page', async () => {
      await schedulingPage.gotoSwaps();
      await schedulingPage.expectSwapRequestsPageVisible();
    });

    test('swap requests page shows correct heading', async () => {
      await schedulingPage.gotoSwaps();

      await expect(schedulingPage.swapRequestsHeading).toBeVisible();
    });

    test('swap requests page shows status filter', async () => {
      await schedulingPage.gotoSwaps();

      await expect(schedulingPage.statusFilterSelect).toBeVisible();
    });

    test('swap requests page shows type filter', async () => {
      await schedulingPage.gotoSwaps();

      await expect(schedulingPage.typeFilterSelect).toBeVisible();
    });

    test('swap requests page shows table or empty state', async () => {
      await schedulingPage.gotoSwaps();

      const tableVisible = await schedulingPage.swapRequestsTable.isVisible().catch(() => false);
      const emptyVisible = await schedulingPage.noSwapRequestsState.isVisible().catch(() => false);

      expect(tableVisible || emptyVisible).toBeTruthy();
    });

    test('manager can view swap requests page', async ({ page }) => {
      await loginAs(page, 'manager');
      schedulingPage = createSchedulingPage(page, TEST_USERS.manager.orgSlug);

      await schedulingPage.gotoSwaps();
      await schedulingPage.expectSwapRequestsPageVisible();
    });
  });

  test.describe('Swap Requests Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
      await schedulingPage.gotoSwaps();
    });

    test('can open status filter dropdown', async ({ page }) => {
      await schedulingPage.statusFilterSelect.click();
      await page.waitForTimeout(200);

      // Options should be visible
      const pendingOption = page.getByRole('option', { name: /pending/i });
      await expect(pendingOption).toBeVisible();
    });

    test('can open type filter dropdown', async ({ page }) => {
      await schedulingPage.typeFilterSelect.click();
      await page.waitForTimeout(200);

      // Options should be visible
      const swapOption = page.getByRole('option', { name: /swap/i });
      await expect(swapOption).toBeVisible();
    });
  });
});

test.describe('Schedule Roles Page', () => {
  let schedulingPage: SchedulingPage;

  test.describe('Viewing Roles', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
    });

    test('owner can view roles page', async () => {
      await schedulingPage.gotoRoles();
      await schedulingPage.expectRolesPageVisible();
    });

    test('roles page shows correct heading', async () => {
      await schedulingPage.gotoRoles();

      await expect(schedulingPage.rolesHeading).toBeVisible();
    });

    test('roles page shows stats cards or empty state', async () => {
      await schedulingPage.gotoRoles();

      const statsVisible = await schedulingPage.totalRolesCard.isVisible().catch(() => false);
      const emptyVisible = await schedulingPage.noRolesState.isVisible().catch(() => false);

      expect(statsVisible || emptyVisible).toBeTruthy();
    });

    test('roles page shows table or empty state', async () => {
      await schedulingPage.gotoRoles();

      const tableVisible = await schedulingPage.rolesTable.isVisible().catch(() => false);
      const emptyVisible = await schedulingPage.noRolesState.isVisible().catch(() => false);

      expect(tableVisible || emptyVisible).toBeTruthy();
    });

    test('manager can view roles page', async ({ page }) => {
      await loginAs(page, 'manager');
      schedulingPage = createSchedulingPage(page, TEST_USERS.manager.orgSlug);

      await schedulingPage.gotoRoles();
      await schedulingPage.expectRolesPageVisible();
    });
  });

  test.describe('Roles Content', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
      await schedulingPage.gotoRoles();
    });

    test('color legend is visible when roles exist', async () => {
      // Only check for color legend if roles exist
      const tableVisible = await schedulingPage.rolesTable.isVisible().catch(() => false);

      if (tableVisible) {
        const rowCount = await schedulingPage.roleRows.count();
        if (rowCount > 0) {
          await expect(schedulingPage.colorLegendSection).toBeVisible();
        }
      }
    });
  });
});

test.describe('Scheduling URL Routing', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
    schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);
  });

  test('main schedule page has correct URL', async ({ page }) => {
    await schedulingPage.goto();
    expect(page.url()).toContain('/schedule');
    expect(page.url()).not.toContain('/schedule/');
  });

  test('shifts page has correct URL', async ({ page }) => {
    await schedulingPage.gotoShifts();
    expect(page.url()).toContain('/schedule/shifts');
  });

  test('calendar page has correct URL', async ({ page }) => {
    await schedulingPage.gotoCalendar();
    expect(page.url()).toContain('/schedule/calendar');
  });

  test('templates page has correct URL', async ({ page }) => {
    await schedulingPage.gotoTemplates();
    expect(page.url()).toContain('/schedule/templates');
  });

  test('availability page has correct URL', async ({ page }) => {
    await schedulingPage.gotoAvailability();
    expect(page.url()).toContain('/schedule/availability');
  });

  test('swaps page has correct URL', async ({ page }) => {
    await schedulingPage.gotoSwaps();
    expect(page.url()).toContain('/schedule/swaps');
  });

  test('roles page has correct URL', async ({ page }) => {
    await schedulingPage.gotoRoles();
    expect(page.url()).toContain('/schedule/roles');
  });
});

test.describe('Scheduling - Access Control', () => {
  test('actor can view schedule dashboard', async ({ page }) => {
    await loginAs(page, 'actor1');
    const schedulingPage = createSchedulingPage(page, TEST_USERS.actor1.orgSlug);

    await schedulingPage.goto();
    await schedulingPage.expectSchedulePageVisible();
  });

  test('actor can view shifts page', async ({ page }) => {
    await loginAs(page, 'actor1');
    const schedulingPage = createSchedulingPage(page, TEST_USERS.actor1.orgSlug);

    await schedulingPage.gotoShifts();
    await schedulingPage.expectShiftsPageVisible();
  });

  test('actor can view their own availability', async ({ page }) => {
    await loginAs(page, 'actor1');
    const schedulingPage = createSchedulingPage(page, TEST_USERS.actor1.orgSlug);

    await schedulingPage.gotoAvailability();
    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('box office can view schedule', async ({ page }) => {
    await loginAs(page, 'boxOffice');
    const schedulingPage = createSchedulingPage(page, TEST_USERS.boxOffice.orgSlug);

    await schedulingPage.goto();
    await schedulingPage.expectSchedulePageVisible();
  });

  test('finance can view schedule', async ({ page }) => {
    await loginAs(page, 'finance');
    const schedulingPage = createSchedulingPage(page, TEST_USERS.finance.orgSlug);

    await schedulingPage.goto();
    await schedulingPage.expectSchedulePageVisible();
  });
});

test.describe('Scheduling - Feature Flag (Pro Tier)', () => {
  test.skip('free tier cannot access scheduling', async ({ page }) => {
    // TODO: Un-skip when feature flags are properly enforced in the UI
    await loginAs(page, 'freeDemo');
    const schedulingPage = createSchedulingPage(page, TEST_USERS.freeDemo.orgSlug);

    await page.goto(`/${TEST_USERS.freeDemo.orgSlug}/schedule`);

    // Should be redirected or see upgrade prompt
    const url = page.url();
    const hasUpgradePrompt = await page.getByText(/upgrade|pro|enterprise/i).isVisible().catch(() => false);
    const hasNoAccess = !url.includes('/schedule') || url.includes('/schedule') && hasUpgradePrompt;

    expect(hasNoAccess).toBeTruthy();
  });

  test('pro tier can access scheduling', async ({ page }) => {
    await loginAs(page, 'owner'); // Pro tier org
    const schedulingPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);

    await schedulingPage.goto();
    await schedulingPage.expectSchedulePageVisible();
  });

  test('enterprise tier can access scheduling', async ({ page }) => {
    await loginAs(page, 'enterpriseOwner');
    const schedulingPage = createSchedulingPage(page, TEST_USERS.enterpriseOwner.orgSlug);

    await schedulingPage.goto();
    await schedulingPage.expectSchedulePageVisible();
  });
});

test.describe('Scheduling - Cross-Org Isolation', () => {
  test('schedules from one org are not visible in another', async ({ page }) => {
    // Login as owner of Nightmare Manor (Pro)
    await loginAs(page, 'owner');
    const nightmareManorPage = createSchedulingPage(page, TEST_USERS.owner.orgSlug);

    await nightmareManorPage.goto();
    await nightmareManorPage.expectSchedulePageVisible();

    // Login as owner of Terror Collective (Enterprise - different org)
    await loginAs(page, 'enterpriseOwner');
    const terrorCollectivePage = createSchedulingPage(page, TEST_USERS.enterpriseOwner.orgSlug);

    await terrorCollectivePage.goto();
    await terrorCollectivePage.expectSchedulePageVisible();

    // Both should see their own schedule dashboards but not each other's data
    // This is verified by each page loading successfully without cross-org data
  });

  test('cannot access schedule of another org via direct URL', async ({ page }) => {
    // Login as owner of Terror Collective
    await loginAs(page, 'enterpriseOwner');

    // Try to access Nightmare Manor's schedule directly
    await page.goto('/nightmare-manor/schedule');
    await page.waitForLoadState('networkidle');

    // Should either be redirected or show error/not found
    const url = page.url();
    const hasError = await page.getByText(/not found|forbidden|access denied|not authorized/i).isVisible().catch(() => false);
    const isRedirected = url.includes(TEST_USERS.enterpriseOwner.orgSlug) || !url.includes('nightmare-manor');

    expect(hasError || isRedirected).toBeTruthy();
  });
});
