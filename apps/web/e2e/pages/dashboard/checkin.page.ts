import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../helpers/fixtures';

/**
 * Check-In Dashboard Page Object
 *
 * Encapsulates interactions with check-in management pages including:
 * - Main check-in overview with stats
 * - Ticket scanning (barcode/QR)
 * - Station management (CRUD)
 * - Queue management (pending/late arrivals)
 */
export class CheckInPage extends BasePage {
  private readonly orgSlug: string;

  constructor(page: Page, orgSlug: string) {
    super(page);
    this.orgSlug = orgSlug;
  }

  // ============================================================================
  // Locators - Main Check-In Page
  // ============================================================================

  /** Main check-in page heading */
  get checkInHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Check-In', level: 1 }).first();
  }

  /** Attraction selector dropdown on main page */
  get attractionSelector(): Locator {
    return this.page.locator('button[role="combobox"]').first();
  }

  /** Stats card: Checked In Today */
  get checkedInTodayCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Checked In Today' }).first();
  }

  /** Stats card: Current Capacity */
  get currentCapacityCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Current Capacity' }).first();
  }

  /** Stats card: Pending Arrivals */
  get pendingArrivalsCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Pending Arrivals' }).first();
  }

  /** Stats card: Late Arrivals */
  get lateArrivalsCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Late Arrivals' }).first();
  }

  /** Navigation card to Scan Tickets */
  get scanTicketsCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Scan Tickets' }).first();
  }

  /** Navigation card to Stations */
  get stationsCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Stations' }).first();
  }

  /** Navigation card to Queue */
  get queueCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Queue' }).first();
  }

  /** Navigation card to Reports */
  get reportsCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Reports' }).first();
  }

  // ============================================================================
  // Locators - Scan Tickets Page
  // ============================================================================

  /** Scan page heading */
  get scanHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Scan Tickets', level: 1 }).first();
  }

  /** Attraction selector on scan page */
  get scanAttractionSelector(): Locator {
    return this.page.locator('button[role="combobox"]').first();
  }

  /** Station selector on scan page (optional) */
  get scanStationSelector(): Locator {
    return this.page.locator('button[role="combobox"]').nth(1);
  }

  /** Barcode input field */
  get barcodeInput(): Locator {
    return this.page.getByPlaceholder(/scan or type barcode/i).first();
  }

  /** Check In button */
  get checkInButton(): Locator {
    return this.page.getByRole('button', { name: /check in/i }).first();
  }

  /** Scan result card (shows success/error/warning) */
  get scanResultCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ has: this.page.locator('[class*="CheckCircle"], [class*="XCircle"], [class*="AlertTriangle"]') }).first();
  }

  /** Scan success indicator */
  get scanSuccessResult(): Locator {
    return this.page.locator('text=/valid|success|checked in/i').first();
  }

  /** Scan error indicator */
  get scanErrorResult(): Locator {
    return this.page.locator('text=/invalid|not found|error/i').first();
  }

  /** Scan warning indicator (waiver required) */
  get scanWarningResult(): Locator {
    return this.page.locator('text=/waiver|warning/i').first();
  }

  /** Recent scans section heading */
  get recentScansHeading(): Locator {
    return this.page.getByRole('heading', { name: /recent scans/i }).first();
  }

  /** Recent scans list */
  get recentScansList(): Locator {
    return this.page.locator('[class*="space-y"]').filter({ has: this.recentScansHeading }).first();
  }

  // ============================================================================
  // Locators - Stations Page
  // ============================================================================

  /** Stations page heading */
  get stationsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Check-In Stations', level: 1 }).first();
  }

  /** Add Station button */
  get addStationButton(): Locator {
    return this.page.getByRole('button', { name: /add station/i }).first();
  }

  /** Stations table */
  get stationsTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Station rows in table */
  get stationRows(): Locator {
    return this.stationsTable.locator('tbody tr');
  }

  /** Empty state for stations */
  get stationsEmptyState(): Locator {
    return this.page.getByText(/no stations configured/i).first();
  }

  /** Create your first station button (empty state) */
  get createFirstStationButton(): Locator {
    return this.page.getByRole('button', { name: /create your first station/i }).first();
  }

  // ============================================================================
  // Locators - Station Dialog
  // ============================================================================

  /** Station dialog */
  get stationDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  /** Station name input */
  get stationNameInput(): Locator {
    return this.page.locator('#name, [name="name"]').first();
  }

  /** Station location input */
  get stationLocationInput(): Locator {
    return this.page.locator('#location, [name="location"]').first();
  }

  /** Station device ID input */
  get stationDeviceIdInput(): Locator {
    return this.page.locator('#deviceId, [name="deviceId"]').first();
  }

  /** Station active toggle */
  get stationActiveToggle(): Locator {
    return this.stationDialog.locator('button[role="switch"]').first();
  }

  /** Create/Save station button in dialog */
  get stationSaveButton(): Locator {
    return this.stationDialog.getByRole('button', { name: /create|save/i }).first();
  }

  /** Cancel button in station dialog */
  get stationCancelButton(): Locator {
    return this.stationDialog.getByRole('button', { name: /cancel/i }).first();
  }

  // ============================================================================
  // Locators - Delete Confirmation Dialog
  // ============================================================================

  /** Delete confirmation dialog */
  get deleteConfirmDialog(): Locator {
    return this.page.locator('[role="alertdialog"], [role="dialog"]').filter({ hasText: /delete|confirm/i }).first();
  }

  /** Confirm delete button */
  get confirmDeleteButton(): Locator {
    return this.deleteConfirmDialog.getByRole('button', { name: /delete|confirm|yes/i }).first();
  }

  /** Cancel delete button */
  get cancelDeleteButton(): Locator {
    return this.deleteConfirmDialog.getByRole('button', { name: /cancel|no/i }).first();
  }

  // ============================================================================
  // Locators - Queue Page
  // ============================================================================

  /** Queue page heading */
  get queueHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Guest Queue', level: 1 }).first();
  }

  /** Refresh button on queue page */
  get queueRefreshButton(): Locator {
    return this.page.getByRole('button', { name: /refresh/i }).first();
  }

  /** Stats card: Arriving Soon */
  get arrivingSoonCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Arriving Soon' }).first();
  }

  /** Stats card: Pending Today */
  get pendingTodayCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Pending Today' }).first();
  }

  /** Stats card: Late Arrivals (queue page) */
  get queueLateArrivalsCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Late Arrivals' }).first();
  }

  /** Tab: All guests */
  get allGuestsTab(): Locator {
    return this.page.getByRole('tab', { name: /all/i }).first();
  }

  /** Tab: Arriving Soon */
  get arrivingSoonTab(): Locator {
    return this.page.getByRole('tab', { name: /arriving soon/i }).first();
  }

  /** Tab: Late */
  get lateTab(): Locator {
    return this.page.getByRole('tab', { name: /late/i }).first();
  }

  /** Search input for guest name/ticket ID */
  get queueSearchInput(): Locator {
    return this.page.getByPlaceholder(/search by guest name/i).first();
  }

  /** Status filter dropdown */
  get queueStatusFilter(): Locator {
    return this.page.locator('button[role="combobox"]').filter({ hasText: /status|all/i }).first();
  }

  /** Guest queue table */
  get queueTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Guest rows in queue table */
  get queueRows(): Locator {
    return this.queueTable.locator('tbody tr');
  }

  /** Empty state for queue */
  get queueEmptyState(): Locator {
    return this.page.getByText(/no guests|no tickets|empty/i).first();
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /** Navigate to the main check-in page */
  override async goto(): Promise<void> {
    await super.goto(`/${this.orgSlug}/check-in`);
  }

  /** Navigate to scan tickets page */
  async gotoScan(): Promise<void> {
    await super.goto(`/${this.orgSlug}/check-in/scan`);
  }

  /** Navigate to stations page */
  async gotoStations(): Promise<void> {
    await super.goto(`/${this.orgSlug}/check-in/stations`);
  }

  /** Navigate to queue page */
  async gotoQueue(): Promise<void> {
    await super.goto(`/${this.orgSlug}/check-in/queue`);
  }

  /** Navigate to reports page */
  async gotoReports(): Promise<void> {
    await super.goto(`/${this.orgSlug}/check-in/reports`);
  }

  // ============================================================================
  // Actions - Main Page
  // ============================================================================

  /** Select an attraction from the dropdown */
  async selectAttraction(attractionName: string): Promise<void> {
    await this.attractionSelector.click();
    await this.page.waitForTimeout(200);
    await this.page.getByRole('option', { name: new RegExp(attractionName, 'i') }).click();
    await this.waitForPageLoad();
  }

  /** Navigate to scan page via card click */
  async clickScanTicketsCard(): Promise<void> {
    await this.scanTicketsCard.click();
    await this.waitForPageLoad();
  }

  /** Navigate to stations page via card click */
  async clickStationsCard(): Promise<void> {
    await this.stationsCard.click();
    await this.waitForPageLoad();
  }

  /** Navigate to queue page via card click */
  async clickQueueCard(): Promise<void> {
    await this.queueCard.click();
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Actions - Scan Tickets
  // ============================================================================

  /** Scan a barcode/ticket */
  async scanBarcode(barcode: string): Promise<void> {
    await this.barcodeInput.fill(barcode);
    await this.checkInButton.click();
    // Wait for result to appear
    await this.page.waitForTimeout(500);
  }

  /** Scan a barcode by pressing Enter */
  async scanBarcodeWithEnter(barcode: string): Promise<void> {
    await this.barcodeInput.fill(barcode);
    await this.barcodeInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /** Select a station on scan page */
  async selectStation(stationName: string): Promise<void> {
    await this.scanStationSelector.click();
    await this.page.waitForTimeout(200);
    await this.page.getByRole('option', { name: new RegExp(stationName, 'i') }).click();
  }

  /** Clear the barcode input */
  async clearBarcodeInput(): Promise<void> {
    await this.barcodeInput.clear();
  }

  // ============================================================================
  // Actions - Stations
  // ============================================================================

  /** Get a station row by name */
  getStationRow(name: string): Locator {
    return this.stationsTable.locator('tbody tr').filter({ hasText: name }).first();
  }

  /** Open the create station dialog */
  async openCreateStationDialog(): Promise<void> {
    await this.waitForPageLoad();
    await expect(this.stationsHeading).toBeVisible({ timeout: TIMEOUTS.standard });

    const addButton = this.addStationButton;
    const createFirstButton = this.createFirstStationButton;

    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();
    } else if (await createFirstButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createFirstButton.click();
    }

    await expect(this.stationDialog).toBeVisible({ timeout: TIMEOUTS.fast });
    await this.page.waitForTimeout(300);
  }

  /** Fill the station form */
  async fillStationForm(data: {
    name: string;
    location?: string;
    deviceId?: string;
    active?: boolean;
  }): Promise<void> {
    await this.stationNameInput.fill(data.name);

    if (data.location) {
      await this.stationLocationInput.fill(data.location);
    }

    if (data.deviceId) {
      await this.stationDeviceIdInput.fill(data.deviceId);
    }

    if (data.active !== undefined) {
      const isCurrentlyActive = await this.stationActiveToggle.getAttribute('data-state') === 'checked';
      if (isCurrentlyActive !== data.active) {
        await this.stationActiveToggle.click();
      }
    }
  }

  /** Save the station (create or update) */
  async saveStation(): Promise<void> {
    await expect(this.stationSaveButton).toBeEnabled({ timeout: TIMEOUTS.fast });
    await this.stationSaveButton.click();
    await expect(this.stationDialog).not.toBeVisible({ timeout: TIMEOUTS.standard });
    await this.page.waitForLoadState('networkidle');
  }

  /** Create a new station */
  async createStation(data: {
    name: string;
    location?: string;
    deviceId?: string;
    active?: boolean;
  }): Promise<void> {
    await this.openCreateStationDialog();
    await this.fillStationForm(data);
    await this.saveStation();
  }

  /** Open the edit dialog for a station */
  async openEditStationDialog(name: string): Promise<void> {
    const row = this.getStationRow(name);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /edit/i }).click();
    await expect(this.stationDialog).toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /** Toggle station active status from table row */
  async toggleStationStatus(name: string): Promise<void> {
    const row = this.getStationRow(name);
    // Find the switch in the row and click it
    await row.locator('button[role="switch"]').click();
    await this.waitForPageLoad();
  }

  /** Delete a station */
  async deleteStation(name: string): Promise<void> {
    const row = this.getStationRow(name);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /delete/i }).click();

    // Handle confirmation dialog
    await expect(this.deleteConfirmDialog).toBeVisible({ timeout: TIMEOUTS.fast });
    await this.confirmDeleteButton.click();
    await expect(this.deleteConfirmDialog).not.toBeVisible({ timeout: TIMEOUTS.fast });
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Actions - Queue
  // ============================================================================

  /** Get a guest row by name or ticket ID */
  getGuestRow(searchText: string): Locator {
    return this.queueTable.locator('tbody tr').filter({ hasText: searchText }).first();
  }

  /** Search for a guest in the queue */
  async searchGuest(searchText: string): Promise<void> {
    await this.queueSearchInput.fill(searchText);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /** Filter queue by status */
  async filterQueueByStatus(status: 'all' | 'pending' | 'checked-in' | 'late'): Promise<void> {
    await this.queueStatusFilter.click();
    await this.page.waitForTimeout(200);
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
    await this.waitForPageLoad();
  }

  /** Switch to All guests tab */
  async switchToAllGuestsTab(): Promise<void> {
    await this.allGuestsTab.click();
    await this.waitForPageLoad();
  }

  /** Switch to Arriving Soon tab */
  async switchToArrivingSoonTab(): Promise<void> {
    await this.arrivingSoonTab.click();
    await this.waitForPageLoad();
  }

  /** Switch to Late tab */
  async switchToLateTab(): Promise<void> {
    await this.lateTab.click();
    await this.waitForPageLoad();
  }

  /** Manually check in a guest from the queue */
  async checkInGuestFromQueue(searchText: string): Promise<void> {
    const row = this.getGuestRow(searchText);
    await row.getByRole('button', { name: /check in/i }).click();
    await this.waitForPageLoad();
  }

  /** Refresh the queue */
  async refreshQueue(): Promise<void> {
    await this.queueRefreshButton.click();
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Assertions - Main Page
  // ============================================================================

  /** Assert main check-in page is visible */
  async expectCheckInPageVisible(): Promise<void> {
    await expect(this.checkInHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.scanTicketsCard).toBeVisible();
    await expect(this.stationsCard).toBeVisible();
    await expect(this.queueCard).toBeVisible();
  }

  /** Assert stats cards are visible */
  async expectStatsCardsVisible(): Promise<void> {
    await expect(this.checkedInTodayCard).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.currentCapacityCard).toBeVisible();
    await expect(this.pendingArrivalsCard).toBeVisible();
    await expect(this.lateArrivalsCard).toBeVisible();
  }

  /** Assert checked in today count */
  async expectCheckedInTodayCount(count: number | string): Promise<void> {
    await expect(this.checkedInTodayCard.getByText(String(count))).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Scan Page
  // ============================================================================

  /** Assert scan page is visible */
  async expectScanPageVisible(): Promise<void> {
    await expect(this.scanHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.barcodeInput).toBeVisible();
    await expect(this.checkInButton).toBeVisible();
  }

  /** Assert scan was successful */
  async expectScanSuccess(): Promise<void> {
    // Look for success indicators - green checkmark or success message
    const successIndicator = this.page.locator('[class*="text-green"], [class*="CheckCircle"], text=/valid|success|checked in/i').first();
    await expect(successIndicator).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert scan failed */
  async expectScanError(message?: string): Promise<void> {
    const errorIndicator = this.page.locator('[class*="text-red"], [class*="XCircle"], [class*="destructive"]').first();
    await expect(errorIndicator).toBeVisible({ timeout: TIMEOUTS.standard });
    if (message) {
      await expect(this.page.getByText(new RegExp(message, 'i'))).toBeVisible();
    }
  }

  /** Assert scan requires waiver */
  async expectWaiverRequired(): Promise<void> {
    const warningIndicator = this.page.locator('[class*="text-yellow"], [class*="AlertTriangle"], text=/waiver/i').first();
    await expect(warningIndicator).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert recent scans list shows entries */
  async expectRecentScansVisible(): Promise<void> {
    await expect(this.recentScansHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Stations Page
  // ============================================================================

  /** Assert stations page is visible */
  async expectStationsPageVisible(): Promise<void> {
    await expect(this.stationsHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert station exists in list */
  async expectStationInList(name: string): Promise<void> {
    await expect(this.getStationRow(name)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert station has specific status */
  async expectStationStatus(name: string, active: boolean): Promise<void> {
    const row = this.getStationRow(name);
    const statusSwitch = row.locator('button[role="switch"]');
    const expectedState = active ? 'checked' : 'unchecked';
    await expect(statusSwitch).toHaveAttribute('data-state', expectedState, { timeout: TIMEOUTS.standard });
  }

  /** Assert station count */
  async expectStationCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.stationsEmptyState).toBeVisible({ timeout: TIMEOUTS.standard });
    } else {
      await expect(this.stationRows).toHaveCount(count, { timeout: TIMEOUTS.standard });
    }
  }

  /** Assert station not in list */
  async expectStationNotInList(name: string): Promise<void> {
    await expect(this.getStationRow(name)).not.toBeVisible({ timeout: TIMEOUTS.fast });
  }

  // ============================================================================
  // Assertions - Queue Page
  // ============================================================================

  /** Assert queue page is visible */
  async expectQueuePageVisible(): Promise<void> {
    await expect(this.queueHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert queue stats cards are visible */
  async expectQueueStatsVisible(): Promise<void> {
    await expect(this.arrivingSoonCard).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.pendingTodayCard).toBeVisible();
  }

  /** Assert guest exists in queue */
  async expectGuestInQueue(searchText: string): Promise<void> {
    await expect(this.getGuestRow(searchText)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert guest not in queue */
  async expectGuestNotInQueue(searchText: string): Promise<void> {
    await expect(this.getGuestRow(searchText)).not.toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /** Assert queue is empty */
  async expectQueueEmpty(): Promise<void> {
    await expect(this.queueEmptyState).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert queue has guests */
  async expectQueueHasGuests(): Promise<void> {
    await expect(this.queueRows.first()).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert tab is selected */
  async expectTabSelected(tab: 'all' | 'arriving-soon' | 'late'): Promise<void> {
    const tabLocator = tab === 'all' ? this.allGuestsTab :
                       tab === 'arriving-soon' ? this.arrivingSoonTab :
                       this.lateTab;
    await expect(tabLocator).toHaveAttribute('data-state', 'active', { timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Common
  // ============================================================================

  /** Assert toast notification appears */
  async expectToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator('[role="alert"], [data-sonner-toast]');
    await expect(toast.filter({ hasText: message }).first()).toBeVisible({ timeout: TIMEOUTS.standard });
  }
}

/**
 * Create a CheckInPage instance
 */
export function createCheckInPage(page: Page, orgSlug: string): CheckInPage {
  return new CheckInPage(page, orgSlug);
}
