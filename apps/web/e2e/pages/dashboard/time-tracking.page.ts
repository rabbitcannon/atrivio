import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page object for Time Tracking functionality
 * Covers both:
 * - Public Time Clock (staff self-service at /[orgSlug]/time/*)
 * - Dashboard Time Manager (admin view at /[orgId]/staff/[staffId]/time)
 */
export class TimeTrackingPage extends BasePage {
  // ================== PUBLIC TIME CLOCK LOCATORS ==================

  // Layout
  readonly timeClockHeader: Locator;
  readonly bottomNav: Locator;
  readonly clockNavItem: Locator;
  readonly scheduleNavItem: Locator;
  readonly swapsNavItem: Locator;
  readonly availabilityNavItem: Locator;
  readonly userMenuButton: Locator;
  readonly signInButton: Locator;

  // Main Clock Page
  readonly clockCard: Locator;
  readonly clockedInStatus: Locator;
  readonly notClockedInStatus: Locator;
  readonly clockInButton: Locator;
  readonly clockOutButton: Locator;
  readonly attractionSelector: Locator;
  readonly durationDisplay: Locator;

  // Schedule Page
  readonly scheduleHeading: Locator;
  readonly noUpcomingShifts: Locator;
  readonly shiftCard: Locator;
  readonly shiftOptionsMenu: Locator;
  readonly requestSwapMenuItem: Locator;
  readonly dropShiftMenuItem: Locator;
  readonly totalShiftsCount: Locator;

  // Swap Request Dialog
  readonly swapDialog: Locator;
  readonly swapReasonTextarea: Locator;
  readonly submitRequestButton: Locator;
  readonly swapSuccessMessage: Locator;

  // Swaps Page
  readonly swapsHeading: Locator;
  readonly noSwapRequests: Locator;
  readonly pendingRequestsSection: Locator;
  readonly pastRequestsSection: Locator;
  readonly swapRequestCard: Locator;
  readonly cancelRequestButton: Locator;

  // Cancel Dialog
  readonly cancelDialog: Locator;
  readonly keepRequestButton: Locator;
  readonly confirmCancelButton: Locator;

  // Availability Page
  readonly availabilityHeading: Locator;
  readonly saveAvailabilityButton: Locator;
  readonly availabilitySuccessAlert: Locator;
  readonly dayCards: Locator;

  // Status Page (manager view)
  readonly statusHeading: Locator;
  readonly currentlyWorkingCount: Locator;
  readonly refreshButton: Locator;
  readonly noOneClockedIn: Locator;
  readonly staffByAttractionCards: Locator;
  readonly accessDeniedMessage: Locator;

  // ================== DASHBOARD TIME MANAGER LOCATORS ==================

  // Time Manager
  readonly timeTrackingHeading: Locator;
  readonly backToStaffButton: Locator;

  // Summary Cards
  readonly thisWeekCard: Locator;
  readonly thisMonthCard: Locator;
  readonly thisSeasonCard: Locator;

  // Clock Status Card
  readonly clockStatusCard: Locator;
  readonly clockStatusDescription: Locator;
  readonly dashboardClockInButton: Locator;
  readonly dashboardClockOutButton: Locator;

  // Clock In Dialog
  readonly clockInDialog: Locator;
  readonly attractionSelect: Locator;
  readonly clockInDialogSubmit: Locator;
  readonly clockInDialogCancel: Locator;

  // Clock Out Dialog
  readonly clockOutDialog: Locator;
  readonly breakMinutesInput: Locator;
  readonly notesTextarea: Locator;
  readonly clockOutDialogSubmit: Locator;
  readonly clockOutDialogCancel: Locator;

  // Time Entries Table
  readonly recentEntriesCard: Locator;
  readonly entriesTable: Locator;
  readonly noEntriesMessage: Locator;
  readonly entryRow: Locator;
  readonly pendingApprovalCount: Locator;

  // Entry Actions
  readonly entryActionsMenu: Locator;
  readonly approveMenuItem: Locator;

  constructor(page: Page, private orgSlug: string) {
    super(page);

    // Public Time Clock - Layout
    this.timeClockHeader = page.locator('header').filter({ hasText: 'Time Clock' });
    this.bottomNav = page.locator('nav.fixed.bottom-0');
    this.clockNavItem = page.locator('a', { hasText: 'Clock' });
    this.scheduleNavItem = page.locator('a', { hasText: 'Schedule' });
    this.swapsNavItem = page.locator('a', { hasText: 'Swaps' });
    this.availabilityNavItem = page.locator('a', { hasText: 'Availability' });
    this.userMenuButton = page.locator('button').filter({ has: page.locator('span.relative') });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });

    // Main Clock Page
    this.clockCard = page.locator('[class*="Card"]').filter({ hasText: 'Time Clock' }).first();
    this.clockedInStatus = page.locator('text=Clocked In');
    this.notClockedInStatus = page.locator('text=You are not clocked in');
    this.clockInButton = page.getByRole('button', { name: 'Clock In' });
    this.clockOutButton = page.getByRole('button', { name: 'Clock Out' });
    this.attractionSelector = page.locator('button[class*="border-primary"]');
    this.durationDisplay = page.locator('.font-mono.text-lg');

    // Schedule Page
    this.scheduleHeading = page.getByRole('heading', { name: 'My Schedule' });
    this.noUpcomingShifts = page.locator('text=No Upcoming Shifts');
    this.shiftCard = page.locator('[class*="Card"]').filter({ has: page.locator('text=AM').or(page.locator('text=PM')) });
    this.shiftOptionsMenu = page.getByRole('button', { name: 'Shift options' });
    this.requestSwapMenuItem = page.getByRole('menuitem', { name: 'Request Swap' });
    this.dropShiftMenuItem = page.getByRole('menuitem', { name: 'Drop Shift' });
    this.totalShiftsCount = page.locator('text=Total upcoming shifts').locator('..').locator('.font-medium');

    // Swap Request Dialog
    this.swapDialog = page.getByRole('dialog');
    this.swapReasonTextarea = page.locator('#reason');
    this.submitRequestButton = page.getByRole('button', { name: 'Submit Request' });
    this.swapSuccessMessage = page.locator('text=Request Submitted');

    // Swaps Page
    this.swapsHeading = page.getByRole('heading', { name: 'My Swap Requests' });
    this.noSwapRequests = page.locator('text=No Swap Requests');
    this.pendingRequestsSection = page.locator('text=Pending').locator('..');
    this.pastRequestsSection = page.locator('text=Past Requests').locator('..');
    this.swapRequestCard = page.locator('[class*="Card"]').filter({ has: page.locator('text=Shift Swap').or(page.locator('text=Drop Shift')) });
    this.cancelRequestButton = page.getByRole('button').filter({ has: page.locator('svg.h-4.w-4') }).filter({ hasText: '' });

    // Cancel Dialog
    this.cancelDialog = page.getByRole('dialog').filter({ hasText: 'Cancel Request' });
    this.keepRequestButton = page.getByRole('button', { name: 'Keep Request' });
    this.confirmCancelButton = page.getByRole('button', { name: 'Cancel Request' });

    // Availability Page
    this.availabilityHeading = page.getByRole('heading', { name: 'My Availability' });
    this.saveAvailabilityButton = page.getByRole('button', { name: 'Save Availability' });
    this.availabilitySuccessAlert = page.locator('text=Availability saved successfully');
    this.dayCards = page.locator('[class*="Card"]').filter({ has: page.locator('text=Sunday').or(page.locator('text=Monday')) });

    // Status Page
    this.statusHeading = page.locator('text=Staff Status');
    this.currentlyWorkingCount = page.locator('text=Currently Working').locator('..').locator('[class*="Badge"]');
    this.refreshButton = page.getByRole('button').filter({ has: page.locator('svg.h-4.w-4') }).last();
    this.noOneClockedIn = page.locator('text=No one is currently clocked in');
    this.staffByAttractionCards = page.locator('[class*="Card"]').filter({ has: page.locator('svg[class*="MapPin"]') });
    this.accessDeniedMessage = page.locator('text=Access Denied');

    // Dashboard Time Manager
    this.timeTrackingHeading = page.getByRole('heading', { name: 'Time Tracking' });
    this.backToStaffButton = page.getByRole('link', { name: 'Back to staff profile' });

    // Summary Cards
    this.thisWeekCard = page.locator('[class*="Card"]').filter({ hasText: 'This Week' });
    this.thisMonthCard = page.locator('[class*="Card"]').filter({ hasText: 'This Month' });
    this.thisSeasonCard = page.locator('[class*="Card"]').filter({ hasText: 'This Season' });

    // Clock Status Card
    this.clockStatusCard = page.locator('[class*="Card"]').filter({ hasText: 'Clock Status' });
    this.clockStatusDescription = this.clockStatusCard.locator('[class*="CardDescription"]');
    this.dashboardClockInButton = this.clockStatusCard.getByRole('button', { name: 'Clock In' });
    this.dashboardClockOutButton = this.clockStatusCard.getByRole('button', { name: 'Clock Out' });

    // Clock In Dialog
    this.clockInDialog = page.getByRole('dialog').filter({ hasText: 'Clock In' });
    this.attractionSelect = page.getByRole('combobox');
    this.clockInDialogSubmit = this.clockInDialog.getByRole('button', { name: 'Clock In' });
    this.clockInDialogCancel = this.clockInDialog.getByRole('button', { name: 'Cancel' });

    // Clock Out Dialog
    this.clockOutDialog = page.getByRole('dialog').filter({ hasText: 'Clock Out' });
    this.breakMinutesInput = page.locator('#break-minutes');
    this.notesTextarea = page.locator('#notes');
    this.clockOutDialogSubmit = this.clockOutDialog.getByRole('button', { name: 'Clock Out' });
    this.clockOutDialogCancel = this.clockOutDialog.getByRole('button', { name: 'Cancel' });

    // Time Entries Table
    this.recentEntriesCard = page.locator('[class*="Card"]').filter({ hasText: 'Recent Entries' });
    this.entriesTable = page.getByRole('table');
    this.noEntriesMessage = page.locator('text=No time entries yet');
    this.entryRow = page.locator('tbody tr');
    this.pendingApprovalCount = this.recentEntriesCard.locator('[class*="CardDescription"]');

    // Entry Actions
    this.entryActionsMenu = page.getByRole('button', { name: 'Actions' });
    this.approveMenuItem = page.getByRole('menuitem', { name: 'Approve' });
  }

  // ================== NAVIGATION ==================

  /** Navigate to public time clock main page */
  async gotoTimeClock(): Promise<void> {
    await this.goto(`/${this.orgSlug}/time`);
  }

  /** Navigate to my schedule page */
  async gotoMySchedule(): Promise<void> {
    await this.goto(`/${this.orgSlug}/time/schedule`);
  }

  /** Navigate to my swaps page */
  async gotoMySwaps(): Promise<void> {
    await this.goto(`/${this.orgSlug}/time/swaps`);
  }

  /** Navigate to my availability page */
  async gotoMyAvailability(): Promise<void> {
    await this.goto(`/${this.orgSlug}/time/availability`);
  }

  /** Navigate to staff status page (manager view) */
  async gotoStaffStatus(): Promise<void> {
    await this.goto(`/${this.orgSlug}/time/status`);
  }

  /** Navigate to dashboard time manager for a specific staff member */
  async gotoStaffTimeManager(orgId: string, staffId: string): Promise<void> {
    await this.goto(`/${orgId}/staff/${staffId}/time`);
  }

  /** Navigate to my time (redirects to staff time page) */
  async gotoMyTime(orgId: string): Promise<void> {
    await this.goto(`/${orgId}/my-time`);
  }

  // ================== PUBLIC TIME CLOCK ACTIONS ==================

  /** Click the Clock nav item */
  async clickClockNav(): Promise<void> {
    await this.clockNavItem.click();
  }

  /** Click the Schedule nav item */
  async clickScheduleNav(): Promise<void> {
    await this.scheduleNavItem.click();
  }

  /** Click the Swaps nav item */
  async clickSwapsNav(): Promise<void> {
    await this.swapsNavItem.click();
  }

  /** Click the Availability nav item */
  async clickAvailabilityNav(): Promise<void> {
    await this.availabilityNavItem.click();
  }

  /** Select an attraction for clock in */
  async selectAttraction(attractionName: string): Promise<void> {
    const attractionButton = this.page.locator('button').filter({ hasText: attractionName });
    await attractionButton.click();
  }

  /** Clock in at the specified attraction (public time clock) */
  async clockIn(attractionName?: string): Promise<void> {
    if (attractionName) {
      await this.selectAttraction(attractionName);
    }
    await this.clockInButton.click();
  }

  /** Clock out (public time clock) */
  async clockOut(): Promise<void> {
    await this.clockOutButton.click();
  }

  /** Open swap request dialog for a shift */
  async openSwapRequestDialog(): Promise<void> {
    await this.shiftOptionsMenu.first().click();
    await this.requestSwapMenuItem.click();
  }

  /** Open drop shift dialog for a shift */
  async openDropShiftDialog(): Promise<void> {
    await this.shiftOptionsMenu.first().click();
    await this.dropShiftMenuItem.click();
  }

  /** Submit a swap/drop request */
  async submitSwapRequest(reason?: string): Promise<void> {
    if (reason) {
      await this.swapReasonTextarea.fill(reason);
    }
    await this.submitRequestButton.click();
  }

  /** Cancel a pending swap request */
  async cancelSwapRequest(): Promise<void> {
    // Find and click the cancel button on first pending request
    const cancelBtn = this.pendingRequestsSection.locator('button').filter({ has: this.page.locator('svg') }).first();
    await cancelBtn.click();
    await this.confirmCancelButton.click();
  }

  /** Set availability for a specific day */
  async setDayAvailability(
    dayName: string,
    type: 'Available' | 'Preferred' | 'Unavailable',
    startTime?: string,
    endTime?: string
  ): Promise<void> {
    const dayCard = this.page.locator('[class*="Card"]').filter({ hasText: dayName });
    const typeSelect = dayCard.getByRole('combobox');
    await typeSelect.click();
    await this.page.getByRole('option', { name: type }).click();

    if (type !== 'Unavailable' && startTime && endTime) {
      const startInput = dayCard.locator('input[type="time"]').first();
      const endInput = dayCard.locator('input[type="time"]').last();
      await startInput.fill(startTime);
      await endInput.fill(endTime);
    }
  }

  /** Save availability */
  async saveAvailability(): Promise<void> {
    await this.saveAvailabilityButton.click();
  }

  // ================== DASHBOARD TIME MANAGER ACTIONS ==================

  /** Open clock in dialog (dashboard) */
  async openClockInDialog(): Promise<void> {
    await this.dashboardClockInButton.click();
  }

  /** Open clock out dialog (dashboard) */
  async openClockOutDialog(): Promise<void> {
    await this.dashboardClockOutButton.click();
  }

  /** Clock in from dashboard */
  async dashboardClockIn(attractionName: string): Promise<void> {
    await this.openClockInDialog();
    await this.attractionSelect.click();
    await this.page.getByRole('option', { name: attractionName }).click();
    await this.clockInDialogSubmit.click();
  }

  /** Clock out from dashboard */
  async dashboardClockOut(breakMinutes?: number, notes?: string): Promise<void> {
    await this.openClockOutDialog();
    if (breakMinutes !== undefined) {
      await this.breakMinutesInput.fill(breakMinutes.toString());
    }
    if (notes) {
      await this.notesTextarea.fill(notes);
    }
    await this.clockOutDialogSubmit.click();
  }

  /** Approve a time entry */
  async approveTimeEntry(rowIndex: number = 0): Promise<void> {
    const row = this.entryRow.nth(rowIndex);
    await row.getByRole('button', { name: 'Actions' }).click();
    await this.approveMenuItem.click();
  }

  // ================== ASSERTIONS ==================

  // Public Time Clock
  async expectTimeClockPageVisible(): Promise<void> {
    await expect(this.timeClockHeader).toBeVisible();
  }

  async expectClockedIn(): Promise<void> {
    await expect(this.clockedInStatus).toBeVisible();
    await expect(this.clockOutButton).toBeVisible();
  }

  async expectNotClockedIn(): Promise<void> {
    await expect(this.notClockedInStatus).toBeVisible();
    await expect(this.clockInButton).toBeVisible();
  }

  async expectBottomNavVisible(): Promise<void> {
    await expect(this.bottomNav).toBeVisible();
    await expect(this.clockNavItem).toBeVisible();
    await expect(this.scheduleNavItem).toBeVisible();
    await expect(this.swapsNavItem).toBeVisible();
    await expect(this.availabilityNavItem).toBeVisible();
  }

  async expectSignInRequired(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
  }

  // Schedule Page
  async expectMySchedulePageVisible(): Promise<void> {
    await expect(this.scheduleHeading).toBeVisible();
  }

  async expectNoUpcomingShifts(): Promise<void> {
    await expect(this.noUpcomingShifts).toBeVisible();
  }

  async expectShiftsVisible(): Promise<void> {
    await expect(this.shiftCard.first()).toBeVisible();
  }

  // Swaps Page
  async expectSwapsPageVisible(): Promise<void> {
    await expect(this.swapsHeading).toBeVisible();
  }

  async expectNoSwapRequests(): Promise<void> {
    await expect(this.noSwapRequests).toBeVisible();
  }

  async expectPendingRequests(): Promise<void> {
    await expect(this.pendingRequestsSection).toBeVisible();
  }

  async expectSwapRequestSubmitted(): Promise<void> {
    await expect(this.swapSuccessMessage).toBeVisible();
  }

  // Availability Page
  async expectAvailabilityPageVisible(): Promise<void> {
    await expect(this.availabilityHeading).toBeVisible();
  }

  async expectAvailabilitySaved(): Promise<void> {
    await expect(this.availabilitySuccessAlert).toBeVisible();
  }

  async expectDayCardsVisible(): Promise<void> {
    // Should see all 7 days
    await expect(this.page.locator('text=Sunday')).toBeVisible();
    await expect(this.page.locator('text=Saturday')).toBeVisible();
  }

  // Status Page
  async expectStatusPageVisible(): Promise<void> {
    await expect(this.statusHeading).toBeVisible();
  }

  async expectAccessDenied(): Promise<void> {
    await expect(this.accessDeniedMessage).toBeVisible();
  }

  async expectCurrentlyWorkingCount(count: number): Promise<void> {
    await expect(this.currentlyWorkingCount).toHaveText(count.toString());
  }

  async expectNoOneClockedIn(): Promise<void> {
    await expect(this.noOneClockedIn).toBeVisible();
  }

  // Dashboard Time Manager
  async expectTimeManagerPageVisible(): Promise<void> {
    await expect(this.timeTrackingHeading).toBeVisible();
  }

  async expectSummaryCardsVisible(): Promise<void> {
    await expect(this.thisWeekCard).toBeVisible();
    await expect(this.thisMonthCard).toBeVisible();
    await expect(this.thisSeasonCard).toBeVisible();
  }

  async expectClockStatusCardVisible(): Promise<void> {
    await expect(this.clockStatusCard).toBeVisible();
  }

  async expectDashboardClockedIn(): Promise<void> {
    await expect(this.clockStatusDescription).toContainText('Clocked in since');
    await expect(this.dashboardClockOutButton).toBeVisible();
  }

  async expectDashboardNotClockedIn(): Promise<void> {
    await expect(this.clockStatusDescription).toContainText('Not currently clocked in');
    await expect(this.dashboardClockInButton).toBeVisible();
  }

  async expectRecentEntriesVisible(): Promise<void> {
    await expect(this.recentEntriesCard).toBeVisible();
  }

  async expectNoTimeEntries(): Promise<void> {
    await expect(this.noEntriesMessage).toBeVisible();
  }

  async expectTimeEntriesInTable(): Promise<void> {
    await expect(this.entriesTable).toBeVisible();
    await expect(this.entryRow.first()).toBeVisible();
  }

  async expectClockInDialogVisible(): Promise<void> {
    await expect(this.clockInDialog).toBeVisible();
  }

  async expectClockOutDialogVisible(): Promise<void> {
    await expect(this.clockOutDialog).toBeVisible();
  }

  async expectEntryStatus(rowIndex: number, status: 'pending' | 'approved'): Promise<void> {
    const row = this.entryRow.nth(rowIndex);
    await expect(row.locator(`text=${status}`)).toBeVisible();
  }
}

/**
 * Factory function to create TimeTrackingPage
 */
export function createTimeTrackingPage(page: Page, orgSlug: string): TimeTrackingPage {
  return new TimeTrackingPage(page, orgSlug);
}
