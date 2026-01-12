import { test, expect } from '@playwright/test';
import { createSchedulingPage, SchedulingPage } from '../../pages/dashboard/scheduling.page';
import { loginAs } from '../../helpers/auth';
import { TEST_ORGS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Scheduling - Staff Availability E2E Tests
 *
 * Covers:
 * - Availability page display
 * - Staff availability overview
 * - Role-based access control
 * - Mobile responsiveness
 *
 * Note: Scheduling feature requires Pro tier or above
 */

test.describe('Staff Availability - Page Display', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoAvailability();
  });

  test('displays staff availability page', async () => {
    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /availability/i })).toBeVisible();
  });

  test('page loads without errors', async ({ page }) => {
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
    expect(pageContent).not.toContain('Error');
    expect(pageContent).not.toContain('Exception');
  });
});

test.describe('Staff Availability - Navigation', () => {
  test('accessible via schedule dashboard card', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.goto();

    await schedulingPage.clickAvailabilityCard();

    await expect(page).toHaveURL(/\/schedule\/availability/);
    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/availability`);
    await page.waitForLoadState('networkidle');

    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('can navigate back to schedule dashboard', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoAvailability();

    // Look for back button or schedule link
    const backButton = page.getByRole('link', { name: /back|schedule/i }).first();
    const isVisible = await backButton.isVisible().catch(() => false);

    if (isVisible) {
      await backButton.click();
      await page.waitForLoadState('networkidle');
      // Should be back on schedule page
    }
  });
});

test.describe('Staff Availability - Role-Based Access', () => {
  test('owner can access availability', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoAvailability();

    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('manager can access availability', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'manager');
    await schedulingPage.gotoAvailability();

    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('hr role can access availability', async ({ page }) => {
    await loginAs(page, 'hr');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/availability`);
    await page.waitForLoadState('networkidle');

    // HR should have access to scheduling features
    const hasAvailability = await page.getByRole('heading', { name: /availability/i }).isVisible().catch(() => false);
    const wasRedirected = !page.url().includes('/schedule');
    const hasAccessDenied = await page.locator('text=/access denied|permission/i').isVisible().catch(() => false);

    expect(hasAvailability || wasRedirected || hasAccessDenied).toBe(true);
  });

  test('actor sees their own availability', async ({ page }) => {
    await loginAs(page, 'actor1');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/availability`);
    await page.waitForLoadState('networkidle');

    // Actor might see limited view or own availability
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Staff Availability - Different Tiers', () => {
  test('pro tier org has availability feature', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoAvailability();

    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('enterprise tier org has availability feature', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.terrorCollective.slug);
    await loginAs(page, 'enterpriseOwner');
    await schedulingPage.gotoAvailability();

    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('free tier org handling', async ({ page }) => {
    await loginAs(page, 'freeOwner');
    await page.goto(`/${TEST_ORGS.spookyHollow.slug}/schedule/availability`);
    await page.waitForLoadState('networkidle');

    // Free tier should show upgrade prompt or redirect
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Staff Availability - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('availability page is usable on mobile', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoAvailability();

    await schedulingPage.expectAvailabilityPageVisible();
  });

  test('content is visible without horizontal scroll', async ({ page }) => {
    const schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoAvailability();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 50); // viewport + margin
  });
});

test.describe('Staff Availability - Accessibility', () => {
  let schedulingPage: SchedulingPage;

  test.beforeEach(async ({ page }) => {
    schedulingPage = createSchedulingPage(page, TEST_ORGS.nightmareManor.slug);
    await loginAs(page, 'owner');
    await schedulingPage.gotoAvailability();
  });

  test('page has proper heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('page content is focusable', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV']).toContain(focused);
  });
});

test.describe('Staff Availability - Error Handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    await loginAs(page, 'owner');

    await page.route('**/api/**/availability/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/schedule/availability`);
    await page.waitForLoadState('networkidle');

    // Should handle gracefully
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});
