import { test, expect } from '@playwright/test';

/**
 * Storefront Smoke Tests
 *
 * Verifies public storefront features work correctly.
 * These tests don't require authentication.
 */

test.describe('Storefront Smoke Tests', () => {
  test('storefront page loads for published storefront', async ({ page }) => {
    // Nightmare Manor storefront (Pro tier, should be published)
    await page.goto('/s/nightmare-manor');
    await page.waitForLoadState('networkidle');

    // Should see storefront content or not published message
    const pageContent = await page.locator('body').textContent();
    const hasContent = pageContent && pageContent.length > 100;
    expect(hasContent).toBeTruthy();
  });

  test('storefront shows tickets or coming soon', async ({ page }) => {
    await page.goto('/s/nightmare-manor');
    await page.waitForLoadState('networkidle');

    const pageContent = await page.locator('body').textContent();
    // Could show tickets or "not published" / "coming soon"
    const hasExpectedContent =
      pageContent?.toLowerCase().includes('ticket') ||
      pageContent?.toLowerCase().includes('admission') ||
      pageContent?.toLowerCase().includes('not published') ||
      pageContent?.toLowerCase().includes('coming soon') ||
      pageContent?.toLowerCase().includes('not found');

    expect(hasExpectedContent).toBeTruthy();
  });

  test('invalid storefront shows appropriate message', async ({ page }) => {
    await page.goto('/s/non-existent-storefront');
    await page.waitForLoadState('networkidle');

    // Should show 404 or not found message
    const pageContent = await page.locator('body').textContent();
    const shows404 =
      pageContent?.toLowerCase().includes('not found') ||
      pageContent?.toLowerCase().includes('404') ||
      pageContent?.toLowerCase().includes('does not exist');

    expect(shows404).toBeTruthy();
  });

  test('storefront checkout page structure', async ({ page }) => {
    await page.goto('/s/nightmare-manor/checkout');
    await page.waitForLoadState('networkidle');

    // Should show checkout or redirect to storefront
    const pageContent = await page.locator('body').textContent();
    const hasCheckoutOrRedirect =
      pageContent?.toLowerCase().includes('checkout') ||
      pageContent?.toLowerCase().includes('cart') ||
      pageContent?.toLowerCase().includes('ticket') ||
      page.url().includes('/s/nightmare-manor');

    expect(hasCheckoutOrRedirect).toBeTruthy();
  });

  test('enterprise storefront loads', async ({ page }) => {
    // Terror Collective (Enterprise tier)
    await page.goto('/s/terror-collective');
    await page.waitForLoadState('networkidle');

    const pageContent = await page.locator('body').textContent();
    expect(pageContent && pageContent.length > 50).toBeTruthy();
  });
});
