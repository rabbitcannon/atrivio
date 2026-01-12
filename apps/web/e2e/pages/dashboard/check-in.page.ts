import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object for Check-In feature
 *
 * Covers:
 * - Main check-in dashboard (/:orgId/check-in)
 * - Scan page (/:orgId/check-in/scan)
 * - Queue page (/:orgId/check-in/queue)
 * - Reports page (/:orgId/check-in/reports)
 * - Stations page (/:orgId/check-in/stations)
 */
export class CheckInPage {
  readonly page: Page;
  readonly orgSlug: string;

  // ==================== MAIN CHECK-IN PAGE ====================

  // Page header
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;
  readonly attractionSelector: Locator;

  // Stats cards
  readonly checkedInTodayCard: Locator;
  readonly currentCapacityCard: Locator;
  readonly pendingArrivalsCard: Locator;
  readonly lateArrivalsCard: Locator;

  // Navigation cards
  readonly scanTicketsCard: Locator;
  readonly stationsCard: Locator;
  readonly queueCard: Locator;
  readonly reportsCard: Locator;

  // Empty state
  readonly noAttractionsEmptyState: Locator;

  // ==================== SCAN PAGE ====================

  // Header
  readonly scanPageHeading: Locator;
  readonly backToCheckInButton: Locator;

  // Selectors
  readonly scanAttractionSelector: Locator;
  readonly scanStationSelector: Locator;

  // Scanner input
  readonly barcodeInput: Locator;
  readonly checkInButton: Locator;

  // Result display
  readonly scanResultCard: Locator;
  readonly successResult: Locator;
  readonly errorResult: Locator;
  readonly waiverRequiredResult: Locator;
  readonly signWaiverButton: Locator;

  // Recent scans
  readonly recentScansCard: Locator;
  readonly recentScansList: Locator;
  readonly noScansMessage: Locator;

  // ==================== QUEUE PAGE ====================

  // Header
  readonly queuePageHeading: Locator;
  readonly queueAttractionSelector: Locator;
  readonly refreshButton: Locator;

  // Stats
  readonly arrivingSoonCard: Locator;
  readonly pendingTodayCard: Locator;
  readonly lateArrivalsStatsCard: Locator;

  // Tabs
  readonly queueTabs: Locator;
  readonly allTab: Locator;
  readonly arrivingSoonTab: Locator;
  readonly lateTab: Locator;

  // Search and filter
  readonly guestSearchInput: Locator;
  readonly statusFilter: Locator;

  // Queue table
  readonly queueTable: Locator;
  readonly queueTableRows: Locator;
  readonly manualCheckInButton: Locator;
  readonly noGuestsMessage: Locator;

  // ==================== REPORTS PAGE ====================

  // Header
  readonly reportsPageHeading: Locator;
  readonly reportsBackButton: Locator;

  // Filters
  readonly reportsAttractionSelector: Locator;
  readonly dateRangeSelector: Locator;
  readonly exportCsvButton: Locator;

  // Stats
  readonly totalCheckedInCard: Locator;
  readonly checkInRateCard: Locator;
  readonly avgCheckInTimeCard: Locator;
  readonly peakHourCard: Locator;

  // Charts
  readonly checkInsByStationCard: Locator;
  readonly checkInsByMethodCard: Locator;
  readonly hourlyDistributionCard: Locator;

  // Summary stats
  readonly successfulCheckInsCard: Locator;
  readonly expectedRemainingCard: Locator;
  readonly totalScansTodayCard: Locator;

  // ==================== STATIONS PAGE ====================

  // Header
  readonly stationsPageHeading: Locator;
  readonly stationsAttractionSelector: Locator;
  readonly addStationButton: Locator;

  // Stations table
  readonly stationsTable: Locator;
  readonly stationsTableRows: Locator;
  readonly noStationsMessage: Locator;

  // Station actions
  readonly stationActiveSwitch: Locator;
  readonly editStationButton: Locator;
  readonly deleteStationButton: Locator;

  // Create station dialog
  readonly createStationDialog: Locator;
  readonly stationNameInput: Locator;
  readonly stationLocationInput: Locator;
  readonly stationDeviceIdInput: Locator;
  readonly createStationSubmitButton: Locator;
  readonly createStationCancelButton: Locator;

  // Edit station dialog
  readonly editStationDialog: Locator;
  readonly editStationNameInput: Locator;
  readonly editStationLocationInput: Locator;
  readonly editStationDeviceIdInput: Locator;
  readonly saveStationButton: Locator;

  // Delete station dialog
  readonly deleteStationDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  constructor(page: Page, orgSlug: string) {
    this.page = page;
    this.orgSlug = orgSlug;

    // ==================== MAIN CHECK-IN PAGE ====================

    this.pageHeading = page.getByRole('heading', { name: 'Check-In' });
    this.pageDescription = page.locator('text=Manage guest check-ins, stations, and monitor capacity');
    this.attractionSelector = page.locator('[class*="SelectTrigger"]').first();

    // Stats cards
    this.checkedInTodayCard = page.locator('[class*="Card"]').filter({ hasText: 'Checked In Today' });
    this.currentCapacityCard = page.locator('[class*="Card"]').filter({ hasText: 'Current Capacity' });
    this.pendingArrivalsCard = page.locator('[class*="Card"]').filter({ hasText: 'Pending Arrivals' });
    this.lateArrivalsCard = page.locator('[class*="Card"]').filter({ hasText: 'Late Arrivals' });

    // Navigation cards
    this.scanTicketsCard = page.locator('[class*="Card"]').filter({ hasText: 'Scan Tickets' });
    this.stationsCard = page.locator('[class*="Card"]').filter({ hasText: 'Stations' });
    this.queueCard = page.locator('[class*="Card"]').filter({ hasText: 'Queue' });
    this.reportsCard = page.locator('[class*="Card"]').filter({ hasText: 'Reports' });

    // Empty state
    this.noAttractionsEmptyState = page.locator('text=No Attractions Found');

    // ==================== SCAN PAGE ====================

    this.scanPageHeading = page.getByRole('heading', { name: 'Scan Tickets' });
    this.backToCheckInButton = page.getByRole('button', { name: /back to check-in/i });

    this.scanAttractionSelector = page.locator('label:has-text("Attraction") + div [class*="SelectTrigger"]').first();
    this.scanStationSelector = page.locator('label:has-text("Station") + div [class*="SelectTrigger"]').first();

    this.barcodeInput = page.locator('#barcode');
    this.checkInButton = page.getByRole('button', { name: /check in/i });

    this.scanResultCard = page.locator('[class*="Card"]').filter({ hasText: 'Scan Result' });
    this.successResult = page.locator('text=Check-In Successful');
    this.errorResult = page.locator('text=Check-In Failed');
    this.waiverRequiredResult = page.locator('text=Waiver Required');
    this.signWaiverButton = page.getByRole('button', { name: /sign waiver/i });

    this.recentScansCard = page.locator('[class*="Card"]').filter({ hasText: 'Recent Scans' });
    this.recentScansList = page.locator('[class*="Card"]').filter({ hasText: 'Recent Scans' }).locator('[class*="rounded-lg border"]');
    this.noScansMessage = page.locator('text=No scans yet this session');

    // ==================== QUEUE PAGE ====================

    this.queuePageHeading = page.getByRole('heading', { name: 'Guest Queue' });
    this.queueAttractionSelector = page.locator('[class*="SelectTrigger"]').first();
    this.refreshButton = page.getByRole('button', { name: /refresh/i });

    this.arrivingSoonCard = page.locator('[class*="Card"]').filter({ hasText: 'Arriving Soon' });
    this.pendingTodayCard = page.locator('[class*="Card"]').filter({ hasText: 'Pending Today' });
    this.lateArrivalsStatsCard = page.locator('[class*="Card"]').filter({ hasText: 'Late Arrivals' });

    this.queueTabs = page.locator('[role="tablist"]');
    this.allTab = page.getByRole('tab', { name: /^All/ });
    this.arrivingSoonTab = page.getByRole('tab', { name: /Arriving Soon/ });
    this.lateTab = page.getByRole('tab', { name: /^Late/ });

    this.guestSearchInput = page.getByPlaceholder('Search guests...');
    this.statusFilter = page.locator('[class*="SelectTrigger"]').filter({ hasText: /filter|all status/i });

    this.queueTable = page.locator('[class*="Card"]').filter({ hasText: 'Guest Queue' }).locator('table');
    this.queueTableRows = this.queueTable.locator('tbody tr');
    this.manualCheckInButton = page.getByRole('button', { name: /check in/i });
    this.noGuestsMessage = page.locator('text=No guests in queue');

    // ==================== REPORTS PAGE ====================

    this.reportsPageHeading = page.getByRole('heading', { name: 'Check-In Reports' });
    this.reportsBackButton = page.getByRole('button', { name: /back to check-in/i });

    this.reportsAttractionSelector = page.locator('label:has-text("Attraction") + [class*="Select"]').first();
    this.dateRangeSelector = page.locator('label:has-text("Date Range") + [class*="Select"]').first();
    this.exportCsvButton = page.getByRole('button', { name: /export csv/i });

    this.totalCheckedInCard = page.locator('[class*="Card"]').filter({ hasText: 'Total Checked In' });
    this.checkInRateCard = page.locator('[class*="Card"]').filter({ hasText: 'Check-In Rate' });
    this.avgCheckInTimeCard = page.locator('[class*="Card"]').filter({ hasText: 'Avg Check-In Time' });
    this.peakHourCard = page.locator('[class*="Card"]').filter({ hasText: 'Peak Hour' });

    this.checkInsByStationCard = page.locator('[class*="Card"]').filter({ hasText: 'Check-Ins by Station' });
    this.checkInsByMethodCard = page.locator('[class*="Card"]').filter({ hasText: 'Check-Ins by Method' });
    this.hourlyDistributionCard = page.locator('[class*="Card"]').filter({ hasText: 'Hourly Check-In Distribution' });

    this.successfulCheckInsCard = page.locator('[class*="Card"]').filter({ hasText: 'Successful Check-Ins' });
    this.expectedRemainingCard = page.locator('[class*="Card"]').filter({ hasText: 'Expected Remaining' });
    this.totalScansTodayCard = page.locator('[class*="Card"]').filter({ hasText: 'Total Scans Today' });

    // ==================== STATIONS PAGE ====================

    this.stationsPageHeading = page.getByRole('heading', { name: 'Check-In Stations' });
    this.stationsAttractionSelector = page.locator('[class*="SelectTrigger"]').first();
    this.addStationButton = page.getByRole('button', { name: /add station/i });

    this.stationsTable = page.locator('[class*="Card"]').filter({ hasText: 'Active Stations' }).locator('table');
    this.stationsTableRows = this.stationsTable.locator('tbody tr');
    this.noStationsMessage = page.locator('text=No stations configured');

    this.stationActiveSwitch = page.locator('[role="switch"]');
    this.editStationButton = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') });
    this.deleteStationButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });

    // Create station dialog
    this.createStationDialog = page.getByRole('dialog').filter({ hasText: 'Create Check-In Station' });
    this.stationNameInput = page.locator('#name');
    this.stationLocationInput = page.locator('#location');
    this.stationDeviceIdInput = page.locator('#deviceId');
    this.createStationSubmitButton = page.getByRole('button', { name: /^create station$/i });
    this.createStationCancelButton = this.createStationDialog.getByRole('button', { name: /cancel/i });

    // Edit station dialog
    this.editStationDialog = page.getByRole('dialog').filter({ hasText: 'Edit Station' });
    this.editStationNameInput = page.locator('#edit-name');
    this.editStationLocationInput = page.locator('#edit-location');
    this.editStationDeviceIdInput = page.locator('#edit-deviceId');
    this.saveStationButton = page.getByRole('button', { name: /save changes/i });

    // Delete station dialog
    this.deleteStationDialog = page.getByRole('alertdialog').filter({ hasText: 'Delete Station' });
    this.confirmDeleteButton = this.deleteStationDialog.getByRole('button', { name: /delete/i });
    this.cancelDeleteButton = this.deleteStationDialog.getByRole('button', { name: /cancel/i });
  }

  // ==================== NAVIGATION ====================

  async gotoCheckIn(): Promise<void> {
    await this.page.goto(`/${this.orgSlug}/check-in`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoScan(attractionId?: string): Promise<void> {
    const url = attractionId
      ? `/${this.orgSlug}/check-in/scan?attractionId=${attractionId}`
      : `/${this.orgSlug}/check-in/scan`;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoQueue(attractionId?: string): Promise<void> {
    const url = attractionId
      ? `/${this.orgSlug}/check-in/queue?attractionId=${attractionId}`
      : `/${this.orgSlug}/check-in/queue`;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoReports(attractionId?: string): Promise<void> {
    const url = attractionId
      ? `/${this.orgSlug}/check-in/reports?attractionId=${attractionId}`
      : `/${this.orgSlug}/check-in/reports`;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoStations(attractionId?: string): Promise<void> {
    const url = attractionId
      ? `/${this.orgSlug}/check-in/stations?attractionId=${attractionId}`
      : `/${this.orgSlug}/check-in/stations`;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  // Navigate via nav cards on main page
  async navigateToScanViaCard(): Promise<void> {
    await this.scanTicketsCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToStationsViaCard(): Promise<void> {
    await this.stationsCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToQueueViaCard(): Promise<void> {
    await this.queueCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToReportsViaCard(): Promise<void> {
    await this.reportsCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== SCAN PAGE ACTIONS ====================

  async selectAttraction(attractionName: string): Promise<void> {
    await this.scanAttractionSelector.click();
    await this.page.getByRole('option', { name: attractionName }).click();
  }

  async selectStation(stationName: string): Promise<void> {
    await this.scanStationSelector.click();
    await this.page.getByRole('option', { name: stationName }).click();
  }

  async scanBarcode(barcode: string): Promise<void> {
    await this.barcodeInput.fill(barcode);
    await this.checkInButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async submitScan(): Promise<void> {
    await this.checkInButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== QUEUE PAGE ACTIONS ====================

  async refreshQueue(): Promise<void> {
    await this.refreshButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchGuest(query: string): Promise<void> {
    await this.guestSearchInput.fill(query);
    await this.page.waitForTimeout(300); // debounce
  }

  async filterByStatus(status: 'all' | 'arriving_soon' | 'pending' | 'late'): Promise<void> {
    await this.statusFilter.click();
    const optionMap = {
      all: 'All Status',
      arriving_soon: 'Arriving Soon',
      pending: 'Pending',
      late: 'Late',
    };
    await this.page.getByRole('option', { name: optionMap[status] }).click();
  }

  async selectQueueTab(tab: 'all' | 'arriving' | 'late'): Promise<void> {
    switch (tab) {
      case 'all':
        await this.allTab.click();
        break;
      case 'arriving':
        await this.arrivingSoonTab.click();
        break;
      case 'late':
        await this.lateTab.click();
        break;
    }
    await this.page.waitForTimeout(200);
  }

  async checkInGuestFromQueue(guestIndex: number = 0): Promise<void> {
    const checkInBtn = this.queueTableRows.nth(guestIndex).getByRole('button', { name: /check in/i });
    await checkInBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== REPORTS PAGE ACTIONS ====================

  async selectDateRange(range: 'today' | 'yesterday'): Promise<void> {
    await this.dateRangeSelector.click();
    const optionMap = {
      today: 'Today',
      yesterday: 'Yesterday',
    };
    await this.page.getByRole('option', { name: optionMap[range] }).click();
  }

  async exportReport(): Promise<void> {
    await this.exportCsvButton.click();
    await this.page.waitForTimeout(500);
  }

  // ==================== STATIONS PAGE ACTIONS ====================

  async openCreateStationDialog(): Promise<void> {
    await this.addStationButton.click();
    await expect(this.createStationDialog).toBeVisible();
  }

  async createStation(name: string, location?: string, deviceId?: string): Promise<void> {
    await this.openCreateStationDialog();
    await this.stationNameInput.fill(name);
    if (location) {
      await this.stationLocationInput.fill(location);
    }
    if (deviceId) {
      await this.stationDeviceIdInput.fill(deviceId);
    }
    await this.createStationSubmitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async editStation(stationIndex: number, newName?: string, newLocation?: string, newDeviceId?: string): Promise<void> {
    const editBtn = this.stationsTableRows.nth(stationIndex).locator('button').filter({ has: this.page.locator('svg.lucide-pencil') });
    await editBtn.click();
    await expect(this.editStationDialog).toBeVisible();

    if (newName) {
      await this.editStationNameInput.clear();
      await this.editStationNameInput.fill(newName);
    }
    if (newLocation !== undefined) {
      await this.editStationLocationInput.clear();
      if (newLocation) await this.editStationLocationInput.fill(newLocation);
    }
    if (newDeviceId !== undefined) {
      await this.editStationDeviceIdInput.clear();
      if (newDeviceId) await this.editStationDeviceIdInput.fill(newDeviceId);
    }

    await this.saveStationButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async deleteStation(stationIndex: number): Promise<void> {
    const deleteBtn = this.stationsTableRows.nth(stationIndex).locator('button').filter({ has: this.page.locator('svg.lucide-trash-2') });
    await deleteBtn.click();
    await expect(this.deleteStationDialog).toBeVisible();
    await this.confirmDeleteButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async toggleStationActive(stationIndex: number): Promise<void> {
    const switchEl = this.stationsTableRows.nth(stationIndex).locator('[role="switch"]');
    await switchEl.click();
    await this.page.waitForTimeout(500);
  }

  // ==================== ASSERTIONS ====================

  // Main page assertions
  async expectCheckInPageVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.pageDescription).toBeVisible();
  }

  async expectStatsCardsVisible(): Promise<void> {
    await expect(this.checkedInTodayCard).toBeVisible();
    await expect(this.currentCapacityCard).toBeVisible();
    await expect(this.pendingArrivalsCard).toBeVisible();
    await expect(this.lateArrivalsCard).toBeVisible();
  }

  async expectNavCardsVisible(): Promise<void> {
    await expect(this.scanTicketsCard).toBeVisible();
    await expect(this.stationsCard).toBeVisible();
    await expect(this.queueCard).toBeVisible();
    await expect(this.reportsCard).toBeVisible();
  }

  async expectNoAttractionsState(): Promise<void> {
    await expect(this.noAttractionsEmptyState).toBeVisible();
  }

  // Scan page assertions
  async expectScanPageVisible(): Promise<void> {
    await expect(this.scanPageHeading).toBeVisible();
    await expect(this.barcodeInput).toBeVisible();
    await expect(this.checkInButton).toBeVisible();
  }

  async expectScanSuccess(): Promise<void> {
    await expect(this.successResult).toBeVisible();
  }

  async expectScanError(): Promise<void> {
    await expect(this.errorResult).toBeVisible();
  }

  async expectWaiverRequired(): Promise<void> {
    await expect(this.waiverRequiredResult).toBeVisible();
  }

  async expectRecentScansVisible(): Promise<void> {
    await expect(this.recentScansCard).toBeVisible();
  }

  async expectNoScans(): Promise<void> {
    await expect(this.noScansMessage).toBeVisible();
  }

  // Queue page assertions
  async expectQueuePageVisible(): Promise<void> {
    await expect(this.queuePageHeading).toBeVisible();
    await expect(this.refreshButton).toBeVisible();
  }

  async expectQueueStatsVisible(): Promise<void> {
    await expect(this.arrivingSoonCard).toBeVisible();
    await expect(this.pendingTodayCard).toBeVisible();
    await expect(this.lateArrivalsStatsCard).toBeVisible();
  }

  async expectQueueTabsVisible(): Promise<void> {
    await expect(this.queueTabs).toBeVisible();
    await expect(this.allTab).toBeVisible();
    await expect(this.arrivingSoonTab).toBeVisible();
    await expect(this.lateTab).toBeVisible();
  }

  async expectNoGuestsInQueue(): Promise<void> {
    await expect(this.noGuestsMessage).toBeVisible();
  }

  // Reports page assertions
  async expectReportsPageVisible(): Promise<void> {
    await expect(this.reportsPageHeading).toBeVisible();
    await expect(this.exportCsvButton).toBeVisible();
  }

  async expectReportsStatsVisible(): Promise<void> {
    await expect(this.totalCheckedInCard).toBeVisible();
    await expect(this.checkInRateCard).toBeVisible();
    await expect(this.avgCheckInTimeCard).toBeVisible();
    await expect(this.peakHourCard).toBeVisible();
  }

  async expectReportsChartsVisible(): Promise<void> {
    await expect(this.checkInsByStationCard).toBeVisible();
    await expect(this.checkInsByMethodCard).toBeVisible();
    await expect(this.hourlyDistributionCard).toBeVisible();
  }

  // Stations page assertions
  async expectStationsPageVisible(): Promise<void> {
    await expect(this.stationsPageHeading).toBeVisible();
    await expect(this.addStationButton).toBeVisible();
  }

  async expectStationsTableVisible(): Promise<void> {
    await expect(this.stationsTable).toBeVisible();
  }

  async expectNoStations(): Promise<void> {
    await expect(this.noStationsMessage).toBeVisible();
  }

  async expectCreateStationDialogVisible(): Promise<void> {
    await expect(this.createStationDialog).toBeVisible();
  }

  async expectEditStationDialogVisible(): Promise<void> {
    await expect(this.editStationDialog).toBeVisible();
  }

  async expectDeleteStationDialogVisible(): Promise<void> {
    await expect(this.deleteStationDialog).toBeVisible();
  }

  // Generic assertions
  async expectAttractionSelectorVisible(): Promise<void> {
    await expect(this.attractionSelector).toBeVisible();
  }

  async expectLoadingState(): Promise<void> {
    await expect(this.page.locator('.animate-spin').first()).toBeVisible();
  }
}

/**
 * Factory function to create a CheckInPage instance
 */
export function createCheckInPage(page: Page, orgSlug: string): CheckInPage {
  return new CheckInPage(page, orgSlug);
}
