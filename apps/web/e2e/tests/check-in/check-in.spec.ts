import { expect, test } from '@playwright/test';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { createCheckInPage } from '../../pages/dashboard/check-in.page';

test.describe('Check-In', () => {
  // ================== MAIN CHECK-IN PAGE TESTS ==================

  test.describe('Main Check-In Page', () => {
    test.describe('Page Display', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('check-in page displays correctly', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.expectCheckInPageVisible();
      });

      test('attraction selector is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.expectAttractionSelectorVisible();
      });

      test('stats cards are displayed', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.expectStatsCardsVisible();
      });

      test('navigation cards are displayed', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.expectNavCardsVisible();
      });
    });

    test.describe('Navigation', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('can navigate to scan page via card', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.navigateToScanViaCard();
        await checkInPage.expectScanPageVisible();
      });

      test('can navigate to stations page via card', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.navigateToStationsViaCard();
        await checkInPage.expectStationsPageVisible();
      });

      test('can navigate to queue page via card', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.navigateToQueueViaCard();
        await checkInPage.expectQueuePageVisible();
      });

      test('can navigate to reports page via card', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoCheckIn();
        await checkInPage.navigateToReportsViaCard();
        await checkInPage.expectReportsPageVisible();
      });
    });
  });

  // ================== SCAN PAGE TESTS ==================

  test.describe('Scan Page', () => {
    test.describe('Page Display', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('scan page displays correctly', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await checkInPage.expectScanPageVisible();
      });

      test('barcode input is visible and focusable', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await expect(checkInPage.barcodeInput).toBeVisible();
        // Input should be auto-focused
        await expect(checkInPage.barcodeInput).toBeFocused();
      });

      test('check in button is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await expect(checkInPage.checkInButton).toBeVisible();
      });

      test('recent scans section is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await checkInPage.expectRecentScansVisible();
      });

      test('shows no scans message initially', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await checkInPage.expectNoScans();
      });

      test('scan result card shows ready state', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await expect(checkInPage.scanResultCard).toBeVisible();
        await expect(page.locator('text=Ready to scan')).toBeVisible();
      });
    });

    test.describe('Scanner Input', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('can type into barcode input', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await checkInPage.barcodeInput.fill('TEST-BARCODE-123');
        await expect(checkInPage.barcodeInput).toHaveValue('TEST-BARCODE-123');
      });

      test('check in button is disabled when input is empty', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await expect(checkInPage.checkInButton).toBeDisabled();
      });

      test('check in button is enabled when input has value', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await checkInPage.barcodeInput.fill('TEST-123');
        await expect(checkInPage.checkInButton).toBeEnabled();
      });
    });

    test.describe('Back Navigation', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('back button navigates to check-in page', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoScan();
        await checkInPage.backToCheckInButton.click();
        await page.waitForLoadState('networkidle');
        await checkInPage.expectCheckInPageVisible();
      });
    });
  });

  // ================== QUEUE PAGE TESTS ==================

  test.describe('Queue Page', () => {
    test.describe('Page Display', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('queue page displays correctly', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await checkInPage.expectQueuePageVisible();
      });

      test('queue stats cards are visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await checkInPage.expectQueueStatsVisible();
      });

      test('queue tabs are visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await checkInPage.expectQueueTabsVisible();
      });

      test('refresh button is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await expect(checkInPage.refreshButton).toBeVisible();
      });

      test('search input is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await expect(checkInPage.guestSearchInput).toBeVisible();
      });
    });

    test.describe('Tab Navigation', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('all tab is selected by default', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await expect(checkInPage.allTab).toHaveAttribute('data-state', 'active');
      });

      test('can switch to arriving soon tab', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await checkInPage.selectQueueTab('arriving');
        await expect(checkInPage.arrivingSoonTab).toHaveAttribute('data-state', 'active');
      });

      test('can switch to late tab', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await checkInPage.selectQueueTab('late');
        await expect(checkInPage.lateTab).toHaveAttribute('data-state', 'active');
      });
    });

    test.describe('Search and Filter', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('can search for guests', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await checkInPage.searchGuest('test');
        await expect(checkInPage.guestSearchInput).toHaveValue('test');
      });

      test('status filter is accessible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        const hasFilter = await checkInPage.statusFilter.isVisible().catch(() => false);
        expect(hasFilter).toBe(true);
      });
    });

    test.describe('Refresh', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('can refresh queue data', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoQueue();
        await checkInPage.refreshQueue();
        // Page should still be visible after refresh
        await checkInPage.expectQueuePageVisible();
      });
    });
  });

  // ================== REPORTS PAGE TESTS ==================

  test.describe('Reports Page', () => {
    test.describe('Page Display', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('reports page displays correctly', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoReports();
        await checkInPage.expectReportsPageVisible();
      });

      test('reports stats cards are visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoReports();
        await checkInPage.expectReportsStatsVisible();
      });

      test('reports charts are visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoReports();
        await checkInPage.expectReportsChartsVisible();
      });

      test('export button is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoReports();
        await expect(checkInPage.exportCsvButton).toBeVisible();
      });
    });

    test.describe('Date Range Filter', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('date range selector is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoReports();
        await expect(checkInPage.dateRangeSelector).toBeVisible();
      });
    });

    test.describe('Back Navigation', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('back button navigates to check-in page', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoReports();
        await checkInPage.reportsBackButton.click();
        await page.waitForLoadState('networkidle');
        await checkInPage.expectCheckInPageVisible();
      });
    });
  });

  // ================== STATIONS PAGE TESTS ==================

  test.describe('Stations Page', () => {
    test.describe('Page Display', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('stations page displays correctly', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await checkInPage.expectStationsPageVisible();
      });

      test('add station button is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await expect(checkInPage.addStationButton).toBeVisible();
      });

      test('attraction selector is visible', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await expect(checkInPage.stationsAttractionSelector).toBeVisible();
      });
    });

    test.describe('Create Station Dialog', () => {
      test.beforeEach(async ({ page }) => {
        await loginAs(page, 'owner');
      });

      test('can open create station dialog', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await checkInPage.openCreateStationDialog();
        await checkInPage.expectCreateStationDialogVisible();
      });

      test('create station dialog has required fields', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await checkInPage.openCreateStationDialog();
        await expect(checkInPage.stationNameInput).toBeVisible();
        await expect(checkInPage.stationLocationInput).toBeVisible();
        await expect(checkInPage.stationDeviceIdInput).toBeVisible();
      });

      test('create button is disabled when name is empty', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await checkInPage.openCreateStationDialog();
        await expect(checkInPage.createStationSubmitButton).toBeDisabled();
      });

      test('create button is enabled when name is filled', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await checkInPage.openCreateStationDialog();
        await checkInPage.stationNameInput.fill('Test Station');
        await expect(checkInPage.createStationSubmitButton).toBeEnabled();
      });

      test('can close create station dialog', async ({ page }) => {
        const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
        await checkInPage.gotoStations();
        await checkInPage.openCreateStationDialog();
        await checkInPage.createStationCancelButton.click();
        await expect(checkInPage.createStationDialog).not.toBeVisible();
      });
    });
  });

  // ================== URL ROUTING TESTS ==================

  test.describe('URL Routing', () => {
    test('direct navigation to check-in works', async ({ page }) => {
      await loginAs(page, 'owner');
      await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in`);
      await page.waitForLoadState('networkidle');

      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.expectCheckInPageVisible();
    });

    test('direct navigation to scan works', async ({ page }) => {
      await loginAs(page, 'owner');
      await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in/scan`);
      await page.waitForLoadState('networkidle');

      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.expectScanPageVisible();
    });

    test('direct navigation to queue works', async ({ page }) => {
      await loginAs(page, 'owner');
      await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in/queue`);
      await page.waitForLoadState('networkidle');

      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.expectQueuePageVisible();
    });

    test('direct navigation to reports works', async ({ page }) => {
      await loginAs(page, 'owner');
      await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in/reports`);
      await page.waitForLoadState('networkidle');

      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.expectReportsPageVisible();
    });

    test('direct navigation to stations works', async ({ page }) => {
      await loginAs(page, 'owner');
      await page.goto(`/${TEST_USERS.owner.orgSlug}/check-in/stations`);
      await page.waitForLoadState('networkidle');

      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.expectStationsPageVisible();
    });
  });

  // ================== ACCESS CONTROL TESTS ==================

  test.describe('Access Control', () => {
    test('owner can access check-in', async ({ page }) => {
      await loginAs(page, 'owner');
      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.gotoCheckIn();
      await checkInPage.expectCheckInPageVisible();
    });

    test('manager can access check-in', async ({ page }) => {
      await loginAs(page, 'manager');
      const checkInPage = createCheckInPage(page, TEST_USERS.manager.orgSlug);
      await checkInPage.gotoCheckIn();
      await checkInPage.expectCheckInPageVisible();
    });

    test('box office can access check-in', async ({ page }) => {
      await loginAs(page, 'boxOffice');
      const checkInPage = createCheckInPage(page, TEST_USERS.boxOffice.orgSlug);
      await checkInPage.gotoCheckIn();
      await checkInPage.expectCheckInPageVisible();
    });

    test('scanner role can access check-in scan', async ({ page }) => {
      await loginAs(page, 'scanner');
      const checkInPage = createCheckInPage(page, TEST_USERS.scanner.orgSlug);
      await checkInPage.gotoScan();
      // Scanner should be able to access scan page
      await expect(page.locator('text=Scan').first()).toBeVisible();
    });
  });

  // ================== FEATURE FLAGS TESTS ==================

  test.describe('Feature Flags', () => {
    test('check-in is available for pro tier org', async ({ page }) => {
      await loginAs(page, 'owner');
      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.gotoCheckIn();
      await checkInPage.expectCheckInPageVisible();
    });

    test('check-in is available for free tier org', async ({ page }) => {
      await loginAs(page, 'freeOwner');
      const checkInPage = createCheckInPage(page, TEST_USERS.freeOwner.orgSlug);
      await checkInPage.gotoCheckIn();
      // Check-in is a basic feature available on all tiers
      await checkInPage.expectCheckInPageVisible();
    });

    test('check-in is available for enterprise tier org', async ({ page }) => {
      await loginAs(page, 'enterpriseOwner');
      const checkInPage = createCheckInPage(page, TEST_USERS.enterpriseOwner.orgSlug);
      await checkInPage.gotoCheckIn();
      await checkInPage.expectCheckInPageVisible();
    });
  });

  // ================== CROSS-ORG ISOLATION TESTS ==================

  test.describe('Cross-Org Isolation', () => {
    test('cannot access check-in for org user is not a member of', async ({ page }) => {
      await loginAs(page, 'owner');
      // Try to access a different org's check-in
      await page.goto('/spooky-hollow/check-in');
      await page.waitForLoadState('networkidle');

      // Should show error or redirect
      const hasError = await page.locator('text=Access Denied').or(page.locator('text=not found')).or(page.locator('text=Unauthorized')).isVisible().catch(() => false);
      const redirectedAway = !page.url().includes('spooky-hollow/check-in');

      expect(hasError || redirectedAway).toBe(true);
    });

    test('free tier user cannot access pro org check-in', async ({ page }) => {
      await loginAs(page, 'freeOwner');
      // Try to access pro org's check-in
      await page.goto('/nightmare-manor/check-in');
      await page.waitForLoadState('networkidle');

      // Should show error or redirect
      const hasError = await page.locator('text=Access Denied').or(page.locator('text=not found')).or(page.locator('text=Unauthorized')).isVisible().catch(() => false);
      const redirectedAway = !page.url().includes('nightmare-manor/check-in');

      expect(hasError || redirectedAway).toBe(true);
    });
  });

  // ================== MOBILE RESPONSIVENESS TESTS ==================

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('check-in page is mobile-friendly', async ({ page }) => {
      await loginAs(page, 'owner');
      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.gotoCheckIn();
      await checkInPage.expectCheckInPageVisible();
    });

    test('scan page is mobile-friendly', async ({ page }) => {
      await loginAs(page, 'owner');
      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.gotoScan();
      await checkInPage.expectScanPageVisible();
      // Barcode input should be usable on mobile
      await expect(checkInPage.barcodeInput).toBeVisible();
    });

    test('queue page is mobile-friendly', async ({ page }) => {
      await loginAs(page, 'owner');
      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.gotoQueue();
      await checkInPage.expectQueuePageVisible();
    });

    test('reports page is mobile-friendly', async ({ page }) => {
      await loginAs(page, 'owner');
      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.gotoReports();
      await checkInPage.expectReportsPageVisible();
    });

    test('stations page is mobile-friendly', async ({ page }) => {
      await loginAs(page, 'owner');
      const checkInPage = createCheckInPage(page, TEST_USERS.owner.orgSlug);
      await checkInPage.gotoStations();
      await checkInPage.expectStationsPageVisible();
    });
  });
});
