import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { TEST_ORGS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Page Object for Organization management pages
 *
 * Covers:
 * - Create Organization page (/organizations/new)
 * - Organization Settings page (/:orgId/settings)
 * - Organization Switcher dropdown
 */
export class OrganizationsPage extends BasePage {
  // === Create Organization Page Locators ===
  readonly createOrgHeading: Locator;
  readonly nameInput: Locator;
  readonly slugInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly websiteInput: Locator;
  readonly timezoneSelect: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly backButton: Locator;
  readonly errorAlert: Locator;

  // === Settings Page Locators ===
  readonly settingsHeading: Locator;
  readonly settingsNameInput: Locator;
  readonly settingsSlugDisplay: Locator;
  readonly settingsEmailInput: Locator;
  readonly settingsPhoneInput: Locator;
  readonly settingsWebsiteInput: Locator;
  readonly settingsTimezoneInput: Locator;
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly addressCityInput: Locator;
  readonly addressStateInput: Locator;
  readonly addressPostalCodeInput: Locator;
  readonly addressCountryInput: Locator;
  readonly saveChangesButton: Locator;
  readonly successMessage: Locator;
  readonly settingsErrorMessage: Locator;

  // === Organization Switcher Locators ===
  readonly orgSwitcherTrigger: Locator;
  readonly orgSwitcherDropdown: Locator;
  readonly createOrgMenuItem: Locator;

  constructor(page: Page) {
    super(page);

    // Create Organization Page
    this.createOrgHeading = page.getByRole('heading', { name: 'Create Organization' });
    this.nameInput = page.locator('#name');
    this.slugInput = page.locator('#slug');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phone');
    this.websiteInput = page.locator('#website');
    this.timezoneSelect = page.locator('#timezone');
    this.createButton = page.getByRole('button', { name: 'Create Organization' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.backButton = page.getByRole('link', { name: 'Back' });
    this.errorAlert = page.locator('[role="alert"]');

    // Settings Page
    this.settingsHeading = page.getByRole('heading', { name: 'Organization Settings' });
    this.settingsNameInput = page.locator('input#name');
    this.settingsSlugDisplay = page.locator('input#slug');
    this.settingsEmailInput = page.locator('input#email');
    this.settingsPhoneInput = page.locator('input#phone');
    this.settingsWebsiteInput = page.locator('input#website');
    this.settingsTimezoneInput = page.locator('input#timezone');
    this.addressLine1Input = page.locator('input#address_line1');
    this.addressLine2Input = page.locator('input#address_line2');
    this.addressCityInput = page.locator('input#address_city');
    this.addressStateInput = page.locator('input#address_state');
    this.addressPostalCodeInput = page.locator('input#address_postal_code');
    this.addressCountryInput = page.locator('input#address_country');
    this.saveChangesButton = page.getByRole('button', { name: /save changes/i });
    this.successMessage = page.locator('[role="status"]');
    this.settingsErrorMessage = page.locator('[role="alert"]');

    // Organization Switcher (in sidebar)
    this.orgSwitcherTrigger = page.locator('button[aria-haspopup="listbox"]').first();
    this.orgSwitcherDropdown = page.locator('[role="menu"]');
    this.createOrgMenuItem = page.getByRole('menuitem', { name: /create organization/i });
  }

  // === Navigation Methods ===

  /**
   * Navigate to Create Organization page
   */
  async gotoCreateOrg(): Promise<void> {
    await this.page.goto('/organizations/new');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Organization Settings page
   */
  async gotoSettings(orgSlug: string): Promise<void> {
    await this.page.goto(`/${orgSlug}/settings`);
    await this.page.waitForLoadState('networkidle');
  }

  // === Create Organization Actions ===

  /**
   * Fill organization name (also auto-populates slug)
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Fill organization slug manually
   */
  async fillSlug(slug: string): Promise<void> {
    await this.slugInput.fill(slug);
  }

  /**
   * Fill contact email
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill phone number
   */
  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
  }

  /**
   * Fill website URL
   */
  async fillWebsite(website: string): Promise<void> {
    await this.websiteInput.fill(website);
  }

  /**
   * Select timezone
   */
  async selectTimezone(timezone: string): Promise<void> {
    await this.timezoneSelect.selectOption(timezone);
  }

  /**
   * Fill all organization details
   */
  async fillOrgDetails(details: {
    name: string;
    slug?: string;
    email?: string;
    phone?: string;
    website?: string;
    timezone?: string;
  }): Promise<void> {
    await this.fillName(details.name);
    if (details.slug) await this.fillSlug(details.slug);
    if (details.email) await this.fillEmail(details.email);
    if (details.phone) await this.fillPhone(details.phone);
    if (details.website) await this.fillWebsite(details.website);
    if (details.timezone) await this.selectTimezone(details.timezone);
  }

  /**
   * Submit the create organization form
   */
  async submitCreateForm(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * Create organization and wait for redirect
   */
  async createOrg(details: {
    name: string;
    slug?: string;
    email?: string;
    phone?: string;
    website?: string;
    timezone?: string;
  }): Promise<void> {
    await this.fillOrgDetails(details);
    await this.submitCreateForm();
    // Wait for redirect to new org dashboard
    await this.page.waitForURL((url) => !url.pathname.includes('/organizations/new'), {
      timeout: TIMEOUTS.long,
    });
  }

  // === Settings Page Actions ===

  /**
   * Update organization name in settings
   */
  async updateName(name: string): Promise<void> {
    await this.settingsNameInput.clear();
    await this.settingsNameInput.fill(name);
  }

  /**
   * Update contact email in settings
   */
  async updateEmail(email: string): Promise<void> {
    await this.settingsEmailInput.clear();
    await this.settingsEmailInput.fill(email);
  }

  /**
   * Update phone number in settings
   */
  async updatePhone(phone: string): Promise<void> {
    await this.settingsPhoneInput.clear();
    await this.settingsPhoneInput.fill(phone);
  }

  /**
   * Update website in settings
   */
  async updateWebsite(website: string): Promise<void> {
    await this.settingsWebsiteInput.clear();
    await this.settingsWebsiteInput.fill(website);
  }

  /**
   * Update timezone in settings
   */
  async updateTimezone(timezone: string): Promise<void> {
    await this.settingsTimezoneInput.clear();
    await this.settingsTimezoneInput.fill(timezone);
  }

  /**
   * Fill address fields
   */
  async fillAddress(address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }): Promise<void> {
    if (address.line1) await this.addressLine1Input.fill(address.line1);
    if (address.line2) await this.addressLine2Input.fill(address.line2);
    if (address.city) await this.addressCityInput.fill(address.city);
    if (address.state) await this.addressStateInput.fill(address.state);
    if (address.postalCode) await this.addressPostalCodeInput.fill(address.postalCode);
    if (address.country) await this.addressCountryInput.fill(address.country);
  }

  /**
   * Save settings changes
   */
  async saveSettings(): Promise<void> {
    await this.saveChangesButton.click();
  }

  // === Organization Switcher Actions ===

  /**
   * Open the organization switcher dropdown
   */
  async openOrgSwitcher(): Promise<void> {
    await this.orgSwitcherTrigger.click();
    await this.orgSwitcherDropdown.waitFor({ state: 'visible' });
  }

  /**
   * Switch to a different organization
   */
  async switchToOrg(orgName: string): Promise<void> {
    await this.openOrgSwitcher();
    await this.page.getByRole('menuitem', { name: orgName }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get list of organizations in the switcher
   */
  async getOrgList(): Promise<string[]> {
    await this.openOrgSwitcher();
    const items = this.orgSwitcherDropdown.locator('[role="menuitem"]');
    const count = await items.count();
    const orgs: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text && !text.toLowerCase().includes('create')) {
        orgs.push(text.trim());
      }
    }

    // Close the dropdown
    await this.page.keyboard.press('Escape');
    return orgs;
  }

  /**
   * Click "Create Organization" from the switcher
   */
  async clickCreateOrgFromSwitcher(): Promise<void> {
    await this.openOrgSwitcher();
    await this.createOrgMenuItem.click();
    await this.page.waitForURL('**/organizations/new');
  }

  /**
   * Get current organization name from the switcher
   */
  async getCurrentOrgName(): Promise<string> {
    const text = await this.orgSwitcherTrigger.textContent();
    return text?.trim() || '';
  }

  // === Assertion Methods ===

  /**
   * Verify the create organization page is displayed
   */
  async expectCreateOrgPage(): Promise<void> {
    await expect(this.createOrgHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.nameInput).toBeVisible();
    await expect(this.slugInput).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  /**
   * Verify the settings page is displayed
   */
  async expectSettingsPage(): Promise<void> {
    await expect(this.settingsHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.settingsNameInput).toBeVisible();
    await expect(this.saveChangesButton).toBeVisible();
  }

  /**
   * Verify success message is shown
   */
  async expectSuccessMessage(message?: string): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: TIMEOUTS.standard });
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  /**
   * Verify error is shown
   */
  async expectError(message?: string): Promise<void> {
    await expect(this.errorAlert.or(this.settingsErrorMessage)).toBeVisible({ timeout: TIMEOUTS.standard });
    if (message) {
      await expect(this.errorAlert.or(this.settingsErrorMessage)).toContainText(message);
    }
  }

  /**
   * Verify current organization in switcher
   */
  async expectCurrentOrg(orgName: string): Promise<void> {
    await expect(this.orgSwitcherTrigger).toContainText(orgName, { timeout: TIMEOUTS.standard });
  }

  /**
   * Verify create button is disabled
   */
  async expectCreateButtonDisabled(): Promise<void> {
    await expect(this.createButton).toBeDisabled();
  }

  /**
   * Verify create button is enabled
   */
  async expectCreateButtonEnabled(): Promise<void> {
    await expect(this.createButton).toBeEnabled();
  }

  /**
   * Verify slug field is disabled in settings (read-only)
   */
  async expectSlugReadOnly(): Promise<void> {
    await expect(this.settingsSlugDisplay).toBeDisabled();
  }

  /**
   * Verify organization name in settings
   */
  async expectOrgName(name: string): Promise<void> {
    await expect(this.settingsNameInput).toHaveValue(name);
  }

  /**
   * Verify slug value in settings
   */
  async expectOrgSlug(slug: string): Promise<void> {
    await expect(this.settingsSlugDisplay).toHaveValue(slug);
  }
}

/**
 * Factory function to create an OrganizationsPage instance
 */
export function createOrganizationsPage(page: Page): OrganizationsPage {
  return new OrganizationsPage(page);
}
