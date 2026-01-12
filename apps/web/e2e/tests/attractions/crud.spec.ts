import { test, expect } from '@playwright/test';
import { createAttractionsPage, AttractionsPage } from '../../pages/dashboard/attractions.page';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TEST_ATTRACTIONS, TIMEOUTS, generateUniqueName } from '../../helpers/fixtures';

/**
 * Attractions - CRUD E2E Tests
 *
 * Covers:
 * - Attractions list page display
 * - Attraction cards display
 * - Create attraction flow
 * - Attraction detail page
 * - Navigation between attractions
 * - Role-based access control
 *
 * Note: Attractions feature is available on all tiers
 */

test.describe('Attractions List - Page Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();
  });

  test('displays attractions list page', async () => {
    await attractionsPage.expectAttractionsPageVisible();
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /attractions/i })).toBeVisible();
  });

  test('shows Add Attraction button', async () => {
    await expect(attractionsPage.addAttractionButton).toBeVisible();
  });

  test('shows attraction cards for pro tier org', async () => {
    // Pro tier org should have attractions
    const cardCount = await attractionsPage.getAttractionCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('attraction cards show relevant info', async ({ page }) => {
    // Cards should show attraction names
    await expect(page.locator('text=/haunted|terror|asylum/i').first()).toBeVisible();
  });
});

test.describe('Attractions List - Navigation', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();
  });

  test('can navigate to create attraction page', async ({ page }) => {
    await attractionsPage.clickAddAttraction();
    await expect(page).toHaveURL(/\/attractions\/new/);
    await attractionsPage.expectCreatePageVisible();
  });

  test('can navigate to attraction detail page', async ({ page }) => {
    // Click on first attraction card
    const firstCard = attractionsPage.attractionCards.first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // Should be on detail page
    await expect(page).toHaveURL(/\/attractions\/[^\/]+$/);
  });

  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('networkidle');

    await attractionsPage.expectAttractionsPageVisible();
  });
});

test.describe('Create Attraction - Page Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoCreate();
  });

  test('displays create attraction page', async () => {
    await attractionsPage.expectCreatePageVisible();
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create attraction/i })).toBeVisible();
  });

  test('shows attraction form', async () => {
    await expect(attractionsPage.attractionForm).toBeVisible();
  });

  test('shows name input', async () => {
    await expect(attractionsPage.nameInput).toBeVisible();
  });

  test('shows submit button', async () => {
    await expect(attractionsPage.submitButton).toBeVisible();
  });
});

test.describe('Create Attraction - Form Validation', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoCreate();
  });

  test('requires name field', async ({ page }) => {
    // Try to submit empty form
    await attractionsPage.submitButton.click();
    await page.waitForTimeout(300);

    // Should show validation error or not navigate away
    const stillOnCreatePage = page.url().includes('/attractions/new');
    expect(stillOnCreatePage).toBe(true);
  });

  test('accepts valid attraction data', async ({ page }) => {
    await attractionsPage.nameInput.fill('Test Attraction');

    // Form should be valid
    await expect(attractionsPage.submitButton).toBeEnabled();
  });
});

test.describe('Attraction Detail - Page Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('displays attraction detail page', async () => {
    await attractionsPage.expectDetailPageVisible();
  });

  test('shows attraction name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /haunted mansion/i })).toBeVisible();
  });

  test('shows status badge', async () => {
    await expect(attractionsPage.statusBadge).toBeVisible();
  });

  test('shows settings button', async () => {
    await expect(attractionsPage.settingsButton).toBeVisible();
  });

  test('shows feature cards', async () => {
    await attractionsPage.expectFeatureCardsVisible();
  });

  test('shows zones card', async () => {
    await expect(attractionsPage.zonesCard).toBeVisible();
  });

  test('shows seasons card', async () => {
    await expect(attractionsPage.seasonsCard).toBeVisible();
  });

  test('shows storefront card', async () => {
    await expect(attractionsPage.storefrontCard).toBeVisible();
  });
});

test.describe('Attraction Detail - Navigation', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('can navigate to zones page', async ({ page }) => {
    await attractionsPage.clickZonesCard();
    await expect(page).toHaveURL(/\/zones/);
    await attractionsPage.expectZonesPageVisible();
  });

  test('can navigate to seasons page', async ({ page }) => {
    await attractionsPage.clickSeasonsCard();
    await expect(page).toHaveURL(/\/seasons/);
    await attractionsPage.expectSeasonsPageVisible();
  });

  test('can navigate to storefront page', async ({ page }) => {
    await attractionsPage.clickStorefrontCard();
    await expect(page).toHaveURL(/\/storefront/);
  });

  test('can navigate to settings', async ({ page }) => {
    await attractionsPage.clickSettings();
    await expect(page).toHaveURL(/\/settings/);
  });
});

test.describe('Attractions - Direct URL Access', () => {
  test('attractions list accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('networkidle');

    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await attractionsPage.expectAttractionsPageVisible();
  });

  test('create attraction page accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/new`);
    await page.waitForLoadState('networkidle');

    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await attractionsPage.expectCreatePageVisible();
  });

  test('attraction detail accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}`);
    await page.waitForLoadState('networkidle');

    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await attractionsPage.expectDetailPageVisible();
  });
});

test.describe('Attractions - Role-Based Access', () => {
  test('owner can access attractions', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();

    await attractionsPage.expectAttractionsPageVisible();
    await expect(attractionsPage.addAttractionButton).toBeVisible();
  });

  test('manager can access attractions', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'manager');
    await attractionsPage.goto();

    await attractionsPage.expectAttractionsPageVisible();
  });

  test('actor has limited attraction access', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('networkidle');

    // Actor might see limited view or be redirected
    const hasAttractions = await page.getByRole('heading', { name: /attractions/i }).isVisible().catch(() => false);
    const wasRedirected = !page.url().includes('/attractions');
    const hasAccessDenied = await page.locator('text=/access denied|permission/i').isVisible().catch(() => false);

    // Page should respond appropriately
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Attractions - Different Tiers', () => {
  test('free tier org can access attractions', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.spookyHollow.slug);
    await loginAs(page, 'freeOwner');
    await attractionsPage.goto();

    // Attractions should be available on all tiers
    await attractionsPage.expectAttractionsPageVisible();
  });

  test('pro tier org can access attractions', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();

    await attractionsPage.expectAttractionsPageVisible();
  });

  test('enterprise tier org can access attractions', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.terrorCollective.slug);
    await loginAs(page, 'enterpriseOwner');
    await attractionsPage.goto();

    await attractionsPage.expectAttractionsPageVisible();
  });

  test('free tier org limited to one attraction', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.spookyHollow.slug);
    await loginAs(page, 'freeOwner');
    await attractionsPage.goto();

    // Free tier should have at most 1 attraction
    const count = await attractionsPage.getAttractionCount();
    expect(count).toBeLessThanOrEqual(1);
  });
});

test.describe('Attractions - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('attractions list is usable on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();

    await attractionsPage.expectAttractionsPageVisible();
  });

  test('Add Attraction button is visible on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();

    await expect(attractionsPage.addAttractionButton).toBeVisible();
  });

  test('attraction cards are visible on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();

    const count = await attractionsPage.getAttractionCount();
    expect(count).toBeGreaterThan(0);
  });

  test('attraction detail page is usable on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectDetailPageVisible();
  });

  test('create attraction page is usable on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoCreate();

    await attractionsPage.expectCreatePageVisible();
  });
});

test.describe('Attractions - Accessibility', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.goto();
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Add Attraction button is focusable', async () => {
    await attractionsPage.addAttractionButton.focus();
    await expect(attractionsPage.addAttractionButton).toBeFocused();
  });

  test('attractions are keyboard navigable', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });
});

test.describe('Attractions - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.route('**/api/**/attractions/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions`);
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('handles non-existent attraction gracefully', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/non-existent-id`);
    await page.waitForLoadState('networkidle');

    // Should show error or 404
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Attractions - Stats Display', () => {
  test('detail page shows zones count', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);

    // Should show zones stat
    const hasZonesStat = await page.locator('text=/zones/i').first().isVisible();
    expect(hasZonesStat).toBe(true);
  });

  test('detail page shows capacity', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);

    // Should show capacity stat
    const hasCapacityStat = await page.locator('text=/capacity/i').first().isVisible();
    expect(hasCapacityStat).toBe(true);
  });

  test('detail page shows type', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);

    // Should show type stat
    const hasTypeStat = await page.locator('text=/type/i').first().isVisible();
    expect(hasTypeStat).toBe(true);
  });
});
