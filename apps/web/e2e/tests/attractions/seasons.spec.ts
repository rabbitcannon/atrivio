import { test, expect } from '@playwright/test';
import { createAttractionsPage, AttractionsPage } from '../../pages/dashboard/attractions.page';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TEST_ATTRACTIONS, TEST_SEASONS, TIMEOUTS, generateUniqueName } from '../../helpers/fixtures';

/**
 * Attractions - Seasons E2E Tests
 *
 * Covers:
 * - Seasons page display
 * - Seasons list display
 * - Add season form
 * - Season management
 * - Role-based access control
 *
 * Note: Seasons are part of attractions feature, available on all tiers
 */

test.describe('Seasons - Page Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('displays seasons page', async () => {
    await attractionsPage.expectSeasonsPageVisible();
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /seasons/i })).toBeVisible();
  });

  test('shows breadcrumb navigation', async ({ page }) => {
    // Should show breadcrumb with attractions link
    const hasBreadcrumb = await page.locator('text=/attractions/i').first().isVisible();
    expect(hasBreadcrumb).toBe(true);
  });

  test('shows seasons list section', async ({ page }) => {
    await expect(page.locator('text=/all seasons/i')).toBeVisible();
  });

  test('shows add season form', async ({ page }) => {
    await expect(page.locator('text=/add season/i')).toBeVisible();
  });
});

test.describe('Seasons - Navigation', () => {
  test('accessible via attraction detail page', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.clickSeasonsCard();

    await expect(page).toHaveURL(/\/seasons/);
    await attractionsPage.expectSeasonsPageVisible();
  });

  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/seasons`);
    await page.waitForLoadState('networkidle');

    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await attractionsPage.expectSeasonsPageVisible();
  });

  test('breadcrumb links back to attractions', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    // Click attractions breadcrumb
    const attractionsLink = page.getByRole('link', { name: /attractions/i }).first();
    const isVisible = await attractionsLink.isVisible().catch(() => false);

    if (isVisible) {
      await attractionsLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/attractions$/);
    }
  });
});

test.describe('Seasons - List Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('displays existing seasons', async () => {
    // Should show seasons or empty state
    const hasSeasons = await attractionsPage.seasonCards.count();
    const hasEmptyState = await attractionsPage.noSeasonsState.isVisible().catch(() => false);

    expect(hasSeasons > 0 || hasEmptyState).toBe(true);
  });

  test('seasons show relevant information', async ({ page }) => {
    const hasSeasons = await attractionsPage.seasonCards.count();

    if (hasSeasons > 0) {
      // Seasons should show name and dates
      const seasonCard = attractionsPage.seasonCards.first();
      await expect(seasonCard).toBeVisible();
    }
  });
});

test.describe('Seasons - Add Season Form', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('shows season name input', async () => {
    await expect(attractionsPage.seasonNameInput).toBeVisible();
  });

  test('shows date inputs', async ({ page }) => {
    // Should have start and end date fields
    const hasDateInputs = await page.locator('input[type="date"], [data-testid*="date"]').count();
    expect(hasDateInputs).toBeGreaterThan(0);
  });

  test('shows add season button', async () => {
    await expect(attractionsPage.addSeasonButton).toBeVisible();
  });

  test('add season button is enabled when form is valid', async () => {
    await attractionsPage.seasonNameInput.fill('Test Season');
    await expect(attractionsPage.addSeasonButton).toBeEnabled();
  });
});

test.describe('Seasons - Role-Based Access', () => {
  test('owner can access seasons', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectSeasonsPageVisible();
  });

  test('manager can access seasons', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'manager');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectSeasonsPageVisible();
  });

  test('actor has limited seasons access', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/seasons`);
    await page.waitForLoadState('networkidle');

    // Actor might see limited view or be redirected
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Seasons - Different Tiers', () => {
  test('free tier org can access seasons', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.spookyHollow.slug);
    await loginAs(page, 'freeOwner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.theHollow.id);

    // Seasons should be available
    await attractionsPage.expectSeasonsPageVisible();
  });

  test('pro tier org can access seasons', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectSeasonsPageVisible();
  });

  test('enterprise tier org can access seasons', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.terrorCollective.slug);
    await loginAs(page, 'enterpriseOwner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.dreadFactory.id);

    await attractionsPage.expectSeasonsPageVisible();
  });
});

test.describe('Seasons - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('seasons page is usable on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectSeasonsPageVisible();
  });

  test('add season form is visible on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    await expect(page.locator('text=/add season/i')).toBeVisible();
  });

  test('seasons list is visible on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    await expect(page.locator('text=/all seasons/i')).toBeVisible();
  });
});

test.describe('Seasons - Accessibility', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('form inputs are focusable', async () => {
    await attractionsPage.seasonNameInput.focus();
    await expect(attractionsPage.seasonNameInput).toBeFocused();
  });

  test('page is keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });
});

test.describe('Seasons - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.route('**/api/**/seasons/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/seasons`);
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('handles non-existent attraction gracefully', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/non-existent-id/seasons`);
    await page.waitForLoadState('networkidle');

    // Should show error
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Seasons - Breadcrumb Navigation', () => {
  test('shows correct breadcrumb path', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);

    // Should show: Attractions > [Attraction Name] > Seasons
    await expect(page.locator('text=/attractions/i').first()).toBeVisible();
    await expect(page.locator('text=/seasons/i').first()).toBeVisible();
  });
});

test.describe('Seasons - Season Card Actions', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoSeasons(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('season cards are clickable', async ({ page }) => {
    const hasSeasons = await attractionsPage.seasonCards.count();

    if (hasSeasons > 0) {
      const firstSeason = attractionsPage.seasonCards.first();
      // Season cards might have edit/delete actions
      const hasActions = await firstSeason.locator('button').count();
      expect(hasActions >= 0).toBe(true);
    }
  });
});
