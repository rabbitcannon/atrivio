import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ROUTES, TIMEOUTS, TEST_ATTRACTIONS } from '../../helpers/fixtures';

/**
 * Storefront Page Object
 *
 * Handles interactions with the public storefront ticket selection page.
 */
export class StorefrontPage extends BasePage {
  private identifier: string;

  constructor(page: Page, identifier: string = 'nightmare-manor') {
    super(page);
    this.identifier = identifier;
  }

  // ============================================================================
  // Locators
  // ============================================================================

  /**
   * Get the storefront header/title
   */
  get header(): Locator {
    return this.page.locator('[data-testid="storefront-header"], header h1').first();
  }

  /**
   * Get all ticket type cards
   * These are Card components containing ticket info with price and quantity controls
   */
  get ticketCards(): Locator {
    // Cards contain a CardTitle (h3) and have quantity buttons with Plus/Minus icons
    return this.page.locator('[class*="card"]:has(h3):has(button)').filter({
      has: this.page.locator('button svg'),
    });
  }

  /**
   * Get checkout button - "Proceed to Checkout" button in the cart
   */
  get checkoutButton(): Locator {
    return this.page.getByRole('button', { name: /proceed to checkout/i });
  }

  /**
   * Get cart summary section
   */
  get cartSummary(): Locator {
    return this.page.locator('[data-testid="cart-summary"], [data-testid="order-summary"]');
  }

  /**
   * Get cart total
   */
  get cartTotal(): Locator {
    return this.page.locator('[data-testid="cart-total"], [data-testid="order-total"]');
  }

  /**
   * Get empty cart message
   */
  get emptyCartMessage(): Locator {
    return this.page.locator('text=/no items|empty cart|select tickets/i');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to the storefront home page
   */
  async goto(): Promise<void> {
    const routes = ROUTES.storefront(this.identifier);
    await super.goto(routes.home);
  }

  /**
   * Navigate to a custom storefront page
   */
  async goToPage(slug: string): Promise<void> {
    const routes = ROUTES.storefront(this.identifier);
    await super.goto(routes.customPage(slug));
  }

  // ============================================================================
  // Ticket Selection
  // ============================================================================

  /**
   * Get a specific ticket card by name
   * Card contains an h3 with the ticket name
   */
  getTicketCard(ticketName: string): Locator {
    // Find card that has h3 containing the ticket name and has quantity control buttons
    return this.page
      .locator('[class*="card"]')
      .filter({
        has: this.page.locator(`h3:has-text("${ticketName}")`),
      })
      .filter({
        has: this.page.locator('button svg'),
      })
      .first();
  }

  /**
   * Get quantity input for a ticket (if available, otherwise returns null)
   */
  getQuantityInput(ticketName: string): Locator {
    const card = this.getTicketCard(ticketName);
    return card.locator('input[type="number"]');
  }

  /**
   * Get increment button for a ticket (button with Plus icon)
   * The Plus button is the second button in the quantity controls
   */
  getIncrementButton(ticketName: string): Locator {
    const card = this.getTicketCard(ticketName);
    // The increment button contains a Plus SVG icon and is the last button in the group
    return card.locator('button').filter({ has: this.page.locator('svg.lucide-plus') });
  }

  /**
   * Get decrement button for a ticket (button with Minus icon)
   */
  getDecrementButton(ticketName: string): Locator {
    const card = this.getTicketCard(ticketName);
    // The decrement button contains a Minus SVG icon
    return card.locator('button').filter({ has: this.page.locator('svg.lucide-minus') });
  }

  /**
   * Add tickets to cart by clicking increment button
   */
  async addTickets(ticketName: string, quantity: number): Promise<void> {
    const incrementBtn = this.getIncrementButton(ticketName);

    for (let i = 0; i < quantity; i++) {
      await incrementBtn.click();
      // Small wait for UI update
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Set ticket quantity directly (if input is available)
   */
  async setTicketQuantity(ticketName: string, quantity: number): Promise<void> {
    const input = this.getQuantityInput(ticketName);

    if (await input.isVisible()) {
      await input.fill(quantity.toString());
    } else {
      // Fall back to clicking buttons
      await this.addTickets(ticketName, quantity);
    }
  }

  /**
   * Remove tickets from cart
   */
  async removeTickets(ticketName: string, quantity: number): Promise<void> {
    const decrementBtn = this.getDecrementButton(ticketName);

    for (let i = 0; i < quantity; i++) {
      await decrementBtn.click();
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Click "Add to Cart" button for a ticket (if separate button exists)
   */
  async clickAddToCart(ticketName: string): Promise<void> {
    const card = this.getTicketCard(ticketName);
    const addButton = card.locator('button:has-text("Add"), [data-testid="add-to-cart"]');
    await addButton.click();
  }

  // ============================================================================
  // Checkout
  // ============================================================================

  /**
   * Click the checkout button to proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.waitForUrl(/\/checkout/);
    await this.waitForPageLoad();
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert storefront page is loaded
   * Wait for the "Buy Tickets" heading and at least one ticket card to be visible
   */
  async expectStorefrontLoaded(): Promise<void> {
    // Wait for the main heading
    await expect(this.page.getByRole('heading', { name: 'Buy Tickets' })).toBeVisible({
      timeout: TIMEOUTS.standard,
    });
    // Wait for at least one ticket card (card with h3 and buttons)
    await expect(this.ticketCards.first()).toBeVisible({
      timeout: TIMEOUTS.standard,
    });
  }

  /**
   * Assert a specific ticket is available
   */
  async expectTicketAvailable(ticketName: string): Promise<void> {
    await expect(this.getTicketCard(ticketName)).toBeVisible({
      timeout: TIMEOUTS.standard,
    });
  }

  /**
   * Assert checkout button is visible and enabled (items in cart)
   */
  async expectCheckoutEnabled(): Promise<void> {
    await expect(this.checkoutButton).toBeVisible({ timeout: TIMEOUTS.fast });
    await expect(this.checkoutButton).toBeEnabled();
  }

  /**
   * Assert checkout button is not visible (empty cart)
   * The button only appears when items are added to cart
   */
  async expectCheckoutDisabled(): Promise<void> {
    await expect(this.checkoutButton).not.toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /**
   * Assert cart has items
   */
  async expectCartHasItems(): Promise<void> {
    // Check that checkout button is enabled (indicates items in cart)
    await this.expectCheckoutEnabled();
  }

  /**
   * Assert cart is empty
   */
  async expectCartEmpty(): Promise<void> {
    await this.expectCheckoutDisabled();
  }
}

/**
 * Create a StorefrontPage instance
 */
export function createStorefrontPage(page: Page, identifier?: string): StorefrontPage {
  return new StorefrontPage(page, identifier);
}
