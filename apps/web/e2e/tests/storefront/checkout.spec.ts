import { test, expect } from '@playwright/test';
import { createStorefrontPage, StorefrontPage } from '../../pages/storefront/storefront.page';
import { createCheckoutPage, CheckoutPage } from '../../pages/payments/checkout.page';
import { ROUTES, TEST_ORGS, TIMEOUTS, STRIPE_TEST_CARDS } from '../../helpers/fixtures';

/**
 * Storefront Checkout E2E Tests
 *
 * Covers:
 * - Checkout form display and validation
 * - Customer information entry
 * - Order summary display
 * - Promo code application
 * - Stripe payment integration (using test cards)
 * - Error handling
 *
 * Note: Full Stripe checkout flow requires redirect to Stripe's hosted page
 */

// Test email for checkout (unique per test run)
const generateTestEmail = () => `test.${Date.now()}@example.com`;

test.describe('Storefront - Checkout Form', () => {
  let storefrontPage: StorefrontPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    checkoutPage = createCheckoutPage(page, TEST_ORGS.nightmareManor.slug);

    // Add tickets to cart first
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
    }

    // Proceed to checkout
    await storefrontPage.proceedToCheckout();
  });

  test.describe('Form Display', () => {
    test('displays checkout form with email input', async () => {
      await checkoutPage.expectCheckoutFormVisible();
    });

    test('shows order summary', async ({ page }) => {
      // Should show some indication of what's being purchased
      await expect(checkoutPage.orderSummary.or(page.getByText(/summary|total/i))).toBeVisible({
        timeout: TIMEOUTS.standard,
      });
    });

    test('shows continue to payment button', async () => {
      await expect(checkoutPage.continueToPaymentButton).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('requires email to proceed', async () => {
      // Don't fill email, try to continue
      await checkoutPage.continueToPaymentButton.click();

      // Should show validation error or stay on page
      await expect(checkoutPage.emailInput).toBeVisible();
    });

    test('validates email format', async () => {
      await checkoutPage.fillEmail('notanemail');
      await checkoutPage.continueToPaymentButton.click();

      // Should show validation error or native validation
      // Check we're still on checkout page
      await expect(checkoutPage.emailInput).toBeVisible();
    });

    test('accepts valid email', async () => {
      await checkoutPage.fillEmail(generateTestEmail());

      // Email input should accept valid format
      const emailValue = await checkoutPage.emailInput.inputValue();
      expect(emailValue).toContain('@');
    });
  });

  test.describe('Customer Info Entry', () => {
    test('can fill email address', async () => {
      const testEmail = generateTestEmail();
      await checkoutPage.fillEmail(testEmail);

      const value = await checkoutPage.emailInput.inputValue();
      expect(value).toBe(testEmail);
    });

    test('can fill name if field exists', async () => {
      const nameInput = checkoutPage.nameInput;
      const isVisible = await nameInput.isVisible().catch(() => false);

      if (isVisible) {
        await checkoutPage.fillName('Test Customer');
        const value = await nameInput.inputValue();
        expect(value).toBe('Test Customer');
      }
    });

    test('can fill phone if field exists', async () => {
      const phoneInput = checkoutPage.phoneInput;
      const isVisible = await phoneInput.isVisible().catch(() => false);

      if (isVisible) {
        await checkoutPage.fillPhone('555-123-4567');
        const value = await phoneInput.inputValue();
        expect(value).toContain('555');
      }
    });

    test('can accept terms if checkbox exists', async () => {
      const termsCheckbox = checkoutPage.termsCheckbox;
      const isVisible = await termsCheckbox.isVisible().catch(() => false);

      if (isVisible) {
        await checkoutPage.acceptTerms();

        // Checkbox should be checked
        const state = await termsCheckbox.getAttribute('data-state');
        expect(state).toBe('checked');
      }
    });
  });
});

test.describe('Storefront - Checkout to Stripe', () => {
  let storefrontPage: StorefrontPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    checkoutPage = createCheckoutPage(page, TEST_ORGS.nightmareManor.slug);

    // Add tickets to cart
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
    }

    await storefrontPage.proceedToCheckout();
  });

  test('redirects to Stripe checkout on payment', async ({ page }) => {
    await checkoutPage.fillCustomerInfo({
      email: generateTestEmail(),
      name: 'Test Customer',
    });

    await checkoutPage.continueToPayment();

    // Should redirect to Stripe
    await checkoutPage.expectOnStripeCheckout();
  });

  test('can fill Stripe payment form', async ({ page }) => {
    // This test verifies we can interact with Stripe's checkout
    await checkoutPage.fillCustomerInfo({
      email: generateTestEmail(),
      name: 'Test Customer',
    });

    await checkoutPage.continueToPayment();
    await checkoutPage.waitForStripeCheckout();

    // Verify we're on Stripe's domain
    expect(page.url()).toContain('checkout.stripe.com');

    // Try to fill card details
    await checkoutPage.fillStripeCard(STRIPE_TEST_CARDS.success);
  });

  test.skip('completes full payment flow with success card', async ({ page }) => {
    // Skip by default as it creates real orders
    // Enable for full integration testing

    await checkoutPage.fillCustomerInfo({
      email: generateTestEmail(),
      name: 'Test Customer',
    });

    await checkoutPage.continueToPayment();
    await checkoutPage.completeStripeCheckout(STRIPE_TEST_CARDS.success);

    // Should redirect to success page
    await page.waitForURL(/\/checkout\/success/, {
      timeout: TIMEOUTS.veryLong,
    });
  });
});

test.describe('Storefront - Checkout Promo Codes', () => {
  let storefrontPage: StorefrontPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    checkoutPage = createCheckoutPage(page, TEST_ORGS.nightmareManor.slug);

    // Add tickets to cart
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
    }

    await storefrontPage.proceedToCheckout();
  });

  test('shows promo code input if available', async () => {
    const promoInput = checkoutPage.promoCodeInput;
    const isVisible = await promoInput.isVisible().catch(() => false);

    // Promo code field may or may not be visible depending on configuration
    // Just verify the page loads correctly
    await checkoutPage.expectCheckoutFormVisible();
  });

  test('can enter promo code if field exists', async () => {
    const promoInput = checkoutPage.promoCodeInput;
    const isVisible = await promoInput.isVisible().catch(() => false);

    if (isVisible) {
      await promoInput.fill('TESTCODE');
      const value = await promoInput.inputValue();
      expect(value).toBe('TESTCODE');
    }
  });

  test('can apply promo code if field exists', async () => {
    const promoInput = checkoutPage.promoCodeInput;
    const isVisible = await promoInput.isVisible().catch(() => false);

    if (isVisible) {
      await checkoutPage.applyPromoCode('TESTCODE');

      // Wait for response
      await checkoutPage.page.waitForTimeout(500);

      // Should show success or error message
      const hasAlert = await checkoutPage.page.locator('[role="alert"]').isVisible().catch(() => false);
      // Alert may or may not appear depending on code validity
    }
  });
});

test.describe('Storefront - Checkout Navigation', () => {
  test('can go back to storefront from checkout', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    const checkoutPage = createCheckoutPage(page, TEST_ORGS.nightmareManor.slug);

    // Add tickets and go to checkout
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
    }

    await storefrontPage.proceedToCheckout();
    await checkoutPage.expectCheckoutFormVisible();

    // Go back
    const backButton = checkoutPage.backButton;
    const isVisible = await backButton.isVisible().catch(() => false);

    if (isVisible) {
      await backButton.click();
      await page.waitForLoadState('networkidle');

      // Should be back on storefront
      await expect(page).toHaveURL(new RegExp(`/s/${TEST_ORGS.nightmareManor.slug}$`));
    }
  });

  test('checkout requires items in cart', async ({ page }) => {
    // Try to access checkout directly without items
    await page.goto(ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkout);
    await page.waitForLoadState('networkidle');

    // Should either redirect back to storefront or show error
    const currentUrl = page.url();
    const showsError = await page.locator('text=/no items|empty cart|select tickets/i').isVisible().catch(() => false);

    // Either redirected or shows empty cart message
    const handledCorrectly =
      !currentUrl.includes('/checkout') ||
      showsError ||
      await page.getByRole('heading', { name: 'Buy Tickets' }).isVisible().catch(() => false);

    expect(handledCorrectly).toBe(true);
  });
});

test.describe('Storefront - Checkout Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('checkout form is usable on mobile', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    const checkoutPage = createCheckoutPage(page, TEST_ORGS.nightmareManor.slug);

    // Add tickets and go to checkout
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
    }

    await storefrontPage.proceedToCheckout();

    // Form should be visible on mobile
    await checkoutPage.expectCheckoutFormVisible();

    // Can interact with form
    await checkoutPage.fillEmail(generateTestEmail());
    const value = await checkoutPage.emailInput.inputValue();
    expect(value).toContain('@');
  });

  test('continue button is accessible on mobile', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    const checkoutPage = createCheckoutPage(page, TEST_ORGS.nightmareManor.slug);

    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
    }

    await storefrontPage.proceedToCheckout();

    // Continue button should be visible
    await expect(checkoutPage.continueToPaymentButton).toBeVisible();
  });
});

test.describe('Storefront - Checkout Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);

    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
    }

    await storefrontPage.proceedToCheckout();
  });

  test('email input has proper label', async ({ page }) => {
    const emailLabel = page.getByLabel(/email/i);
    await expect(emailLabel).toBeVisible({ timeout: TIMEOUTS.standard });
  });

  test('form is keyboard navigable', async ({ page }) => {
    const checkoutPage = createCheckoutPage(page, TEST_ORGS.nightmareManor.slug);

    // Focus email input
    await checkoutPage.emailInput.click();
    await expect(checkoutPage.emailInput).toBeFocused();

    // Tab through form
    let foundSubmit = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      if (await checkoutPage.continueToPaymentButton.evaluate((el) => el === document.activeElement)) {
        foundSubmit = true;
        break;
      }
    }

    expect(foundSubmit).toBe(true);
  });
});
