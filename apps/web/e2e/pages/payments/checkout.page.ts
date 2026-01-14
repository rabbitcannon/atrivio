import { type Page, type Locator, type FrameLocator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ROUTES, TIMEOUTS, STRIPE_TEST_CARDS } from '../../helpers/fixtures';

/**
 * Checkout Page Object
 *
 * Handles the checkout form (customer info) and Stripe hosted checkout.
 */
export class CheckoutPage extends BasePage {
  private identifier: string;

  constructor(page: Page, identifier: string = 'nightmare-manor') {
    super(page);
    this.identifier = identifier;
  }

  // ============================================================================
  // App Checkout Form Locators
  // ============================================================================

  get emailInput(): Locator {
    return this.page.locator('input[name="email"], input[type="email"]').first();
  }

  get nameInput(): Locator {
    return this.page.locator('input[name="name"], input[name="fullName"], input[name="customerName"]').first();
  }

  get phoneInput(): Locator {
    return this.page.locator('input[name="phone"], input[type="tel"]').first();
  }

  get termsCheckbox(): Locator {
    // shadcn/ui Checkbox renders as a button with role="checkbox"
    return this.page.getByRole('checkbox', { name: /terms|agree/i });
  }

  get continueToPaymentButton(): Locator {
    return this.page.getByRole('button', { name: /continue.*payment|proceed.*payment|pay|checkout/i });
  }

  get orderSummary(): Locator {
    // Find the card that contains "Order Summary" heading
    return this.page.locator('[class*="card"]').filter({
      has: this.page.getByRole('heading', { name: /order summary/i }),
    });
  }

  get orderTotal(): Locator {
    return this.page.locator('[data-testid="order-total"], [data-testid="total"]');
  }

  get promoCodeInput(): Locator {
    return this.page.locator('input[name="promoCode"], input[placeholder*="promo" i]');
  }

  get applyPromoButton(): Locator {
    return this.page.getByRole('button', { name: /apply/i });
  }

  get backButton(): Locator {
    return this.page.getByRole('link', { name: /back|return/i });
  }

  // ============================================================================
  // Stripe Checkout Locators (Stripe's hosted page)
  // ============================================================================

  /**
   * Card number input in Stripe checkout
   * Stripe uses iframes, so we need to access the frame first
   */
  private get stripeCardFrame(): FrameLocator {
    return this.page.frameLocator('iframe[name*="stripe"], iframe[src*="stripe"]').first();
  }

  get stripeCardNumber(): Locator {
    // Stripe's hosted checkout has direct inputs
    return this.page.locator('[name="cardNumber"], [data-testid="card-number-input"], #cardNumber');
  }

  get stripeCardExpiry(): Locator {
    return this.page.locator('[name="cardExpiry"], [data-testid="card-expiry-input"], #cardExpiry');
  }

  get stripeCardCvc(): Locator {
    return this.page.locator('[name="cardCvc"], [data-testid="card-cvc-input"], #cardCvc');
  }

  get stripeCardZip(): Locator {
    return this.page.locator('[name="billingPostalCode"], [name="postalCode"], #billingPostalCode');
  }

  get stripePayButton(): Locator {
    return this.page.getByRole('button', { name: /pay|submit|complete/i }).first();
  }

  get stripeErrorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"], .StripeError, [role="alert"]');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to the checkout page
   */
  override async goto(): Promise<void> {
    const routes = ROUTES.storefront(this.identifier);
    await super.goto(routes.checkout);
  }

  /**
   * Go back to storefront
   */
  override async goBack(): Promise<void> {
    await this.backButton.click();
    await this.waitForUrl(new RegExp(`/s/${this.identifier}$`));
  }

  // ============================================================================
  // App Checkout Form Actions
  // ============================================================================

  /**
   * Fill customer email
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill customer name
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Fill customer phone
   */
  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
  }

  /**
   * Accept terms and conditions
   */
  async acceptTerms(): Promise<void> {
    const checkbox = this.termsCheckbox;
    if (await checkbox.isVisible()) {
      // Check if already checked
      const isChecked = await checkbox.getAttribute('data-state');
      if (isChecked !== 'checked') {
        await checkbox.click();
      }
    }
  }

  /**
   * Fill all customer info
   */
  async fillCustomerInfo(info: {
    email: string;
    name?: string;
    phone?: string;
  }): Promise<void> {
    await this.fillEmail(info.email);

    if (info.name && await this.nameInput.isVisible()) {
      await this.fillName(info.name);
    }

    if (info.phone && await this.phoneInput.isVisible()) {
      await this.fillPhone(info.phone);
    }
  }

  /**
   * Apply a promo code
   */
  async applyPromoCode(code: string): Promise<void> {
    const input = this.promoCodeInput;
    if (await input.isVisible()) {
      await input.fill(code);
      await this.applyPromoButton.click();
    }
  }

  /**
   * Click continue to payment (redirects to Stripe)
   */
  async continueToPayment(): Promise<void> {
    await this.acceptTerms();
    await this.continueToPaymentButton.click();
  }

  // ============================================================================
  // Stripe Checkout Actions
  // ============================================================================

  /**
   * Wait for Stripe checkout page to load
   */
  async waitForStripeCheckout(): Promise<void> {
    // Wait for redirect to Stripe's domain
    await this.page.waitForURL(/checkout\.stripe\.com/, {
      timeout: TIMEOUTS.veryLong,
    });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if currently on Stripe checkout
   */
  isOnStripeCheckout(): boolean {
    return this.page.url().includes('checkout.stripe.com');
  }

  /**
   * Fill Stripe card details
   * Note: Stripe's hosted checkout has different layouts based on configuration
   */
  async fillStripeCard(card: typeof STRIPE_TEST_CARDS.success): Promise<void> {
    // Wait for Stripe form to be ready
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Give Stripe time to initialize

    // Try to fill card number
    // Stripe uses different selectors based on checkout mode
    const cardNumberSelectors = [
      'input[name="cardNumber"]',
      '#cardNumber',
      '[data-testid="card-number-input"]',
      'input[placeholder*="card number" i]',
      'input[autocomplete="cc-number"]',
    ];

    for (const selector of cardNumberSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        await element.fill(card.number);
        break;
      }
    }

    // Fill expiry
    const expirySelectors = [
      'input[name="cardExpiry"]',
      '#cardExpiry',
      'input[placeholder*="MM" i]',
      'input[autocomplete="cc-exp"]',
    ];

    for (const selector of expirySelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        await element.fill(card.expiry);
        break;
      }
    }

    // Fill CVC
    const cvcSelectors = [
      'input[name="cardCvc"]',
      '#cardCvc',
      'input[placeholder*="CVC" i]',
      'input[autocomplete="cc-csc"]',
    ];

    for (const selector of cvcSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        await element.fill(card.cvc);
        break;
      }
    }

    // Fill postal code if visible
    const zipSelectors = [
      'input[name="billingPostalCode"]',
      '#billingPostalCode',
      'input[placeholder*="ZIP" i]',
      'input[autocomplete="postal-code"]',
    ];

    for (const selector of zipSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        await element.fill(card.zip);
        break;
      }
    }
  }

  /**
   * Submit Stripe payment
   */
  async submitStripePayment(): Promise<void> {
    // Find and click the pay button
    const payButtonSelectors = [
      'button[type="submit"]',
      '.SubmitButton',
      '[data-testid="submit-button"]',
    ];

    for (const selector of payButtonSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        await element.click();
        break;
      }
    }
  }

  /**
   * Complete Stripe checkout with a test card
   */
  async completeStripeCheckout(card: typeof STRIPE_TEST_CARDS.success = STRIPE_TEST_CARDS.success): Promise<void> {
    await this.waitForStripeCheckout();
    await this.fillStripeCard(card);
    await this.submitStripePayment();
  }

  // ============================================================================
  // Full Checkout Flow
  // ============================================================================

  /**
   * Complete the entire checkout flow from customer info to payment
   */
  async completeCheckout(options: {
    email: string;
    name?: string;
    phone?: string;
    card?: typeof STRIPE_TEST_CARDS.success;
  }): Promise<void> {
    // Fill customer info
    await this.fillCustomerInfo({
      email: options.email,
      name: options.name,
      phone: options.phone,
    });

    // Continue to Stripe
    await this.continueToPayment();

    // Complete Stripe checkout
    await this.completeStripeCheckout(options.card ?? STRIPE_TEST_CARDS.success);
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert checkout form is displayed
   */
  async expectCheckoutFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Assert order summary shows items
   */
  async expectOrderSummaryVisible(): Promise<void> {
    await expect(this.orderSummary).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Assert continue button is enabled
   */
  async expectContinueEnabled(): Promise<void> {
    await expect(this.continueToPaymentButton).toBeEnabled();
  }

  /**
   * Assert continue button is disabled
   */
  async expectContinueDisabled(): Promise<void> {
    await expect(this.continueToPaymentButton).toBeDisabled();
  }

  /**
   * Assert on Stripe checkout page
   */
  async expectOnStripeCheckout(): Promise<void> {
    await this.page.waitForURL(/checkout\.stripe\.com/, {
      timeout: TIMEOUTS.veryLong,
    });
  }

  /**
   * Assert Stripe error is displayed
   */
  async expectStripeError(message?: string | RegExp): Promise<void> {
    await expect(this.stripeErrorMessage).toBeVisible({
      timeout: TIMEOUTS.standard,
    });

    if (message) {
      await expect(this.stripeErrorMessage).toContainText(message);
    }
  }
}

/**
 * Create a CheckoutPage instance
 */
export function createCheckoutPage(page: Page, identifier?: string): CheckoutPage {
  return new CheckoutPage(page, identifier);
}
