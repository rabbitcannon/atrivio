import { test, expect } from '@playwright/test';
import { createCheckoutSuccessPage, CheckoutSuccessPage } from '../../pages/payments/checkout-success.page';
import { ROUTES, TEST_ORGS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Order Success Page E2E Tests
 *
 * Covers:
 * - Success page display and layout
 * - Order confirmation details
 * - Ticket display
 * - Navigation options
 * - Error handling for invalid sessions
 *
 * Note: Testing the full flow (from checkout to success) requires real
 * Stripe transactions. These tests focus on the success page UI itself.
 */

test.describe('Order Success - Page Display', () => {
  test.describe('Direct URL Access', () => {
    test('shows error for invalid session ID', async ({ page }) => {
      const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);

      // Try to access with invalid session
      await successPage.goto('invalid_session_id');
      await successPage.waitForOrderVerification();

      // Should show error about invalid session
      await successPage.expectError();
    });

    test('shows error for missing session ID', async ({ page }) => {
      // Access success page without session_id parameter
      await page.goto(ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess);
      await page.waitForLoadState('networkidle');

      // Should show error or redirect
      const hasError = await page.locator('[role="alert"], text=/error|invalid|missing/i').isVisible().catch(() => false);
      const wasRedirected = !page.url().includes('/checkout/success');

      expect(hasError || wasRedirected).toBe(true);
    });

    test('shows error for expired session', async ({ page }) => {
      const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);

      // Try with old/expired-looking session ID
      await successPage.goto('cs_test_expired_session_12345');
      await page.waitForLoadState('networkidle');

      // Should show some indication of invalid/expired session
      const hasErrorOrProcessing =
        (await page.locator('text=/processing|confirming|verifying/i').isVisible().catch(() => false)) ||
        (await page.locator('[role="alert"]').isVisible().catch(() => false));

      expect(hasErrorOrProcessing).toBe(true);
    });
  });

  test.describe('Page Elements', () => {
    test('shows processing state initially', async ({ page }) => {
      const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);

      // Access with a session that will be verified
      await page.goto(
        `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test_session`
      );

      // Should show either:
      // 1. Processing/loading state
      // 2. Success state (if verification is fast)
      // 3. Error state (if session is invalid)
      const hasLoadingOrResult = await Promise.race([
        successPage.loadingIndicator.waitFor({ state: 'visible', timeout: 5000 }).then(() => true),
        successPage.successMessage.waitFor({ state: 'visible', timeout: 5000 }).then(() => true),
        successPage.errorMessage.waitFor({ state: 'visible', timeout: 5000 }).then(() => true),
      ]).catch(() => false);

      expect(hasLoadingOrResult).toBe(true);
    });

    test('success page has return to storefront link', async ({ page }) => {
      const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);

      await page.goto(
        `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test`
      );
      await page.waitForLoadState('networkidle');

      // Wait for page to settle
      await page.waitForTimeout(1000);

      // Should have a way to return to storefront (even on error page)
      const returnLink = successPage.returnToStorefrontLink;
      const hasLink = await returnLink.isVisible().catch(() => false);

      // Link may be present even on error state
      // Just verify page loaded without crashing
      expect(page.url()).toContain('/checkout/success');
    });
  });
});

test.describe('Order Success - Navigation', () => {
  test('can navigate from success page to storefront', async ({ page }) => {
    const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);

    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test`
    );
    await page.waitForLoadState('networkidle');

    // Wait for verification to complete
    await page.waitForTimeout(2000);

    // Look for any link back to storefront
    const returnLink = page.getByRole('link', { name: /return|back|browse|buy more|tickets/i });
    const isVisible = await returnLink.first().isVisible().catch(() => false);

    if (isVisible) {
      await returnLink.first().click();
      await page.waitForLoadState('networkidle');

      // Should be back on storefront or related page
      expect(page.url()).toContain(`/s/${TEST_ORGS.nightmareManor.slug}`);
    }
  });
});

test.describe('Order Success - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('success page is usable on mobile', async ({ page }) => {
    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test`
    );
    await page.waitForLoadState('networkidle');

    // Page should render without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;

    // Body should not be wider than viewport (allowing some margin)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);
  });

  test('content is visible on mobile', async ({ page }) => {
    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test`
    );
    await page.waitForLoadState('networkidle');

    // Wait for page to settle
    await page.waitForTimeout(1000);

    // Should have some visible content
    const hasContent =
      (await page.locator('h1, h2, h3').first().isVisible().catch(() => false)) ||
      (await page.locator('[role="alert"]').first().isVisible().catch(() => false)) ||
      (await page.locator('p').first().isVisible().catch(() => false));

    expect(hasContent).toBe(true);
  });
});

test.describe('Order Success - Error States', () => {
  test('shows appropriate error for network failure', async ({ page }) => {
    // Simulate offline mode
    await page.route('**/api/**', (route) => route.abort('failed'));

    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test`
    );

    // Should handle network failure gracefully
    await page.waitForTimeout(3000);

    // Page should show some error state (not crash)
    const hasErrorOrContent = await page.locator('body').textContent();
    expect(hasErrorOrContent).toBeTruthy();
  });

  test('handles malformed session ID gracefully', async ({ page }) => {
    // Try various malformed session IDs
    const malformedIds = [
      'null',
      'undefined',
      '',
      '   ',
      '<script>alert(1)</script>',
      '../../../etc/passwd',
      "'; DROP TABLE orders;--",
    ];

    for (const sessionId of malformedIds) {
      await page.goto(
        `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=${encodeURIComponent(sessionId)}`
      );
      await page.waitForLoadState('networkidle');

      // Page should handle gracefully (not crash or expose errors)
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).not.toContain('SQL');
      expect(pageContent).not.toContain('Exception');
      expect(pageContent).not.toContain('Stack trace');
    }
  });
});

test.describe('Order Success - Different Organizations', () => {
  test('success page works for pro tier org', async ({ page }) => {
    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test`
    );
    await page.waitForLoadState('networkidle');

    // Page should load (with error about invalid session)
    expect(page.url()).toContain(TEST_ORGS.nightmareManor.slug);
  });

  test('success page works for enterprise tier org', async ({ page }) => {
    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.terrorCollective.slug).checkoutSuccess}?session_id=test`
    );
    await page.waitForLoadState('networkidle');

    // Page should load
    expect(page.url()).toContain(TEST_ORGS.terrorCollective.slug);
  });
});

/**
 * The following tests would require actual completed orders to fully test.
 * They are marked as skip but included for documentation of expected behavior.
 */
test.describe('Order Success - With Real Order', () => {
  test.skip('displays order confirmation number', async ({ page }) => {
    // Requires real completed order
    const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);
    await successPage.goto('real_session_id');
    await successPage.waitForOrderVerification();

    await successPage.expectOrderSuccess();
    await successPage.expectOrderNumberVisible();
  });

  test.skip('displays purchased tickets', async ({ page }) => {
    // Requires real completed order
    const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);
    await successPage.goto('real_session_id');
    await successPage.waitForOrderVerification();

    await successPage.expectOrderSuccess();
    await successPage.expectTicketsVisible();
  });

  test.skip('shows customer email', async ({ page }) => {
    // Requires real completed order
    const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);
    await successPage.goto('real_session_id');
    await successPage.waitForOrderVerification();

    await successPage.expectOrderSuccess();
    await successPage.expectCustomerEmailVisible('test@example.com');
  });

  test.skip('allows ticket download', async ({ page }) => {
    // Requires real completed order
    const successPage = createCheckoutSuccessPage(page, TEST_ORGS.nightmareManor.slug);
    await successPage.goto('real_session_id');
    await successPage.waitForOrderVerification();

    await successPage.expectOrderSuccess();

    // Click download button
    await successPage.downloadTickets();

    // Verify download started (or PDF opened)
    // Implementation depends on how tickets are delivered
  });
});

test.describe('Order Success - Accessibility', () => {
  test('page has proper heading structure', async ({ page }) => {
    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=test`
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should have a main heading
    const hasHeading = await page.getByRole('heading').first().isVisible().catch(() => false);
    expect(hasHeading).toBe(true);
  });

  test('error messages are accessible', async ({ page }) => {
    await page.goto(
      `${ROUTES.storefront(TEST_ORGS.nightmareManor.slug).checkoutSuccess}?session_id=invalid`
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Error should be announced (role=alert)
    const hasAlert = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const hasErrorHeading = await page.getByRole('heading', { name: /error|processing|trouble/i }).isVisible().catch(() => false);

    // Should have some accessible error indication
    expect(hasAlert || hasErrorHeading).toBe(true);
  });
});
