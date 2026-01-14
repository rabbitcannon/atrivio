import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Checkout Success Page Object
 *
 * Handles the order confirmation page after successful payment.
 */
export class CheckoutSuccessPage extends BasePage {
  private identifier: string;

  constructor(page: Page, identifier: string = 'nightmare-manor') {
    super(page);
    this.identifier = identifier;
  }

  // ============================================================================
  // Locators
  // ============================================================================

  get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"], h1:has-text("Confirmed"), h1:has-text("Success"), h1:has-text("Thank")').first();
  }

  get orderNumber(): Locator {
    return this.page.locator('[data-testid="order-number"]');
  }

  get orderNumberText(): Locator {
    return this.page.locator('text=/order.*#|order.*number|confirmation.*#/i').first();
  }

  get customerEmail(): Locator {
    return this.page.locator('[data-testid="customer-email"]');
  }

  get ticketsList(): Locator {
    return this.page.locator('[data-testid="tickets-list"], [data-testid="ticket-numbers"]');
  }

  get ticketItems(): Locator {
    return this.page.locator('[data-testid="ticket-item"], [data-testid*="ticket-number"]');
  }

  get downloadTicketsButton(): Locator {
    return this.page.getByRole('button', { name: /download|print|get tickets/i });
  }

  get returnToStorefrontLink(): Locator {
    // The success page shows "Buy More Tickets" link
    return this.page.getByRole('link', { name: /return|back|browse|continue shopping|buy more tickets|tickets/i });
  }

  get errorMessage(): Locator {
    // The error state shows "Payment Processing" heading and error text in a card
    // Use .or() to chain multiple possible selectors
    return this.page.locator('[data-testid="error-message"]')
      .or(this.page.getByRole('heading', { name: 'Payment Processing' }))
      .or(this.page.getByText(/trouble confirming|failed to verify/i))
      .first();
  }

  get loadingIndicator(): Locator {
    return this.page.locator('[data-testid="loading"], .loading, [aria-busy="true"]');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to checkout success page with session ID
   */
  override async goto(sessionId: string): Promise<void> {
    const routes = ROUTES.storefront(this.identifier);
    await super.goto(`${routes.checkoutSuccess}?session_id=${sessionId}`);
  }

  /**
   * Return to storefront
   */
  async returnToStorefront(): Promise<void> {
    await this.returnToStorefrontLink.click();
    await this.waitForUrl(new RegExp(`/s/${this.identifier}$`));
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Wait for order verification to complete
   */
  async waitForOrderVerification(): Promise<void> {
    // Wait for loading to finish
    const loading = this.loadingIndicator;
    if (await loading.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loading).not.toBeVisible({
        timeout: TIMEOUTS.veryLong,
      });
    }

    // Wait for either success or error
    await Promise.race([
      this.successMessage.waitFor({ state: 'visible', timeout: TIMEOUTS.veryLong }),
      this.errorMessage.waitFor({ state: 'visible', timeout: TIMEOUTS.veryLong }),
    ]);
  }

  /**
   * Download tickets (if button is available)
   */
  async downloadTickets(): Promise<void> {
    const downloadBtn = this.downloadTicketsButton;
    if (await downloadBtn.isVisible()) {
      await downloadBtn.click();
    }
  }

  /**
   * Get the order number text
   */
  async getOrderNumber(): Promise<string | null> {
    const orderNum = this.orderNumber;
    if (await orderNum.isVisible()) {
      return await orderNum.textContent();
    }

    // Try to extract from text
    const text = await this.orderNumberText.textContent();
    if (text) {
      const match = text.match(/#?\s*([A-Z0-9-]+)/i);
      return match ? match[1] : null;
    }

    return null;
  }

  /**
   * Get ticket count
   */
  async getTicketCount(): Promise<number> {
    return await this.ticketItems.count();
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert order was successful
   */
  async expectOrderSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible({
      timeout: TIMEOUTS.veryLong,
    });
  }

  /**
   * Assert order number is displayed
   */
  async expectOrderNumberVisible(): Promise<void> {
    // Look for order number in various formats
    const hasOrderNum = await this.orderNumber.isVisible().catch(() => false);
    const hasOrderText = await this.orderNumberText.isVisible().catch(() => false);

    expect(hasOrderNum || hasOrderText).toBeTruthy();
  }

  /**
   * Assert tickets are displayed
   */
  async expectTicketsVisible(): Promise<void> {
    await expect(this.ticketItems.first()).toBeVisible({
      timeout: TIMEOUTS.standard,
    });
  }

  /**
   * Assert specific number of tickets
   */
  async expectTicketCount(count: number): Promise<void> {
    await expect(this.ticketItems).toHaveCount(count, {
      timeout: TIMEOUTS.standard,
    });
  }

  /**
   * Assert customer email is displayed
   */
  async expectCustomerEmailVisible(email?: string): Promise<void> {
    if (email) {
      await expect(this.page.getByText(email)).toBeVisible({
        timeout: TIMEOUTS.standard,
      });
    } else {
      await expect(this.customerEmail).toBeVisible({
        timeout: TIMEOUTS.standard,
      });
    }
  }

  /**
   * Assert error message is displayed
   */
  async expectError(message?: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible({
      timeout: TIMEOUTS.standard,
    });

    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Assert no error
   */
  async expectNoError(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }
}

/**
 * Create a CheckoutSuccessPage instance
 */
export function createCheckoutSuccessPage(page: Page, identifier?: string): CheckoutSuccessPage {
  return new CheckoutSuccessPage(page, identifier);
}
