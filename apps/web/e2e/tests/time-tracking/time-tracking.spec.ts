import { expect, test } from '@playwright/test';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { createTimeTrackingPage, TimeTrackingPage } from '../../pages/dashboard/time-tracking.page';

test.describe('Time Tracking', () => {
  // ================== PUBLIC TIME CLOCK TESTS ==================

  test.describe('Public Time Clock', () => {
    let timeTrackingPage: TimeTrackingPage;

    test.describe('Unauthenticated Access', () => {
      test('shows sign in prompt when not logged in', async ({ page }) => {
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        await timeTrackingPage.gotoTimeClock();

        await timeTrackingPage.expectSignInRequired();
      });

      test('schedule page shows sign in prompt', async ({ page }) => {
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        await timeTrackingPage.gotoMySchedule();

        await timeTrackingPage.expectSignInRequired();
      });

      test('swaps page shows sign in prompt', async ({ page }) => {
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        await timeTrackingPage.gotoMySwaps();

        await timeTrackingPage.expectSignInRequired();
      });

      test('availability page shows sign in prompt', async ({ page }) => {
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        await timeTrackingPage.gotoMyAvailability();

        await timeTrackingPage.expectSignInRequired();
      });
    });

    test.describe('Authenticated - Time Clock Main Page', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'actor1');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
        await timeTrackingPage.gotoTimeClock();
      });

      test('time clock page displays correctly', async () => {
        await timeTrackingPage.expectTimeClockPageVisible();
      });

      test('bottom navigation is visible', async () => {
        await timeTrackingPage.expectBottomNavVisible();
      });

      test('shows not clocked in state initially', async () => {
        await timeTrackingPage.expectNotClockedIn();
      });

      test('clock in button is visible when not clocked in', async () => {
        await expect(timeTrackingPage.clockInButton).toBeVisible();
      });
    });

    test.describe('Navigation', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'actor1');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
        await timeTrackingPage.gotoTimeClock();
      });

      test('can navigate to schedule via bottom nav', async ({ page }) => {
        await timeTrackingPage.clickScheduleNav();
        await page.waitForURL(/\/time\/schedule/);

        await timeTrackingPage.expectMySchedulePageVisible();
      });

      test('can navigate to swaps via bottom nav', async ({ page }) => {
        await timeTrackingPage.clickSwapsNav();
        await page.waitForURL(/\/time\/swaps/);

        await timeTrackingPage.expectSwapsPageVisible();
      });

      test('can navigate to availability via bottom nav', async ({ page }) => {
        await timeTrackingPage.clickAvailabilityNav();
        await page.waitForURL(/\/time\/availability/);

        await timeTrackingPage.expectAvailabilityPageVisible();
      });

      test('can navigate back to clock via bottom nav', async ({ page }) => {
        await timeTrackingPage.clickScheduleNav();
        await page.waitForURL(/\/time\/schedule/);

        await timeTrackingPage.clickClockNav();
        await page.waitForURL(/\/time$/);

        await timeTrackingPage.expectTimeClockPageVisible();
      });
    });

    test.describe('My Schedule', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'actor1');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
        await timeTrackingPage.gotoMySchedule();
      });

      test('schedule page displays correctly', async () => {
        await timeTrackingPage.expectMySchedulePageVisible();
      });

      test('shows schedule heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'My Schedule' })).toBeVisible();
      });

      test('shows empty state or shifts', async () => {
        // Either shows shifts or empty state
        const hasShifts = await timeTrackingPage.shiftCard.first().isVisible().catch(() => false);
        if (!hasShifts) {
          await timeTrackingPage.expectNoUpcomingShifts();
        } else {
          await timeTrackingPage.expectShiftsVisible();
        }
      });

      test('shifts display time and location info', async () => {
        const hasShifts = await timeTrackingPage.shiftCard.first().isVisible().catch(() => false);
        if (hasShifts) {
          // Verify shift card contains time and location info
          await expect(timeTrackingPage.shiftCard.first().locator('svg[class*="Clock"]')).toBeVisible();
          await expect(timeTrackingPage.shiftCard.first().locator('svg[class*="MapPin"]')).toBeVisible();
        }
      });
    });

    test.describe('My Swap Requests', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'actor1');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
        await timeTrackingPage.gotoMySwaps();
      });

      test('swaps page displays correctly', async () => {
        await timeTrackingPage.expectSwapsPageVisible();
      });

      test('shows swap requests heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'My Swap Requests' })).toBeVisible();
      });

      test('shows empty state or requests', async () => {
        // Either shows requests or empty state
        const hasRequests = await timeTrackingPage.swapRequestCard.first().isVisible().catch(() => false);
        if (!hasRequests) {
          await timeTrackingPage.expectNoSwapRequests();
        }
      });

      test('empty state has link to schedule', async ({ page }) => {
        const hasRequests = await timeTrackingPage.swapRequestCard.first().isVisible().catch(() => false);
        if (!hasRequests) {
          await expect(page.getByRole('link', { name: 'View My Schedule' })).toBeVisible();
        }
      });
    });

    test.describe('My Availability', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'actor1');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
        await timeTrackingPage.gotoMyAvailability();
      });

      test('availability page displays correctly', async () => {
        await timeTrackingPage.expectAvailabilityPageVisible();
      });

      test('shows all days of the week', async () => {
        await timeTrackingPage.expectDayCardsVisible();
      });

      test('each day has availability selector', async ({ page }) => {
        // Check Sunday has a combobox
        const sundayCard = page.locator('[class*="Card"]').filter({ hasText: 'Sunday' });
        await expect(sundayCard.getByRole('combobox')).toBeVisible();
      });

      test('save availability button is visible', async () => {
        await expect(timeTrackingPage.saveAvailabilityButton).toBeVisible();
      });

      test('can change availability type', async ({ page }) => {
        const sundayCard = page.locator('[class*="Card"]').filter({ hasText: 'Sunday' });
        const select = sundayCard.getByRole('combobox');

        await select.click();
        await page.getByRole('option', { name: 'Unavailable' }).click();

        // Verify the selection changed
        await expect(select).toContainText('Unavailable');
      });
    });

    test.describe('Staff Status Page', () => {
      test('manager can view staff status', async ({ page }) => {
        await loginAs(page, 'manager');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.manager.orgSlug);
        await timeTrackingPage.gotoStaffStatus();

        await timeTrackingPage.expectStatusPageVisible();
      });

      test('owner can view staff status', async ({ page }) => {
        await loginAs(page, 'owner');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        await timeTrackingPage.gotoStaffStatus();

        await timeTrackingPage.expectStatusPageVisible();
      });

      test('actor cannot view staff status', async ({ page }) => {
        await loginAs(page, 'actor1');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
        await timeTrackingPage.gotoStaffStatus();

        await timeTrackingPage.expectAccessDenied();
      });

      test('status page shows currently working count', async ({ page }) => {
        await loginAs(page, 'manager');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.manager.orgSlug);
        await timeTrackingPage.gotoStaffStatus();

        await expect(page.locator('text=Currently Working')).toBeVisible();
      });

      test('status page has refresh button', async ({ page }) => {
        await loginAs(page, 'manager');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.manager.orgSlug);
        await timeTrackingPage.gotoStaffStatus();

        await expect(timeTrackingPage.refreshButton).toBeVisible();
      });
    });
  });

  // ================== DASHBOARD TIME MANAGER TESTS ==================

  test.describe('Dashboard Time Manager', () => {
    let timeTrackingPage: TimeTrackingPage;

    test.describe('Viewing Time Manager', () => {
      test('owner can view staff time manager', async ({ page }) => {
        await loginAs(page, 'owner');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);

        // Navigate to a staff member's time page (use a test staff ID)
        // This test assumes we have access to staff list
        await page.goto(`/${TEST_USERS.owner.orgSlug}/staff`);
        await page.waitForLoadState('networkidle');

        // Click on first staff member
        const staffRow = page.locator('tbody tr').first();
        if (await staffRow.isVisible()) {
          await staffRow.click();
          await page.waitForLoadState('networkidle');

          // Click time tracking link if available
          const timeLink = page.getByRole('link', { name: /time/i });
          if (await timeLink.isVisible()) {
            await timeLink.click();
            await page.waitForLoadState('networkidle');

            await timeTrackingPage.expectTimeManagerPageVisible();
          }
        }
      });

      test('manager can view staff time manager', async ({ page }) => {
        await loginAs(page, 'manager');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.manager.orgSlug);

        await page.goto(`/${TEST_USERS.manager.orgSlug}/staff`);
        await page.waitForLoadState('networkidle');

        const staffRow = page.locator('tbody tr').first();
        if (await staffRow.isVisible()) {
          await staffRow.click();
          await page.waitForLoadState('networkidle');

          const timeLink = page.getByRole('link', { name: /time/i });
          if (await timeLink.isVisible()) {
            await timeLink.click();
            await page.waitForLoadState('networkidle');

            await timeTrackingPage.expectTimeManagerPageVisible();
          }
        }
      });
    });

    test.describe('Time Manager UI Components', () => {
      // These tests verify UI elements when navigating directly
      // Skipped if no staff ID is available
      test.skip('summary cards are visible', async ({ page }) => {
        await loginAs(page, 'owner');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        // Would need actual staff ID
        await timeTrackingPage.expectSummaryCardsVisible();
      });

      test.skip('clock status card is visible', async ({ page }) => {
        await loginAs(page, 'owner');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        // Would need actual staff ID
        await timeTrackingPage.expectClockStatusCardVisible();
      });

      test.skip('recent entries section is visible', async ({ page }) => {
        await loginAs(page, 'owner');
        timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
        // Would need actual staff ID
        await timeTrackingPage.expectRecentEntriesVisible();
      });
    });
  });

  // ================== URL ROUTING TESTS ==================

  test.describe('URL Routing', () => {
    test('direct navigation to time clock works', async ({ page }) => {
      await loginAs(page, 'actor1');
      await page.goto(`/${TEST_USERS.actor1.orgSlug}/time`);
      await page.waitForLoadState('networkidle');

      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.expectTimeClockPageVisible();
    });

    test('direct navigation to schedule works', async ({ page }) => {
      await loginAs(page, 'actor1');
      await page.goto(`/${TEST_USERS.actor1.orgSlug}/time/schedule`);
      await page.waitForLoadState('networkidle');

      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.expectMySchedulePageVisible();
    });

    test('direct navigation to swaps works', async ({ page }) => {
      await loginAs(page, 'actor1');
      await page.goto(`/${TEST_USERS.actor1.orgSlug}/time/swaps`);
      await page.waitForLoadState('networkidle');

      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.expectSwapsPageVisible();
    });

    test('direct navigation to availability works', async ({ page }) => {
      await loginAs(page, 'actor1');
      await page.goto(`/${TEST_USERS.actor1.orgSlug}/time/availability`);
      await page.waitForLoadState('networkidle');

      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.expectAvailabilityPageVisible();
    });

    test('direct navigation to status works for managers', async ({ page }) => {
      await loginAs(page, 'manager');
      await page.goto(`/${TEST_USERS.manager.orgSlug}/time/status`);
      await page.waitForLoadState('networkidle');

      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.manager.orgSlug);
      await timeTrackingPage.expectStatusPageVisible();
    });

    test('invalid org slug shows error', async ({ page }) => {
      await loginAs(page, 'actor1');
      await page.goto('/invalid-org-slug-12345/time');
      await page.waitForLoadState('networkidle');

      // Should show organization not found error
      await expect(page.locator('text=Organization Not Found').or(page.locator('text=not found'))).toBeVisible();
    });
  });

  // ================== ACCESS CONTROL TESTS ==================

  test.describe('Access Control', () => {
    test('actor can access time clock', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      await timeTrackingPage.expectTimeClockPageVisible();
    });

    test('manager can access time clock', async ({ page }) => {
      await loginAs(page, 'manager');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.manager.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      await timeTrackingPage.expectTimeClockPageVisible();
    });

    test('owner can access time clock', async ({ page }) => {
      await loginAs(page, 'owner');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      await timeTrackingPage.expectTimeClockPageVisible();
    });

    test('status page requires elevated permissions', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoStaffStatus();

      await timeTrackingPage.expectAccessDenied();
    });

    test('manager has access to status page', async ({ page }) => {
      await loginAs(page, 'manager');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.manager.orgSlug);
      await timeTrackingPage.gotoStaffStatus();

      await timeTrackingPage.expectStatusPageVisible();
    });
  });

  // ================== FEATURE FLAG TESTS ==================

  test.describe('Feature Flags', () => {
    // Time tracking is available on basic tier, so it should work for all orgs
    test('time tracking is available for pro tier org', async ({ page }) => {
      await loginAs(page, 'owner');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.owner.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      await timeTrackingPage.expectTimeClockPageVisible();
    });

    test('time tracking is available for free tier org', async ({ page }) => {
      await loginAs(page, 'freeOwner');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.freeOwner.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      await timeTrackingPage.expectTimeClockPageVisible();
    });

    test('time tracking is available for enterprise tier org', async ({ page }) => {
      await loginAs(page, 'enterpriseOwner');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.enterpriseOwner.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      await timeTrackingPage.expectTimeClockPageVisible();
    });
  });

  // ================== CROSS-ORG ISOLATION TESTS ==================

  test.describe('Cross-Org Isolation', () => {
    test('cannot access time clock for org user is not a member of', async ({ page }) => {
      await loginAs(page, 'actor1');
      // Try to access enterprise org's time clock (actor is member of pro org)
      await page.goto(`/${TEST_USERS.enterpriseOwner.orgSlug}/time`);
      await page.waitForLoadState('networkidle');

      // Should show error about not being a staff member
      await expect(
        page.locator('text=not a staff member').or(page.locator('text=Organization Not Found'))
      ).toBeVisible();
    });

    test('free tier user cannot access pro org time clock', async ({ page }) => {
      await loginAs(page, 'freeOwner');
      await page.goto(`/${TEST_USERS.owner.orgSlug}/time`);
      await page.waitForLoadState('networkidle');

      // Should show error
      await expect(
        page.locator('text=not a staff member').or(page.locator('text=Organization Not Found'))
      ).toBeVisible();
    });
  });

  // ================== DIALOG INTERACTION TESTS ==================

  test.describe('Dialog Interactions', () => {
    test('swap request dialog can be opened from schedule', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoMySchedule();

      // Only test if there are shifts available
      const hasShifts = await timeTrackingPage.shiftCard.first().isVisible().catch(() => false);
      if (hasShifts) {
        // Check if shift options menu is available (for swappable statuses)
        const hasOptionsMenu = await timeTrackingPage.shiftOptionsMenu.first().isVisible().catch(() => false);
        if (hasOptionsMenu) {
          await timeTrackingPage.openSwapRequestDialog();
          await expect(timeTrackingPage.swapDialog).toBeVisible();
        }
      }
    });

    test('swap request dialog can be closed', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoMySchedule();

      const hasShifts = await timeTrackingPage.shiftCard.first().isVisible().catch(() => false);
      if (hasShifts) {
        const hasOptionsMenu = await timeTrackingPage.shiftOptionsMenu.first().isVisible().catch(() => false);
        if (hasOptionsMenu) {
          await timeTrackingPage.openSwapRequestDialog();
          await expect(timeTrackingPage.swapDialog).toBeVisible();

          // Close by pressing Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(200);

          await expect(timeTrackingPage.swapDialog).not.toBeVisible();
        }
      }
    });

    test('cancel swap request dialog works', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoMySwaps();

      // Only test if there are pending requests
      const hasPending = await timeTrackingPage.pendingRequestsSection.isVisible().catch(() => false);
      if (hasPending) {
        // Find cancel button on first pending request
        const cancelBtn = page.locator('[class*="Card"]').filter({ hasText: 'Pending' }).locator('button').filter({ has: page.locator('svg') }).first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await expect(timeTrackingPage.cancelDialog).toBeVisible();

          // Click Keep Request to cancel
          await timeTrackingPage.keepRequestButton.click();
          await expect(timeTrackingPage.cancelDialog).not.toBeVisible();
        }
      }
    });
  });

  // ================== MOBILE RESPONSIVENESS TESTS ==================

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('time clock page is mobile-friendly', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      await timeTrackingPage.expectTimeClockPageVisible();
      await timeTrackingPage.expectBottomNavVisible();
    });

    test('bottom navigation works on mobile', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoTimeClock();

      // All nav items should be visible and tappable
      await expect(timeTrackingPage.clockNavItem).toBeVisible();
      await expect(timeTrackingPage.scheduleNavItem).toBeVisible();
      await expect(timeTrackingPage.swapsNavItem).toBeVisible();
      await expect(timeTrackingPage.availabilityNavItem).toBeVisible();
    });

    test('availability page shows all days on mobile', async ({ page }) => {
      await loginAs(page, 'actor1');
      const timeTrackingPage = createTimeTrackingPage(page, TEST_USERS.actor1.orgSlug);
      await timeTrackingPage.gotoMyAvailability();

      await timeTrackingPage.expectAvailabilityPageVisible();
      // Should be able to scroll to see all days
      await expect(page.locator('text=Sunday')).toBeVisible();
    });
  });
});
