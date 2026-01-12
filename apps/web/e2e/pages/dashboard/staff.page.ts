import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../helpers/fixtures';

/**
 * Staff Management Page Object
 *
 * Encapsulates interactions with staff management pages including:
 * - Staff list/roster view
 * - Inviting new staff members
 * - Staff profile detail view
 * - Editing staff information
 * - Skills and certifications management
 */
export class StaffPage extends BasePage {
  private readonly orgSlug: string;

  constructor(page: Page, orgSlug: string) {
    super(page);
    this.orgSlug = orgSlug;
  }

  // ============================================================================
  // Locators - Staff List Page
  // ============================================================================

  /** Staff list page heading */
  get staffHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Staff', level: 1 }).first();
  }

  /** Add Staff button */
  get addStaffButton(): Locator {
    return this.page.getByRole('link', { name: /add staff/i }).first();
  }

  /** Staff table */
  get staffTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Staff rows in table */
  get staffRows(): Locator {
    return this.staffTable.locator('tbody tr');
  }

  /** Empty state for staff list */
  get staffEmptyState(): Locator {
    return this.page.getByText(/no staff members yet/i).first();
  }

  // ============================================================================
  // Locators - Invite Staff Page
  // ============================================================================

  /** Invite staff page heading */
  get inviteStaffHeading(): Locator {
    return this.page.getByRole('heading', { name: /invite staff member/i, level: 1 }).first();
  }

  /** Email input for invitation */
  get inviteEmailInput(): Locator {
    return this.page.locator('#email, [name="email"]').first();
  }

  /** Role select for invitation */
  get inviteRoleSelect(): Locator {
    return this.page.locator('button[role="combobox"]').first();
  }

  /** Cancel button on invite form */
  get inviteCancelButton(): Locator {
    return this.page.getByRole('button', { name: /cancel/i }).first();
  }

  /** Send Invitation button */
  get sendInvitationButton(): Locator {
    return this.page.getByRole('button', { name: /send invitation/i }).first();
  }

  /** Invitation success message */
  get inviteSuccessMessage(): Locator {
    return this.page.locator('[role="status"]').filter({ hasText: /invitation sent/i }).first();
  }

  /** Invitation error message */
  get inviteErrorMessage(): Locator {
    return this.page.locator('[role="alert"]').first();
  }

  // ============================================================================
  // Locators - Staff Detail Page
  // ============================================================================

  /** Staff name heading on detail page */
  get staffNameHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  /** Staff status badge */
  get staffStatusBadge(): Locator {
    return this.page.locator('[class*="badge"]').first();
  }

  /** Staff email display */
  get staffEmail(): Locator {
    return this.page.locator('p.text-muted-foreground').first();
  }

  /** Edit button on detail page */
  get editButton(): Locator {
    return this.page.getByRole('link', { name: /edit/i }).first();
  }

  /** Overview tab */
  get overviewTab(): Locator {
    return this.page.getByRole('tab', { name: /overview/i }).first();
  }

  /** Skills tab */
  get skillsTab(): Locator {
    return this.page.getByRole('tab', { name: /skills/i }).first();
  }

  /** Certifications tab */
  get certificationsTab(): Locator {
    return this.page.getByRole('tab', { name: /certifications/i }).first();
  }

  /** Time Tracking tab */
  get timeTrackingTab(): Locator {
    return this.page.getByRole('tab', { name: /time tracking/i }).first();
  }

  /** Role card on overview */
  get roleCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Role' }).first();
  }

  /** Hire Date card on overview */
  get hireDateCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Hire Date' }).first();
  }

  /** Employment card on overview */
  get employmentCard(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'Employment' }).first();
  }

  /** Manage Skills button */
  get manageSkillsButton(): Locator {
    return this.page.getByRole('link', { name: /manage skills/i }).first();
  }

  /** Manage Certifications button */
  get manageCertificationsButton(): Locator {
    return this.page.getByRole('link', { name: /manage certifications/i }).first();
  }

  /** View All Time button */
  get viewAllTimeButton(): Locator {
    return this.page.getByRole('link', { name: /view all time/i }).first();
  }

  // ============================================================================
  // Locators - Edit Staff Page
  // ============================================================================

  /** Edit staff page heading */
  get editStaffHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit staff profile/i, level: 1 }).first();
  }

  /** Employee ID input */
  get employeeIdInput(): Locator {
    return this.page.locator('#employee_id, [name="employee_id"]').first();
  }

  /** Status select */
  get statusSelect(): Locator {
    return this.page.locator('[name="status"]').locator('..').locator('button[role="combobox"]').first();
  }

  /** Employment Type select */
  get employmentTypeSelect(): Locator {
    return this.page.locator('[name="employment_type"]').locator('..').locator('button[role="combobox"]').first();
  }

  /** Hourly Rate input */
  get hourlyRateInput(): Locator {
    return this.page.locator('#hourly_rate, [name="hourly_rate"]').first();
  }

  /** Shirt Size select */
  get shirtSizeSelect(): Locator {
    return this.page.locator('[name="shirt_size"]').locator('..').locator('button[role="combobox"]').first();
  }

  /** Emergency Contact Name input */
  get emergencyNameInput(): Locator {
    return this.page.locator('#emergency_name, [name="emergency_name"]').first();
  }

  /** Emergency Contact Phone input */
  get emergencyPhoneInput(): Locator {
    return this.page.locator('#emergency_phone, [name="emergency_phone"]').first();
  }

  /** Emergency Contact Relationship input */
  get emergencyRelationInput(): Locator {
    return this.page.locator('#emergency_relation, [name="emergency_relation"]').first();
  }

  /** Notes textarea */
  get notesInput(): Locator {
    return this.page.locator('#notes, [name="notes"]').first();
  }

  /** Cancel button on edit form */
  get editCancelButton(): Locator {
    return this.page.getByRole('button', { name: /cancel/i }).first();
  }

  /** Save Changes button */
  get saveChangesButton(): Locator {
    return this.page.getByRole('button', { name: /save changes/i }).first();
  }

  /** Edit success message */
  get editSuccessMessage(): Locator {
    return this.page.locator('[role="status"]').filter({ hasText: /updated successfully/i }).first();
  }

  /** Edit error message */
  get editErrorMessage(): Locator {
    return this.page.locator('[role="alert"]').first();
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /** Navigate to the staff list page */
  override async goto(): Promise<void> {
    await super.goto(`/${this.orgSlug}/staff`);
  }

  /** Navigate to invite staff page */
  async gotoInvite(): Promise<void> {
    await super.goto(`/${this.orgSlug}/staff/new`);
  }

  /** Navigate to staff detail page */
  async gotoStaffDetail(staffId: string): Promise<void> {
    await super.goto(`/${this.orgSlug}/staff/${staffId}`);
  }

  /** Navigate to edit staff page */
  async gotoEditStaff(staffId: string): Promise<void> {
    await super.goto(`/${this.orgSlug}/staff/${staffId}/edit`);
  }

  /** Navigate to staff skills page */
  async gotoStaffSkills(staffId: string): Promise<void> {
    await super.goto(`/${this.orgSlug}/staff/${staffId}/skills`);
  }

  /** Navigate to staff certifications page */
  async gotoStaffCertifications(staffId: string): Promise<void> {
    await super.goto(`/${this.orgSlug}/staff/${staffId}/certifications`);
  }

  /** Navigate to staff time page */
  async gotoStaffTime(staffId: string): Promise<void> {
    await super.goto(`/${this.orgSlug}/staff/${staffId}/time`);
  }

  // ============================================================================
  // Actions - Staff List
  // ============================================================================

  /** Get a staff row by name or email */
  getStaffRow(searchText: string): Locator {
    return this.staffTable.locator('tbody tr').filter({ hasText: searchText }).first();
  }

  /** Click on a staff member to view their profile */
  async clickStaffMember(searchText: string): Promise<void> {
    const row = this.getStaffRow(searchText);
    await row.locator('a').first().click();
    await this.waitForPageLoad();
  }

  /** Open staff member actions menu */
  async openStaffActions(searchText: string): Promise<void> {
    const row = this.getStaffRow(searchText);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
  }

  /** Click View Profile from actions menu */
  async viewStaffProfile(searchText: string): Promise<void> {
    await this.openStaffActions(searchText);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /view profile/i }).click();
    await this.waitForPageLoad();
  }

  /** Click Time Tracking from actions menu */
  async viewStaffTimeTracking(searchText: string): Promise<void> {
    await this.openStaffActions(searchText);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /time tracking/i }).click();
    await this.waitForPageLoad();
  }

  /** Click Manage Skills from actions menu */
  async manageStaffSkills(searchText: string): Promise<void> {
    await this.openStaffActions(searchText);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /manage skills/i }).click();
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Actions - Invite Staff
  // ============================================================================

  /** Fill the invite staff form */
  async fillInviteForm(data: {
    email: string;
    role: 'manager' | 'hr' | 'box_office' | 'finance' | 'actor' | 'scanner';
  }): Promise<void> {
    await this.inviteEmailInput.fill(data.email);

    await this.inviteRoleSelect.click();
    await this.page.waitForTimeout(200);
    await this.page.getByRole('option', { name: new RegExp(data.role.replace('_', ' '), 'i') }).click();
  }

  /** Submit the invite form */
  async submitInvite(): Promise<void> {
    await this.sendInvitationButton.click();
    // Wait for either success or error message
    await this.page.waitForSelector('[role="status"], [role="alert"]', { timeout: TIMEOUTS.standard });
  }

  /** Invite a new staff member */
  async inviteStaff(data: {
    email: string;
    role: 'manager' | 'hr' | 'box_office' | 'finance' | 'actor' | 'scanner';
  }): Promise<void> {
    await this.fillInviteForm(data);
    await this.submitInvite();
  }

  // ============================================================================
  // Actions - Staff Detail
  // ============================================================================

  /** Switch to Overview tab */
  async switchToOverviewTab(): Promise<void> {
    await this.overviewTab.click();
    await this.page.waitForTimeout(200);
  }

  /** Switch to Skills tab */
  async switchToSkillsTab(): Promise<void> {
    await this.skillsTab.click();
    await this.page.waitForTimeout(200);
  }

  /** Switch to Certifications tab */
  async switchToCertificationsTab(): Promise<void> {
    await this.certificationsTab.click();
    await this.page.waitForTimeout(200);
  }

  /** Switch to Time Tracking tab */
  async switchToTimeTrackingTab(): Promise<void> {
    await this.timeTrackingTab.click();
    await this.page.waitForTimeout(200);
  }

  /** Click the Edit button */
  async clickEdit(): Promise<void> {
    await this.editButton.click();
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Actions - Edit Staff
  // ============================================================================

  /** Fill the edit staff form */
  async fillEditForm(data: {
    employeeId?: string;
    status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
    employmentType?: 'full_time' | 'part_time' | 'seasonal' | 'contractor';
    hourlyRate?: string;
    shirtSize?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
    notes?: string;
  }): Promise<void> {
    if (data.employeeId !== undefined) {
      await this.employeeIdInput.clear();
      await this.employeeIdInput.fill(data.employeeId);
    }

    if (data.status) {
      // Find status select by looking for the select with status options
      const statusTrigger = this.page.locator('button[role="combobox"]').filter({ hasText: /active|inactive|on leave|terminated/i }).first();
      await statusTrigger.click();
      await this.page.waitForTimeout(200);
      await this.page.getByRole('option', { name: new RegExp(data.status.replace('_', ' '), 'i') }).click();
    }

    if (data.employmentType) {
      const employmentTrigger = this.page.locator('button[role="combobox"]').filter({ hasText: /full time|part time|seasonal|contractor/i }).first();
      await employmentTrigger.click();
      await this.page.waitForTimeout(200);
      await this.page.getByRole('option', { name: new RegExp(data.employmentType.replace('_', ' '), 'i') }).click();
    }

    if (data.hourlyRate !== undefined) {
      await this.hourlyRateInput.clear();
      await this.hourlyRateInput.fill(data.hourlyRate);
    }

    if (data.shirtSize) {
      const shirtTrigger = this.page.locator('button[role="combobox"]').filter({ hasText: /select size|XS|S|M|L|XL|2XL|3XL/i }).first();
      await shirtTrigger.click();
      await this.page.waitForTimeout(200);
      await this.page.getByRole('option', { name: data.shirtSize, exact: true }).click();
    }

    if (data.emergencyName !== undefined) {
      await this.emergencyNameInput.clear();
      await this.emergencyNameInput.fill(data.emergencyName);
    }

    if (data.emergencyPhone !== undefined) {
      await this.emergencyPhoneInput.clear();
      await this.emergencyPhoneInput.fill(data.emergencyPhone);
    }

    if (data.emergencyRelation !== undefined) {
      await this.emergencyRelationInput.clear();
      await this.emergencyRelationInput.fill(data.emergencyRelation);
    }

    if (data.notes !== undefined) {
      await this.notesInput.clear();
      await this.notesInput.fill(data.notes);
    }
  }

  /** Submit the edit form */
  async submitEdit(): Promise<void> {
    await this.saveChangesButton.click();
    // Wait for either success message or error
    await this.page.waitForSelector('[role="status"], [role="alert"]', { timeout: TIMEOUTS.standard });
  }

  /** Update staff member info */
  async updateStaff(data: {
    employeeId?: string;
    status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
    employmentType?: 'full_time' | 'part_time' | 'seasonal' | 'contractor';
    hourlyRate?: string;
    notes?: string;
  }): Promise<void> {
    await this.fillEditForm(data);
    await this.submitEdit();
  }

  // ============================================================================
  // Assertions - Staff List
  // ============================================================================

  /** Assert staff list page is visible */
  async expectStaffListPageVisible(): Promise<void> {
    await expect(this.staffHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert staff member exists in list */
  async expectStaffInList(searchText: string): Promise<void> {
    await expect(this.getStaffRow(searchText)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert staff member not in list */
  async expectStaffNotInList(searchText: string): Promise<void> {
    await expect(this.getStaffRow(searchText)).not.toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /** Assert staff list is empty */
  async expectStaffListEmpty(): Promise<void> {
    await expect(this.staffEmptyState).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert staff member has specific role */
  async expectStaffRole(searchText: string, role: string): Promise<void> {
    const row = this.getStaffRow(searchText);
    await expect(row.getByText(new RegExp(role, 'i'))).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert staff member has specific status */
  async expectStaffStatus(searchText: string, status: 'active' | 'inactive'): Promise<void> {
    const row = this.getStaffRow(searchText);
    await expect(row.locator('[class*="badge"]').filter({ hasText: new RegExp(status, 'i') })).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Invite Staff
  // ============================================================================

  /** Assert invite page is visible */
  async expectInvitePageVisible(): Promise<void> {
    await expect(this.inviteStaffHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.inviteEmailInput).toBeVisible();
  }

  /** Assert invitation was sent successfully */
  async expectInvitationSuccess(): Promise<void> {
    await expect(this.inviteSuccessMessage).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert invitation failed */
  async expectInvitationError(): Promise<void> {
    await expect(this.inviteErrorMessage).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Staff Detail
  // ============================================================================

  /** Assert staff detail page is visible */
  async expectStaffDetailPageVisible(): Promise<void> {
    await expect(this.staffNameHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.overviewTab).toBeVisible();
  }

  /** Assert staff name is displayed */
  async expectStaffName(name: string): Promise<void> {
    await expect(this.staffNameHeading.filter({ hasText: name })).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert staff detail shows specific status */
  async expectDetailStatus(status: string): Promise<void> {
    await expect(this.staffStatusBadge.filter({ hasText: new RegExp(status, 'i') })).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert tab is selected */
  async expectTabSelected(tab: 'overview' | 'skills' | 'certifications' | 'time'): Promise<void> {
    const tabLocator = tab === 'overview' ? this.overviewTab :
                       tab === 'skills' ? this.skillsTab :
                       tab === 'certifications' ? this.certificationsTab :
                       this.timeTrackingTab;
    await expect(tabLocator).toHaveAttribute('data-state', 'active', { timeout: TIMEOUTS.standard });
  }

  /** Assert overview cards are visible */
  async expectOverviewCardsVisible(): Promise<void> {
    await expect(this.roleCard).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.hireDateCard).toBeVisible();
    await expect(this.employmentCard).toBeVisible();
  }

  // ============================================================================
  // Assertions - Edit Staff
  // ============================================================================

  /** Assert edit page is visible */
  async expectEditPageVisible(): Promise<void> {
    await expect(this.editStaffHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.employeeIdInput).toBeVisible();
  }

  /** Assert edit was successful */
  async expectEditSuccess(): Promise<void> {
    await expect(this.editSuccessMessage).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert edit failed */
  async expectEditError(): Promise<void> {
    await expect(this.editErrorMessage).toBeVisible({ timeout: TIMEOUTS.standard });
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
 * Create a StaffPage instance
 */
export function createStaffPage(page: Page, orgSlug: string): StaffPage {
  return new StaffPage(page, orgSlug);
}
