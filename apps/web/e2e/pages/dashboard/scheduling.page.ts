import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../helpers/fixtures';

/**
 * Scheduling Page Object
 *
 * Encapsulates interactions with scheduling pages including:
 * - Main schedule dashboard
 * - All shifts management
 * - Week/calendar view
 * - Shift templates
 * - Staff availability
 * - Swap requests
 * - Schedule roles
 */
export class SchedulingPage extends BasePage {
  private readonly orgSlug: string;

  constructor(page: Page, orgSlug: string) {
    super(page);
    this.orgSlug = orgSlug;
  }

  // ============================================================================
  // Locators - Main Schedule Dashboard
  // ============================================================================

  /** Main schedule page heading */
  get scheduleHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Schedule', level: 1 }).first();
  }

  /** This Week stats card */
  get thisWeekCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'This Week' }).first();
  }

  /** Unassigned stats card */
  get unassignedCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Unassigned' }).first();
  }

  /** Templates stats card */
  get templatesStatsCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: /^Templates/ }).first();
  }

  /** Hours stats card */
  get hoursCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Hours' }).first();
  }

  /** All Shifts navigation card */
  get allShiftsCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'All Shifts' }).first();
  }

  /** Week View navigation card */
  get weekViewCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Week View' }).first();
  }

  /** Templates navigation card */
  get templatesCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: /Templates.*reusable/i }).first();
  }

  /** Staff Availability navigation card */
  get staffAvailabilityCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Staff Availability' }).first();
  }

  /** Swap Requests navigation card */
  get swapRequestsCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Swap Requests' }).first();
  }

  /** Roles navigation card */
  get rolesCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: /^Roles/ }).first();
  }

  // ============================================================================
  // Locators - All Shifts Page
  // ============================================================================

  /** All Shifts page heading */
  get allShiftsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'All Shifts', level: 1 }).first();
  }

  /** Attraction selector */
  get attractionSelect(): Locator {
    return this.page.locator('button[role="combobox"]').first();
  }

  /** Add Shift button */
  get addShiftButton(): Locator {
    return this.page.getByRole('button', { name: /add shift/i }).first();
  }

  /** Shifts table */
  get shiftsTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Shifts table rows */
  get shiftRows(): Locator {
    return this.shiftsTable.locator('tbody tr');
  }

  /** No shifts empty state */
  get noShiftsEmptyState(): Locator {
    return this.page.getByText(/no shifts scheduled/i).first();
  }

  /** No attractions empty state */
  get noAttractionsState(): Locator {
    return this.page.getByText(/no attractions found/i).first();
  }

  /** Shift form dialog */
  get shiftDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  // ============================================================================
  // Locators - Week View Page
  // ============================================================================

  /** Week View page heading */
  get weekViewHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Week View', level: 1 }).first();
  }

  // ============================================================================
  // Locators - Templates Page
  // ============================================================================

  /** Templates page heading */
  get templatesHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Shift Templates', level: 1 }).first();
  }

  /** Add Template button */
  get addTemplateButton(): Locator {
    return this.page.getByRole('button', { name: /add template/i }).first();
  }

  /** Generate Schedules button */
  get generateSchedulesButton(): Locator {
    return this.page.getByRole('button', { name: /generate schedules/i }).first();
  }

  /** Templates table */
  get templatesTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Template rows */
  get templateRows(): Locator {
    return this.templatesTable.locator('tbody tr');
  }

  /** No templates empty state */
  get noTemplatesState(): Locator {
    return this.page.getByText(/no templates yet/i).first();
  }

  /** Template form dialog */
  get templateDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  // ============================================================================
  // Locators - Availability Page
  // ============================================================================

  /** Availability page heading */
  get availabilityHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Staff Availability', level: 1 }).first();
  }

  // ============================================================================
  // Locators - Swap Requests Page
  // ============================================================================

  /** Swap Requests page heading */
  get swapRequestsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Swap Requests', level: 1 }).first();
  }

  /** Status filter select */
  get statusFilterSelect(): Locator {
    return this.page.locator('button[role="combobox"]').first();
  }

  /** Type filter select */
  get typeFilterSelect(): Locator {
    return this.page.locator('button[role="combobox"]').nth(1);
  }

  /** Swap requests table */
  get swapRequestsTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Swap request rows */
  get swapRequestRows(): Locator {
    return this.swapRequestsTable.locator('tbody tr');
  }

  /** No swap requests empty state */
  get noSwapRequestsState(): Locator {
    return this.page.getByText(/no swap requests/i).first();
  }

  /** Approve/Reject dialog */
  get swapActionDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  // ============================================================================
  // Locators - Roles Page
  // ============================================================================

  /** Roles page heading */
  get rolesHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Schedule Roles', level: 1 }).first();
  }

  /** Total Roles stats card */
  get totalRolesCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Total Roles' }).first();
  }

  /** Active Roles stats card */
  get activeRolesCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Active Roles' }).first();
  }

  /** Inactive Roles stats card */
  get inactiveRolesCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Inactive Roles' }).first();
  }

  /** Roles table */
  get rolesTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Role rows */
  get roleRows(): Locator {
    return this.rolesTable.locator('tbody tr');
  }

  /** No roles empty state */
  get noRolesState(): Locator {
    return this.page.getByText(/no roles found/i).first();
  }

  /** Color Legend section */
  get colorLegendSection(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Color Legend' }).first();
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /** Navigate to the main schedule dashboard */
  override async goto(): Promise<void> {
    await super.goto(`/${this.orgSlug}/schedule`);
  }

  /** Navigate to all shifts page */
  async gotoShifts(): Promise<void> {
    await super.goto(`/${this.orgSlug}/schedule/shifts`);
  }

  /** Navigate to week/calendar view */
  async gotoCalendar(): Promise<void> {
    await super.goto(`/${this.orgSlug}/schedule/calendar`);
  }

  /** Navigate to templates page */
  async gotoTemplates(): Promise<void> {
    await super.goto(`/${this.orgSlug}/schedule/templates`);
  }

  /** Navigate to availability page */
  async gotoAvailability(): Promise<void> {
    await super.goto(`/${this.orgSlug}/schedule/availability`);
  }

  /** Navigate to swap requests page */
  async gotoSwaps(): Promise<void> {
    await super.goto(`/${this.orgSlug}/schedule/swaps`);
  }

  /** Navigate to roles page */
  async gotoRoles(): Promise<void> {
    await super.goto(`/${this.orgSlug}/schedule/roles`);
  }

  // ============================================================================
  // Actions - Dashboard Navigation
  // ============================================================================

  /** Click All Shifts card to navigate */
  async clickAllShiftsCard(): Promise<void> {
    await this.allShiftsCard.click();
    await this.waitForPageLoad();
  }

  /** Click Week View card to navigate */
  async clickWeekViewCard(): Promise<void> {
    await this.weekViewCard.click();
    await this.waitForPageLoad();
  }

  /** Click Templates card to navigate */
  async clickTemplatesCard(): Promise<void> {
    await this.templatesCard.click();
    await this.waitForPageLoad();
  }

  /** Click Staff Availability card to navigate */
  async clickAvailabilityCard(): Promise<void> {
    await this.staffAvailabilityCard.click();
    await this.waitForPageLoad();
  }

  /** Click Swap Requests card to navigate */
  async clickSwapRequestsCard(): Promise<void> {
    await this.swapRequestsCard.click();
    await this.waitForPageLoad();
  }

  /** Click Roles card to navigate */
  async clickRolesCard(): Promise<void> {
    await this.rolesCard.click();
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Actions - Shifts
  // ============================================================================

  /** Select an attraction from the dropdown */
  async selectAttraction(attractionName: string): Promise<void> {
    await this.attractionSelect.click();
    await this.page.waitForTimeout(200);
    await this.page.getByRole('option', { name: attractionName }).click();
    await this.waitForPageLoad();
  }

  /** Get a shift row by staff name or date */
  getShiftRow(searchText: string): Locator {
    return this.shiftsTable.locator('tbody tr').filter({ hasText: searchText }).first();
  }

  /** Open the shift actions menu */
  async openShiftActions(searchText: string): Promise<void> {
    const row = this.getShiftRow(searchText);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
  }

  /** Edit a shift from actions menu */
  async editShift(searchText: string): Promise<void> {
    await this.openShiftActions(searchText);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /edit shift/i }).click();
    await this.page.waitForTimeout(200);
  }

  /** Delete a shift from actions menu */
  async deleteShift(searchText: string): Promise<void> {
    await this.openShiftActions(searchText);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /delete shift/i }).click();
  }

  // ============================================================================
  // Actions - Templates
  // ============================================================================

  /** Get a template row by name */
  getTemplateRow(templateName: string): Locator {
    return this.templatesTable.locator('tbody tr').filter({ hasText: templateName }).first();
  }

  /** Open template actions menu */
  async openTemplateActions(templateName: string): Promise<void> {
    const row = this.getTemplateRow(templateName);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
  }

  /** Edit a template from actions menu */
  async editTemplate(templateName: string): Promise<void> {
    await this.openTemplateActions(templateName);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /edit template/i }).click();
    await this.page.waitForTimeout(200);
  }

  /** Delete a template from actions menu */
  async deleteTemplate(templateName: string): Promise<void> {
    await this.openTemplateActions(templateName);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /delete template/i }).click();
  }

  // ============================================================================
  // Actions - Swap Requests
  // ============================================================================

  /** Filter swap requests by status */
  async filterByStatus(status: 'all' | 'pending' | 'approved' | 'rejected' | 'canceled' | 'expired'): Promise<void> {
    await this.statusFilterSelect.click();
    await this.page.waitForTimeout(200);
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
    await this.waitForPageLoad();
  }

  /** Filter swap requests by type */
  async filterByType(type: 'all' | 'swap' | 'drop' | 'pickup'): Promise<void> {
    await this.typeFilterSelect.click();
    await this.page.waitForTimeout(200);
    await this.page.getByRole('option', { name: new RegExp(`^${type}$`, 'i') }).click();
    await this.waitForPageLoad();
  }

  /** Get a swap request row by requester name */
  getSwapRequestRow(requesterName: string): Locator {
    return this.swapRequestsTable.locator('tbody tr').filter({ hasText: requesterName }).first();
  }

  /** Click approve button on a swap request */
  async approveSwapRequest(requesterName: string): Promise<void> {
    const row = this.getSwapRequestRow(requesterName);
    await row.locator('button').filter({ hasText: '' }).first().click(); // Green check button
    await this.page.waitForTimeout(200);
  }

  /** Click reject button on a swap request */
  async rejectSwapRequest(requesterName: string): Promise<void> {
    const row = this.getSwapRequestRow(requesterName);
    await row.locator('button').nth(-2).click(); // Red X button
    await this.page.waitForTimeout(200);
  }

  // ============================================================================
  // Actions - Roles
  // ============================================================================

  /** Get a role row by name */
  getRoleRow(roleName: string): Locator {
    return this.rolesTable.locator('tbody tr').filter({ hasText: roleName }).first();
  }

  // ============================================================================
  // Assertions - Main Dashboard
  // ============================================================================

  /** Assert main schedule page is visible */
  async expectSchedulePageVisible(): Promise<void> {
    await expect(this.scheduleHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert stats cards are visible */
  async expectStatsCardsVisible(): Promise<void> {
    await expect(this.thisWeekCard).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.unassignedCard).toBeVisible();
    await expect(this.templatesStatsCard).toBeVisible();
    await expect(this.hoursCard).toBeVisible();
  }

  /** Assert navigation cards are visible */
  async expectNavCardsVisible(): Promise<void> {
    await expect(this.allShiftsCard).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.weekViewCard).toBeVisible();
    await expect(this.staffAvailabilityCard).toBeVisible();
    await expect(this.swapRequestsCard).toBeVisible();
  }

  // ============================================================================
  // Assertions - Shifts Page
  // ============================================================================

  /** Assert shifts page is visible */
  async expectShiftsPageVisible(): Promise<void> {
    await expect(this.allShiftsHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert shift exists in table */
  async expectShiftInTable(searchText: string): Promise<void> {
    await expect(this.getShiftRow(searchText)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert shift does not exist in table */
  async expectShiftNotInTable(searchText: string): Promise<void> {
    await expect(this.getShiftRow(searchText)).not.toBeVisible({ timeout: TIMEOUTS.fast });
  }

  // ============================================================================
  // Assertions - Week View
  // ============================================================================

  /** Assert week view page is visible */
  async expectWeekViewPageVisible(): Promise<void> {
    await expect(this.weekViewHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Templates Page
  // ============================================================================

  /** Assert templates page is visible */
  async expectTemplatesPageVisible(): Promise<void> {
    await expect(this.templatesHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert template exists in table */
  async expectTemplateInTable(templateName: string): Promise<void> {
    await expect(this.getTemplateRow(templateName)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert template does not exist in table */
  async expectTemplateNotInTable(templateName: string): Promise<void> {
    await expect(this.getTemplateRow(templateName)).not.toBeVisible({ timeout: TIMEOUTS.fast });
  }

  // ============================================================================
  // Assertions - Availability Page
  // ============================================================================

  /** Assert availability page is visible */
  async expectAvailabilityPageVisible(): Promise<void> {
    await expect(this.availabilityHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Swap Requests Page
  // ============================================================================

  /** Assert swap requests page is visible */
  async expectSwapRequestsPageVisible(): Promise<void> {
    await expect(this.swapRequestsHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert swap request exists */
  async expectSwapRequestInTable(requesterName: string): Promise<void> {
    await expect(this.getSwapRequestRow(requesterName)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Roles Page
  // ============================================================================

  /** Assert roles page is visible */
  async expectRolesPageVisible(): Promise<void> {
    await expect(this.rolesHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert role exists in table */
  async expectRoleInTable(roleName: string): Promise<void> {
    await expect(this.getRoleRow(roleName)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert roles stats cards visible */
  async expectRolesStatsVisible(): Promise<void> {
    await expect(this.totalRolesCard).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.activeRolesCard).toBeVisible();
    await expect(this.inactiveRolesCard).toBeVisible();
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
 * Create a SchedulingPage instance
 */
export function createSchedulingPage(page: Page, orgSlug: string): SchedulingPage {
  return new SchedulingPage(page, orgSlug);
}
