import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../helpers/fixtures';

/**
 * Ticketing Dashboard Page Object
 *
 * Encapsulates interactions with ticketing management pages including:
 * - Main ticketing overview
 * - Ticket types management
 * - Orders management
 * - Promo codes management
 */
export class TicketingPage extends BasePage {
  private readonly orgSlug: string;

  constructor(page: Page, orgSlug: string) {
    super(page);
    this.orgSlug = orgSlug;
  }

  // ============================================================================
  // Locators - Main Ticketing Page
  // ============================================================================

  /** Main ticketing page heading */
  get ticketingHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Ticketing', level: 1 }).first();
  }

  /** Navigation card to Ticket Types */
  get ticketTypesCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Ticket Types' }).first();
  }

  /** Navigation card to Time Slots */
  get timeSlotsCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Time Slots' }).first();
  }

  /** Navigation card to Orders */
  get ordersCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Orders' }).first();
  }

  /** Navigation card to Promo Codes */
  get promoCodesCard(): Locator {
    return this.page.locator('a').filter({ hasText: 'Promo Codes' }).first();
  }

  // ============================================================================
  // Locators - Ticket Types Page
  // ============================================================================

  /** Ticket types page heading */
  get ticketTypesHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Ticket Types', level: 1 }).first();
  }

  /** Add Ticket Type button */
  get addTicketTypeButton(): Locator {
    return this.page.getByRole('button', { name: /add ticket type/i }).first();
  }

  /** Ticket types table */
  get ticketTypesTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Ticket type rows in table */
  get ticketTypeRows(): Locator {
    return this.ticketTypesTable.locator('tbody tr');
  }

  /** Empty state for ticket types */
  get ticketTypesEmptyState(): Locator {
    return this.page.getByText('No ticket types configured yet').first();
  }

  /** Create your first ticket type button (empty state) */
  get createFirstTicketTypeButton(): Locator {
    return this.page.getByRole('button', { name: /create your first ticket type/i }).first();
  }

  // ============================================================================
  // Locators - Ticket Type Dialog
  // ============================================================================

  /** Ticket type dialog */
  get ticketTypeDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  /** Ticket type name input */
  get ticketTypeNameInput(): Locator {
    return this.page.locator('#name').first();
  }

  /** Ticket type description textarea */
  get ticketTypeDescriptionInput(): Locator {
    return this.page.locator('#description').first();
  }

  /** Ticket type price input */
  get ticketTypePriceInput(): Locator {
    return this.page.locator('#price').first();
  }

  /** Ticket type compare price input */
  get ticketTypeComparePriceInput(): Locator {
    return this.page.locator('#comparePrice').first();
  }

  /** Ticket type attraction select trigger */
  get ticketTypeAttractionSelect(): Locator {
    return this.ticketTypeDialog.locator('button[role="combobox"]').first();
  }

  /** Ticket type capacity input */
  get ticketTypeCapacityInput(): Locator {
    return this.page.locator('#capacity').first();
  }

  /** Ticket type min per order input */
  get ticketTypeMinPerOrderInput(): Locator {
    return this.page.locator('#minPerOrder').first();
  }

  /** Ticket type max per order input */
  get ticketTypeMaxPerOrderInput(): Locator {
    return this.page.locator('#maxPerOrder').first();
  }

  /** Ticket type includes textarea */
  get ticketTypeIncludesInput(): Locator {
    return this.page.locator('#includes').first();
  }

  /** Create/Save ticket type button in dialog */
  get ticketTypeSaveButton(): Locator {
    return this.ticketTypeDialog.getByRole('button', { name: /create|save changes/i }).first();
  }

  /** Cancel button in ticket type dialog */
  get ticketTypeCancelButton(): Locator {
    return this.ticketTypeDialog.getByRole('button', { name: /cancel/i }).first();
  }

  // ============================================================================
  // Locators - Orders Page
  // ============================================================================

  /** Orders page heading */
  get ordersHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Orders', level: 1 }).first();
  }

  /** Orders search input */
  get ordersSearchInput(): Locator {
    return this.page.getByPlaceholder(/search by customer email/i).first();
  }

  /** Orders status filter select */
  get ordersStatusFilter(): Locator {
    return this.page.locator('button[role="combobox"]').filter({ hasText: /all statuses|pending|completed/i }).first();
  }

  /** Orders search button */
  get ordersSearchButton(): Locator {
    return this.page.getByRole('button', { name: /search/i }).first();
  }

  /** Orders table */
  get ordersTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Order rows in table */
  get orderRows(): Locator {
    return this.ordersTable.locator('tbody tr');
  }

  /** Orders empty state */
  get ordersEmptyState(): Locator {
    return this.page.getByText('No orders found').first();
  }

  /** Orders pagination info */
  get ordersPaginationInfo(): Locator {
    return this.page.getByText(/page \d+ of \d+/i).first();
  }

  /** Previous page button */
  get ordersPreviousButton(): Locator {
    return this.page.getByRole('button', { name: /previous/i }).first();
  }

  /** Next page button */
  get ordersNextButton(): Locator {
    return this.page.getByRole('button', { name: /next/i }).first();
  }

  // ============================================================================
  // Locators - Order Details Dialog
  // ============================================================================

  /** Order details dialog */
  get orderDetailsDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  /** Order details customer email */
  get orderDetailsCustomerEmail(): Locator {
    return this.orderDetailsDialog.locator('text=/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/').first();
  }

  /** Order details status badge */
  get orderDetailsStatus(): Locator {
    return this.orderDetailsDialog.locator('[class*="badge"]').first();
  }

  /** Order details items table */
  get orderDetailsItemsTable(): Locator {
    return this.orderDetailsDialog.locator('table').first();
  }

  /** Order details total */
  get orderDetailsTotal(): Locator {
    return this.orderDetailsDialog.getByText(/total/i).locator('..').locator('span').last();
  }

  // ============================================================================
  // Locators - Promo Codes Page
  // ============================================================================

  /** Promo codes page heading */
  get promoCodesHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Promo Codes', level: 1 }).first();
  }

  /** Create promo code button */
  get createPromoCodeButton(): Locator {
    return this.page.getByRole('button', { name: /create promo code/i }).first();
  }

  /** Promo codes table */
  get promoCodesTable(): Locator {
    return this.page.locator('table').first();
  }

  /** Promo code rows in table */
  get promoCodeRows(): Locator {
    return this.promoCodesTable.locator('tbody tr');
  }

  /** Promo codes empty state */
  get promoCodesEmptyState(): Locator {
    return this.page.getByText('No promo codes created yet').first();
  }

  /** Create your first promo code button (empty state) */
  get createFirstPromoCodeButton(): Locator {
    return this.page.getByRole('button', { name: /create your first promo code/i }).first();
  }

  // ============================================================================
  // Locators - Promo Code Dialog
  // ============================================================================

  /** Promo code dialog */
  get promoCodeDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  /** Promo code input */
  get promoCodeInput(): Locator {
    return this.page.locator('#code').first();
  }

  /** Promo code description textarea */
  get promoCodeDescriptionInput(): Locator {
    return this.page.locator('#description').first();
  }

  /** Promo code discount value input */
  get promoCodeDiscountValueInput(): Locator {
    return this.page.locator('#discountValue').first();
  }

  /** Generate promo code button */
  get generatePromoCodeButton(): Locator {
    return this.promoCodeDialog.getByRole('button', { name: /generate/i }).first();
  }

  /** Promo code discount type select */
  get promoCodeDiscountTypeSelect(): Locator {
    return this.promoCodeDialog.locator('button[role="combobox"]').first();
  }

  /** Promo code min order amount input */
  get promoCodeMinOrderInput(): Locator {
    return this.page.locator('#minOrderAmount').first();
  }

  /** Promo code max discount input */
  get promoCodeMaxDiscountInput(): Locator {
    return this.page.locator('#maxDiscount').first();
  }

  /** Promo code max uses input */
  get promoCodeMaxUsesInput(): Locator {
    return this.page.locator('#maxUses').first();
  }

  /** Promo code valid from input */
  get promoCodeValidFromInput(): Locator {
    return this.page.locator('#validFrom').first();
  }

  /** Promo code valid until input */
  get promoCodeValidUntilInput(): Locator {
    return this.page.locator('#validUntil').first();
  }

  /** Create/Save promo code button in dialog */
  get promoCodeSaveButton(): Locator {
    return this.promoCodeDialog.getByRole('button', { name: /create|save changes/i }).first();
  }

  /** Cancel button in promo code dialog */
  get promoCodeCancelButton(): Locator {
    return this.promoCodeDialog.getByRole('button', { name: /cancel/i }).first();
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /** Navigate to the main ticketing page */
  override async goto(): Promise<void> {
    await super.goto(`/${this.orgSlug}/ticketing`);
  }

  /** Navigate to ticket types page */
  async gotoTicketTypes(): Promise<void> {
    await super.goto(`/${this.orgSlug}/ticketing/types`);
  }

  /** Navigate to orders page */
  async gotoOrders(): Promise<void> {
    await super.goto(`/${this.orgSlug}/ticketing/orders`);
  }

  /** Navigate to promo codes page */
  async gotoPromoCodes(): Promise<void> {
    await super.goto(`/${this.orgSlug}/ticketing/promo-codes`);
  }

  // ============================================================================
  // Actions - Ticket Types
  // ============================================================================

  /** Get a ticket type row by name */
  getTicketTypeRow(name: string): Locator {
    return this.ticketTypesTable.locator('tbody tr').filter({ hasText: name }).first();
  }

  /** Open the create ticket type dialog */
  async openCreateTicketTypeDialog(): Promise<void> {
    // Wait for page to fully load (attractions must load for form to work)
    await this.waitForPageLoad();

    // Wait for the page heading to be visible (ensures we're past the loading skeleton)
    await expect(this.ticketTypesHeading).toBeVisible({ timeout: TIMEOUTS.standard });

    // Check if there are existing ticket types
    const addButton = this.addTicketTypeButton;
    const createFirstButton = this.createFirstTicketTypeButton;

    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();
    } else if (await createFirstButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createFirstButton.click();
    }

    await expect(this.ticketTypeDialog).toBeVisible({ timeout: TIMEOUTS.fast });

    // Wait for attraction dropdown to be populated (required for form submission)
    await expect(this.ticketTypeAttractionSelect).toBeVisible({ timeout: TIMEOUTS.fast });

    // Wait for form to be fully initialized (attractions need to load)
    await this.page.waitForTimeout(300);
  }

  /** Fill the ticket type form */
  async fillTicketTypeForm(data: {
    name: string;
    description?: string;
    price: string;
    comparePrice?: string;
    capacity?: string;
    minPerOrder?: string;
    maxPerOrder?: string;
    includes?: string;
  }): Promise<void> {
    // Ensure attraction is selected (required for form submission)
    // The shadcn/ui Select uses Radix which renders in a portal
    const attractionSelect = this.ticketTypeAttractionSelect;

    // Get current select text to see if an attraction is already selected
    const currentText = await attractionSelect.textContent();

    // If showing placeholder, we need to select an attraction
    if (!currentText || currentText.includes('Select attraction') || currentText.trim() === '') {
      // Click to open the dropdown
      await attractionSelect.click();

      // Wait for SelectContent to appear (rendered in a portal with data-radix-popper-content-wrapper)
      const selectContent = this.page.locator('[data-radix-select-viewport]');
      await selectContent.waitFor({ state: 'visible', timeout: TIMEOUTS.fast }).catch(() => {});

      // Look for options - Radix uses role="option" for SelectItem
      const options = this.page.locator('[role="option"]');
      const optionCount = await options.count();

      if (optionCount > 0) {
        // Click the first option
        await options.first().click();

        // Wait for dropdown to close and selection to be reflected
        await this.page.waitForTimeout(300);
      } else {
        // No options available - click elsewhere to close dropdown (NOT Escape which closes dialog)
        await this.page.locator('[role="dialog"] h2').first().click();
        await this.page.waitForTimeout(200);
      }
    }

    // Now fill in the form fields
    await this.ticketTypeNameInput.fill(data.name);

    if (data.description) {
      await this.ticketTypeDescriptionInput.fill(data.description);
    }

    await this.ticketTypePriceInput.fill(data.price);

    if (data.comparePrice) {
      await this.ticketTypeComparePriceInput.fill(data.comparePrice);
    }

    if (data.capacity) {
      await this.ticketTypeCapacityInput.fill(data.capacity);
    }

    if (data.minPerOrder) {
      await this.ticketTypeMinPerOrderInput.fill(data.minPerOrder);
    }

    if (data.maxPerOrder) {
      await this.ticketTypeMaxPerOrderInput.fill(data.maxPerOrder);
    }

    if (data.includes) {
      await this.ticketTypeIncludesInput.fill(data.includes);
    }
  }

  /** Save the ticket type (create or update) */
  async saveTicketType(): Promise<void> {
    // Wait for save response (POST for create, PATCH for update)
    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes('/ticket-types') && (res.request().method() === 'POST' || res.request().method() === 'PATCH'),
      { timeout: 10000 }
    ).catch(() => null);

    // Ensure save button is enabled before clicking
    await expect(this.ticketTypeSaveButton).toBeEnabled({ timeout: TIMEOUTS.fast });
    await this.ticketTypeSaveButton.click();

    // Wait for the API response
    await responsePromise;

    // Wait for dialog to close (indicates save completed)
    await expect(this.ticketTypeDialog).not.toBeVisible({ timeout: TIMEOUTS.standard });

    // Wait for network to settle after save
    await this.page.waitForLoadState('networkidle');
  }

  /** Create a new ticket type */
  async createTicketType(data: {
    name: string;
    description?: string;
    price: string;
    comparePrice?: string;
    capacity?: string;
  }): Promise<void> {
    await this.openCreateTicketTypeDialog();
    await this.fillTicketTypeForm(data);
    await this.saveTicketType();
  }

  /** Open the edit dialog for a ticket type */
  async openEditTicketTypeDialog(name: string): Promise<void> {
    const row = this.getTicketTypeRow(name);
    await row.locator('button').last().click(); // More actions button
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /edit/i }).click();
    await expect(this.ticketTypeDialog).toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /** Toggle ticket type active status */
  async toggleTicketTypeStatus(name: string): Promise<void> {
    const row = this.getTicketTypeRow(name);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /activate|deactivate/i }).click();
    await this.waitForPageLoad();
  }

  /** Delete a ticket type */
  async deleteTicketType(name: string): Promise<void> {
    const row = this.getTicketTypeRow(name);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /delete/i }).click();

    // Handle confirmation dialog
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Actions - Orders
  // ============================================================================

  /** Get an order row by order number */
  getOrderRow(orderNumber: string): Locator {
    return this.ordersTable.locator('tbody tr').filter({ hasText: orderNumber }).first();
  }

  /** Search orders by email */
  async searchOrders(email: string): Promise<void> {
    await this.ordersSearchInput.fill(email);
    await this.ordersSearchButton.click();
    await this.waitForPageLoad();
  }

  /** Filter orders by status */
  async filterOrdersByStatus(status: 'all' | 'pending' | 'processing' | 'completed' | 'canceled' | 'refunded'): Promise<void> {
    await this.ordersStatusFilter.click();
    await this.page.waitForTimeout(200);
    const statusText = status === 'all' ? 'All statuses' : status;
    await this.page.getByRole('option', { name: new RegExp(statusText, 'i') }).click();
    await this.ordersSearchButton.click();
    await this.waitForPageLoad();
  }

  /** View order details */
  async viewOrderDetails(orderNumber: string): Promise<void> {
    const row = this.getOrderRow(orderNumber);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /view details/i }).click();
    await expect(this.orderDetailsDialog).toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /** Complete an order */
  async completeOrder(orderNumber: string): Promise<void> {
    const row = this.getOrderRow(orderNumber);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /complete order/i }).click();
    await this.waitForPageLoad();
  }

  /** Cancel an order */
  async cancelOrder(orderNumber: string): Promise<void> {
    const row = this.getOrderRow(orderNumber);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /cancel/i }).click();

    // Handle confirmation dialog
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.waitForPageLoad();
  }

  /** Refund an order */
  async refundOrder(orderNumber: string): Promise<void> {
    const row = this.getOrderRow(orderNumber);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /refund/i }).click();

    // Handle confirmation dialog
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.waitForPageLoad();
  }

  /** Close order details dialog */
  async closeOrderDetails(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.orderDetailsDialog).not.toBeVisible({ timeout: TIMEOUTS.fast });
  }

  // ============================================================================
  // Actions - Promo Codes
  // ============================================================================

  /** Get a promo code row by code */
  getPromoCodeRow(code: string): Locator {
    return this.promoCodesTable.locator('tbody tr').filter({ hasText: code }).first();
  }

  /** Open the create promo code dialog */
  async openCreatePromoCodeDialog(): Promise<void> {
    // Wait for page to be fully loaded
    await this.waitForPageLoad();

    // Check for empty state first (no promo codes)
    const emptyStateButton = this.createFirstPromoCodeButton;
    const headerButton = this.createPromoCodeButton;

    // Try header button first, then empty state button
    if (await headerButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await headerButton.click();
    } else if (await emptyStateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await emptyStateButton.click();
    } else {
      // Fallback - click any button that matches
      await this.page.getByRole('button', { name: /create.*promo/i }).first().click();
    }

    // Wait for dialog with longer timeout
    await expect(this.promoCodeDialog).toBeVisible({ timeout: TIMEOUTS.standard });
    // Wait for dialog content to render
    await this.page.waitForTimeout(300);
  }

  /** Fill the promo code form */
  async fillPromoCodeForm(data: {
    code: string;
    description?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue: string;
    minOrderAmount?: string;
    maxDiscount?: string;
    maxUses?: string;
    validFrom?: string;
    validUntil?: string;
  }): Promise<void> {
    // Wait for form to be ready
    await expect(this.promoCodeInput).toBeVisible({ timeout: TIMEOUTS.fast });

    // Fill code (Playwright's fill() automatically clears first - don't use separate clear())
    await this.promoCodeInput.fill(data.code);

    if (data.description) {
      await this.promoCodeDescriptionInput.fill(data.description);
    }

    // Set discount type if provided (defaults to percentage in the UI)
    if (data.discountType === 'fixed') {
      await this.promoCodeDiscountTypeSelect.click();
      await this.page.waitForTimeout(200);
      await this.page.getByRole('option', { name: /fixed amount/i }).click();
      await this.page.waitForTimeout(100);
    }

    // Fill discount value (Playwright's fill() automatically clears first)
    await this.promoCodeDiscountValueInput.fill(data.discountValue);

    if (data.minOrderAmount) {
      await this.promoCodeMinOrderInput.fill(data.minOrderAmount);
    }

    if (data.maxDiscount) {
      await this.promoCodeMaxDiscountInput.fill(data.maxDiscount);
    }

    if (data.maxUses) {
      await this.promoCodeMaxUsesInput.fill(data.maxUses);
    }

    if (data.validFrom) {
      await this.promoCodeValidFromInput.fill(data.validFrom);
    }

    if (data.validUntil) {
      await this.promoCodeValidUntilInput.fill(data.validUntil);
    }

    // Small wait to ensure form state is updated
    await this.page.waitForTimeout(100);
  }

  /** Generate a random promo code */
  async generatePromoCode(): Promise<void> {
    await this.generatePromoCodeButton.click();
  }

  /** Save the promo code (create or update) */
  async savePromoCode(): Promise<void> {
    // Ensure dialog is visible before trying to save
    await expect(this.promoCodeDialog).toBeVisible({ timeout: TIMEOUTS.fast });

    // Look for the submit button within the dialog
    // Button text is "Create" for new promo codes, "Save Changes" for edits
    const createButton = this.promoCodeDialog.getByRole('button', { name: 'Create', exact: true });
    const saveChangesButton = this.promoCodeDialog.getByRole('button', { name: 'Save Changes' });

    // Try to find which button is visible
    const isCreate = await createButton.isVisible({ timeout: 2000 }).catch(() => false);
    const saveButton = isCreate ? createButton : saveChangesButton;

    await expect(saveButton).toBeEnabled({ timeout: TIMEOUTS.fast });
    await saveButton.click();

    // Wait for dialog to close (indicates save completed)
    await expect(this.promoCodeDialog).not.toBeVisible({ timeout: TIMEOUTS.standard });

    // Wait for network to settle after save
    await this.page.waitForLoadState('networkidle');
  }

  /** Create a new promo code */
  async createPromoCode(data: {
    code: string;
    description?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue: string;
    maxUses?: string;
  }): Promise<void> {
    await this.openCreatePromoCodeDialog();
    await this.fillPromoCodeForm(data);
    await this.savePromoCode();
  }

  /** Open the edit dialog for a promo code */
  async openEditPromoCodeDialog(code: string): Promise<void> {
    const row = this.getPromoCodeRow(code);
    await row.locator('button').last().click(); // More actions button
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /edit/i }).click();
    await expect(this.promoCodeDialog).toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /** Toggle promo code active status */
  async togglePromoCodeStatus(code: string): Promise<void> {
    const row = this.getPromoCodeRow(code);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /activate|deactivate/i }).click();
    await this.waitForPageLoad();
  }

  /** Delete a promo code */
  async deletePromoCode(code: string): Promise<void> {
    const row = this.getPromoCodeRow(code);
    await row.locator('button').last().click();
    await this.page.waitForTimeout(200);
    await this.page.locator('[role="menuitem"]').filter({ hasText: /delete/i }).click();

    // Handle confirmation dialog
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.waitForPageLoad();
  }

  /** Copy promo code to clipboard */
  async copyPromoCode(code: string): Promise<void> {
    const row = this.getPromoCodeRow(code);
    await row.locator('button').filter({ has: this.page.locator('svg') }).first().click();
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /** Assert main ticketing page is visible */
  async expectTicketingPageVisible(): Promise<void> {
    await expect(this.ticketingHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.ticketTypesCard).toBeVisible();
    await expect(this.ordersCard).toBeVisible();
    await expect(this.promoCodesCard).toBeVisible();
  }

  /** Assert ticket types page is visible */
  async expectTicketTypesPageVisible(): Promise<void> {
    await expect(this.ticketTypesHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert orders page is visible */
  async expectOrdersPageVisible(): Promise<void> {
    await expect(this.ordersHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert promo codes page is visible */
  async expectPromoCodesPageVisible(): Promise<void> {
    await expect(this.promoCodesHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert ticket type exists in list */
  async expectTicketTypeInList(name: string): Promise<void> {
    await expect(this.getTicketTypeRow(name)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert ticket type has specific status */
  async expectTicketTypeStatus(name: string, status: 'active' | 'inactive'): Promise<void> {
    const row = this.getTicketTypeRow(name);
    // Look for status text anywhere in the row since column positions can vary
    await expect(row.getByText(new RegExp(`^${status}$`, 'i'))).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert ticket type count */
  async expectTicketTypeCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.ticketTypesEmptyState).toBeVisible({ timeout: TIMEOUTS.standard });
    } else {
      await expect(this.ticketTypeRows).toHaveCount(count, { timeout: TIMEOUTS.standard });
    }
  }

  /** Assert order exists in list */
  async expectOrderInList(orderNumber: string): Promise<void> {
    await expect(this.getOrderRow(orderNumber)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert order has specific status */
  async expectOrderStatus(orderNumber: string, status: string): Promise<void> {
    const row = this.getOrderRow(orderNumber);
    // Look for status text in the row
    await expect(row.getByText(new RegExp(`^${status}$`, 'i'))).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert promo code exists in list */
  async expectPromoCodeInList(code: string): Promise<void> {
    await expect(this.getPromoCodeRow(code)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert promo code has specific status */
  async expectPromoCodeStatus(code: string, status: 'active' | 'inactive' | 'expired' | 'exhausted'): Promise<void> {
    const row = this.getPromoCodeRow(code);
    // The status badge is a div with rounded-full class, look for text content in the Status column
    // Status is typically in the 5th cell (Code, Discount, Uses, Valid Period, Status, Actions)
    await expect(row.locator('td').nth(4).getByText(new RegExp(`^${status}$`, 'i'))).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /** Assert promo code count */
  async expectPromoCodeCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.promoCodesEmptyState).toBeVisible({ timeout: TIMEOUTS.standard });
    } else {
      await expect(this.promoCodeRows).toHaveCount(count, { timeout: TIMEOUTS.standard });
    }
  }

  /** Assert toast notification appears */
  async expectToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator('[role="alert"], [data-sonner-toast]');
    await expect(toast.filter({ hasText: message }).first()).toBeVisible({ timeout: TIMEOUTS.standard });
  }
}

/**
 * Create a TicketingPage instance
 */
export function createTicketingPage(page: Page, orgSlug: string): TicketingPage {
  return new TicketingPage(page, orgSlug);
}
