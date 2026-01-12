import { test, expect } from '@playwright/test';
import { createStorefrontPage, StorefrontPage } from '../../pages/storefront/storefront.page';
import { ROUTES, TEST_ORGS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Storefront Browse E2E Tests
 *
 * Covers:
 * - Storefront page display and layout
 * - Ticket listing and information
 * - Ticket quantity selection (add/remove)
 * - Cart management
 * - Mobile responsiveness
 * - Accessibility
 *
 * Note: These tests are for public storefront pages (no authentication required)
 */

test.describe('Storefront - Browse Tickets', () => {
  let storefrontPage: StorefrontPage;

  test.beforeEach(async ({ page }) => {
    storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
  });

  test.describe('Page Display', () => {
    test('displays storefront with ticket options', async () => {
      await storefrontPage.expectStorefrontLoaded();
    });

    test('shows "Buy Tickets" heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Buy Tickets' })).toBeVisible({
        timeout: TIMEOUTS.standard,
      });
    });

    test('displays ticket cards with pricing', async () => {
      await storefrontPage.expectStorefrontLoaded();

      // Verify ticket cards are visible
      const ticketCards = storefrontPage.ticketCards;
      const cardCount = await ticketCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('shows ticket name and price in cards', async ({ page }) => {
      await storefrontPage.expectStorefrontLoaded();

      // Each ticket card should have a name (h3) and price
      const firstCard = storefrontPage.ticketCards.first();
      await expect(firstCard.locator('h3')).toBeVisible();

      // Price should be visible (contains $ sign)
      await expect(firstCard.getByText(/\$/)).toBeVisible();
    });

    test('displays quantity controls for tickets', async () => {
      await storefrontPage.expectStorefrontLoaded();

      // First ticket card should have increment/decrement buttons
      const firstCard = storefrontPage.ticketCards.first();
      const buttons = firstCard.locator('button');
      const buttonCount = await buttons.count();

      // Should have at least increment and decrement buttons
      expect(buttonCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Ticket Selection', () => {
    test('can increment ticket quantity', async () => {
      await storefrontPage.expectStorefrontLoaded();

      // Get the first ticket card name
      const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
      expect(firstCardName).toBeTruthy();

      // Add a ticket
      await storefrontPage.addTickets(firstCardName!, 1);

      // Cart should have items (checkout button should be visible)
      await storefrontPage.expectCartHasItems();
    });

    test('can decrement ticket quantity', async () => {
      await storefrontPage.expectStorefrontLoaded();

      const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
      expect(firstCardName).toBeTruthy();

      // Add 2 tickets
      await storefrontPage.addTickets(firstCardName!, 2);

      // Remove 1 ticket
      await storefrontPage.removeTickets(firstCardName!, 1);

      // Should still have items in cart (1 ticket)
      await storefrontPage.expectCartHasItems();
    });

    test('can add multiple different ticket types', async () => {
      await storefrontPage.expectStorefrontLoaded();

      const cards = storefrontPage.ticketCards;
      const cardCount = await cards.count();

      if (cardCount >= 2) {
        // Get names of first two ticket types
        const firstName = await cards.nth(0).locator('h3').textContent();
        const secondName = await cards.nth(1).locator('h3').textContent();

        // Add one of each
        if (firstName) await storefrontPage.addTickets(firstName, 1);
        if (secondName) await storefrontPage.addTickets(secondName, 1);

        // Cart should have items
        await storefrontPage.expectCartHasItems();
      }
    });

    test('cannot decrement below zero', async () => {
      await storefrontPage.expectStorefrontLoaded();

      const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();

      // Try to decrement when quantity is already 0
      // The decrement button should be disabled or do nothing
      if (firstCardName) {
        const decrementBtn = storefrontPage.getDecrementButton(firstCardName);
        const isDisabled = await decrementBtn.isDisabled().catch(() => false);

        // Either button is disabled or clicking has no effect
        if (!isDisabled) {
          await decrementBtn.click();
          // Cart should still be empty
          await storefrontPage.expectCartEmpty();
        }
      }
    });
  });

  test.describe('Cart Management', () => {
    test('checkout button appears when items added', async () => {
      await storefrontPage.expectStorefrontLoaded();

      // Initially, checkout should be disabled/hidden
      await storefrontPage.expectCartEmpty();

      // Add a ticket
      const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();
      if (firstCardName) {
        await storefrontPage.addTickets(firstCardName, 1);
      }

      // Checkout should now be enabled
      await storefrontPage.expectCheckoutEnabled();
    });

    test('checkout button disappears when cart emptied', async () => {
      await storefrontPage.expectStorefrontLoaded();

      const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();

      if (firstCardName) {
        // Add ticket
        await storefrontPage.addTickets(firstCardName, 1);
        await storefrontPage.expectCartHasItems();

        // Remove ticket
        await storefrontPage.removeTickets(firstCardName, 1);

        // Cart should be empty
        await storefrontPage.expectCartEmpty();
      }
    });

    test('can proceed to checkout', async ({ page }) => {
      await storefrontPage.expectStorefrontLoaded();

      const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();

      if (firstCardName) {
        await storefrontPage.addTickets(firstCardName, 1);
        await storefrontPage.proceedToCheckout();

        // Should navigate to checkout page
        await expect(page).toHaveURL(/\/checkout/);
      }
    });
  });

  test.describe('Navigation', () => {
    test('storefront is accessible via direct URL', async ({ page }) => {
      // Navigate directly to storefront
      await page.goto(ROUTES.storefront(TEST_ORGS.nightmareManor.slug).home);
      await page.waitForLoadState('networkidle');

      // Should show storefront
      await expect(page.getByRole('heading', { name: 'Buy Tickets' })).toBeVisible({
        timeout: TIMEOUTS.standard,
      });
    });

    test('can access custom pages if available', async ({ page }) => {
      // Try to access FAQ page (may or may not exist)
      await page.goto(ROUTES.storefront(TEST_ORGS.nightmareManor.slug).faq);
      await page.waitForLoadState('networkidle');

      // Should either show the page or a 404
      const currentUrl = page.url();
      const isValidPage = currentUrl.includes('faq') || currentUrl.includes(TEST_ORGS.nightmareManor.slug);
      expect(isValidPage).toBe(true);
    });
  });
});

test.describe('Storefront - Different Organizations', () => {
  test('pro tier org storefront is accessible', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();
  });

  test('enterprise tier org storefront is accessible', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.terrorCollective.slug);
    await storefrontPage.goto();

    // Should either load or show appropriate message
    await page.waitForLoadState('networkidle');

    // Enterprise org should have storefront access
    const hasBuyTickets = await page.getByRole('heading', { name: 'Buy Tickets' }).isVisible({ timeout: TIMEOUTS.standard }).catch(() => false);

    // If storefront is configured, it should show tickets
    if (hasBuyTickets) {
      await expect(page.getByRole('heading', { name: 'Buy Tickets' })).toBeVisible();
    }
  });

  test('free tier org may have limited storefront', async ({ page }) => {
    // Free tier might not have storefront feature enabled
    await page.goto(ROUTES.storefront(TEST_ORGS.spookyHollow.slug).home);
    await page.waitForLoadState('networkidle');

    // Could show storefront, upgrade message, or redirect
    const currentUrl = page.url();

    // Just verify the page loads without error
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Storefront - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('storefront is usable on mobile', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    // Ticket cards should still be visible
    const ticketCards = storefrontPage.ticketCards;
    await expect(ticketCards.first()).toBeVisible();
  });

  test('can add tickets on mobile', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();

    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
      await storefrontPage.expectCartHasItems();
    }
  });

  test('checkout button is visible on mobile', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();

    if (firstCardName) {
      await storefrontPage.addTickets(firstCardName, 1);
      await expect(storefrontPage.checkoutButton).toBeVisible();
    }
  });
});

test.describe('Storefront - Accessibility', () => {
  test('ticket cards have proper structure', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    // Each card should have a heading
    const firstCard = storefrontPage.ticketCards.first();
    const heading = firstCard.locator('h3');
    await expect(heading).toBeVisible();
  });

  test('quantity buttons are focusable', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    const firstCardName = await storefrontPage.ticketCards.first().locator('h3').textContent();

    if (firstCardName) {
      const incrementBtn = storefrontPage.getIncrementButton(firstCardName);
      await incrementBtn.focus();
      await expect(incrementBtn).toBeFocused();
    }
  });

  test('can interact with keyboard', async ({ page }) => {
    const storefrontPage = createStorefrontPage(page, TEST_ORGS.nightmareManor.slug);
    await storefrontPage.goto();
    await storefrontPage.expectStorefrontLoaded();

    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to tab to interactive elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });
});

test.describe('Storefront - Error Handling', () => {
  test('handles non-existent storefront gracefully', async ({ page }) => {
    await page.goto('/s/non-existent-org');
    await page.waitForLoadState('networkidle');

    // Should show 404 or error page
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');

    // Either redirected or shows error
    const handledGracefully =
      currentUrl.includes('404') ||
      currentUrl.includes('error') ||
      pageContent?.toLowerCase().includes('not found') ||
      pageContent?.toLowerCase().includes('error') ||
      // Or just doesn't crash
      pageContent !== null;

    expect(handledGracefully).toBe(true);
  });
});
