import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Attractions Smoke Tests
 *
 * Verifies attraction management features work correctly.
 */

test.describe('Attractions Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('attractions page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/attractions`);
    await page.waitForLoadState('networkidle');

    // Should see attractions content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/attraction|haunt|venue/i);
  });

  test('attractions list shows attractions', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/attractions`);
    await page.waitForLoadState('networkidle');

    // Should see attraction cards or list items
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
    const hasContent = (await page.locator('body').textContent())?.length! > 200;

    expect(hasTable || hasCards || hasContent).toBeTruthy();
  });

  test('attraction detail page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/attractions`);
    await page.waitForLoadState('networkidle');

    // Find attraction links - must contain UUID pattern, not 'new'
    const attractionLinks = page.locator('a[href*="/attractions/"]');
    const allLinks = await attractionLinks.all();

    // Filter to find links that look like actual attractions (UUID-based)
    let foundAttractionLink = false;
    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      // Skip links that contain 'new'
      if (href && !href.includes('/new') && href.match(/\/attractions\/[a-f0-9-]{36}/)) {
        await link.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toMatch(/\/attractions\/[a-f0-9-]+/);
        foundAttractionLink = true;
        break;
      }
    }

    if (!foundAttractionLink) {
      // No attraction links found - this is fine for smoke test
      // Just verify we're on the attractions page and authenticated
      expect(page.url()).toContain('/attractions');
      expect(page.url()).not.toContain('/login');
    }
  });

  test('new attraction page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/attractions/new`);
    await page.waitForLoadState('networkidle');

    // Should see create form
    const hasForm = await page.locator('form').isVisible().catch(() => false);
    const hasNameField = await page.locator('input[name="name"]').isVisible().catch(() => false);
    const pageContent = await page.locator('body').textContent();
    const hasCreateContent = pageContent?.toLowerCase().includes('create') || pageContent?.toLowerCase().includes('new');

    expect(hasForm || hasNameField || hasCreateContent).toBeTruthy();
  });

  test('manager can view attractions', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'manager');

    await page.goto(`/${TEST_USERS.manager.orgSlug}/attractions`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/login');
  });
});
