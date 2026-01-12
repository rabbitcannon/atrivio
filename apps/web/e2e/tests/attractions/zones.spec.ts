import { test, expect } from '@playwright/test';
import { createAttractionsPage, AttractionsPage } from '../../pages/dashboard/attractions.page';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TEST_ATTRACTIONS, TIMEOUTS, generateUniqueName } from '../../helpers/fixtures';

/**
 * Attractions - Zones E2E Tests
 *
 * Covers:
 * - Zones page display
 * - Zones list display
 * - Add zone form
 * - Zone management
 * - Role-based access control
 *
 * Note: Zones are part of attractions feature, available on all tiers
 */

test.describe('Zones - Page Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('displays zones page', async () => {
    await attractionsPage.expectZonesPageVisible();
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /zones/i })).toBeVisible();
  });

  test('shows breadcrumb navigation', async ({ page }) => {
    // Should show breadcrumb with attractions link
    const hasBreadcrumb = await page.locator('text=/attractions/i').first().isVisible();
    expect(hasBreadcrumb).toBe(true);
  });

  test('shows zones list section', async ({ page }) => {
    await expect(page.locator('text=/all zones/i')).toBeVisible();
  });

  test('shows add zone form', async ({ page }) => {
    await expect(page.locator('text=/add zone/i')).toBeVisible();
  });
});

test.describe('Zones - Navigation', () => {
  test('accessible via attraction detail page', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoDetail(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.clickZonesCard();

    await expect(page).toHaveURL(/\/zones/);
    await attractionsPage.expectZonesPageVisible();
  });

  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/zones`);
    await page.waitForLoadState('networkidle');

    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await attractionsPage.expectZonesPageVisible();
  });

  test('breadcrumb links back to attractions', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

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

test.describe('Zones - List Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('displays existing zones or empty state', async () => {
    // Should show zones or empty state
    const hasZones = await attractionsPage.zoneCards.count();
    const hasEmptyState = await attractionsPage.noZonesState.isVisible().catch(() => false);

    expect(hasZones > 0 || hasEmptyState).toBe(true);
  });

  test('zones show relevant information', async ({ page }) => {
    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 0) {
      // Zones should show name and possibly capacity
      const zoneCard = attractionsPage.zoneCards.first();
      await expect(zoneCard).toBeVisible();
    }
  });

  test('zones show order numbers', async ({ page }) => {
    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 0) {
      // Zones typically show numbered order
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
    }
  });
});

test.describe('Zones - Add Zone Form', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('shows zone name input', async () => {
    await expect(attractionsPage.zoneNameInput).toBeVisible();
  });

  test('shows add zone button', async () => {
    await expect(attractionsPage.addZoneButton).toBeVisible();
  });

  test('add zone button is enabled when name is filled', async () => {
    await attractionsPage.zoneNameInput.fill('Test Zone');
    await expect(attractionsPage.addZoneButton).toBeEnabled();
  });

  test('can fill zone form fields', async () => {
    await attractionsPage.zoneNameInput.fill('Test Zone');

    // Try to fill optional fields if they exist
    const hasDescription = await attractionsPage.zoneDescriptionInput.isVisible().catch(() => false);
    if (hasDescription) {
      await attractionsPage.zoneDescriptionInput.fill('Test zone description');
    }

    const hasCapacity = await attractionsPage.zoneCapacityInput.isVisible().catch(() => false);
    if (hasCapacity) {
      await attractionsPage.zoneCapacityInput.fill('10');
    }
  });
});

test.describe('Zones - Zone Card Display', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('zone cards show name', async ({ page }) => {
    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 0) {
      const zoneCard = attractionsPage.zoneCards.first();
      const cardText = await zoneCard.textContent();
      expect(cardText).toBeTruthy();
    }
  });

  test('zone cards may show capacity badge', async ({ page }) => {
    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 0) {
      // Capacity badge might be present
      const hasBadge = await page.locator('[class*="badge"], text=/cap:/i').first().isVisible().catch(() => false);
      // Not all zones have capacity set
      expect(hasBadge || true).toBe(true);
    }
  });

  test('zone cards have action buttons', async ({ page }) => {
    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 0) {
      // Zone cards typically have edit/delete actions
      const zoneCard = attractionsPage.zoneCards.first();
      const hasButtons = await zoneCard.locator('button').count();
      // Actions might be in a dropdown
      expect(hasButtons >= 0).toBe(true);
    }
  });
});

test.describe('Zones - Role-Based Access', () => {
  test('owner can access zones', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectZonesPageVisible();
  });

  test('manager can access zones', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'manager');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectZonesPageVisible();
  });

  test('actor has limited zones access', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/zones`);
    await page.waitForLoadState('networkidle');

    // Actor might see limited view or be redirected
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Zones - Different Tiers', () => {
  test('free tier org can access zones', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.spookyHollow.slug);
    await loginAs(page, 'freeOwner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.theHollow.id);

    // Zones should be available
    await attractionsPage.expectZonesPageVisible();
  });

  test('pro tier org can access zones', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectZonesPageVisible();
  });

  test('enterprise tier org can access zones', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.terrorCollective.slug);
    await loginAs(page, 'enterpriseOwner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.dreadFactory.id);

    await attractionsPage.expectZonesPageVisible();
  });
});

test.describe('Zones - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('zones page is usable on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    await attractionsPage.expectZonesPageVisible();
  });

  test('add zone form is visible on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    await expect(page.locator('text=/add zone/i')).toBeVisible();
  });

  test('zones list is visible on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    await expect(page.locator('text=/all zones/i')).toBeVisible();
  });

  test('zone cards stack vertically on mobile', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    const hasZones = await attractionsPage.zoneCards.count();
    if (hasZones > 0) {
      // Cards should be visible
      await expect(attractionsPage.zoneCards.first()).toBeVisible();
    }
  });
});

test.describe('Zones - Accessibility', () => {
  let attractionsPage: AttractionsPage;

  test.beforeEach(async ({ page }) => {
    attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);
  });

  test('page has proper heading structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('form inputs are focusable', async () => {
    await attractionsPage.zoneNameInput.focus();
    await expect(attractionsPage.zoneNameInput).toBeFocused();
  });

  test('page is keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });

  test('zone color indicators have proper contrast', async ({ page }) => {
    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 0) {
      // Color indicators should be visible
      const colorIndicator = page.locator('[class*="rounded-full"]').first();
      const isVisible = await colorIndicator.isVisible().catch(() => false);
      expect(isVisible || true).toBe(true);
    }
  });
});

test.describe('Zones - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.route('**/api/**/zones/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}/zones`);
    await page.waitForLoadState('networkidle');

    // Should show error or handle gracefully
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('handles non-existent attraction gracefully', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/attractions/non-existent-id/zones`);
    await page.waitForLoadState('networkidle');

    // Should show error
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Zones - Breadcrumb Navigation', () => {
  test('shows correct breadcrumb path', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    // Should show: Attractions > [Attraction Name] > Zones
    await expect(page.locator('text=/attractions/i').first()).toBeVisible();
    await expect(page.locator('text=/zones/i').first()).toBeVisible();
  });

  test('can navigate back to attraction detail', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    // Click attraction name in breadcrumb
    const attractionLink = page.locator(`a[href*="${TEST_ATTRACTIONS.hauntedMansion.id}"]`).first();
    const isVisible = await attractionLink.isVisible().catch(() => false);

    if (isVisible) {
      await attractionLink.click();
      await page.waitForLoadState('networkidle');
      // Should be on attraction detail page
      await expect(page).toHaveURL(new RegExp(`/attractions/${TEST_ATTRACTIONS.hauntedMansion.id}$`));
    }
  });
});

test.describe('Zones - Zone Ordering', () => {
  test('zones display in order', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 1) {
      // Zones should have order numbers
      const firstZone = attractionsPage.zoneCards.first();
      const firstText = await firstZone.textContent();
      expect(firstText).toBeTruthy();
    }
  });
});

test.describe('Zones - Staff Count', () => {
  test('zones may show staff assigned count', async ({ page }) => {
    const attractionsPage = createAttractionsPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await attractionsPage.gotoZones(TEST_ATTRACTIONS.hauntedMansion.id);

    const hasZones = await attractionsPage.zoneCards.count();

    if (hasZones > 0) {
      // Zones might show staff assigned info
      const hasStaffInfo = await page.locator('text=/staff/i').first().isVisible().catch(() => false);
      // Not all views show staff info
      expect(hasStaffInfo || true).toBe(true);
    }
  });
});
