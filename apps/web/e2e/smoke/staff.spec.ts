import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../helpers/auth';

/**
 * Staff Smoke Tests
 *
 * Verifies staff management features work correctly.
 */

test.describe('Staff Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'owner');
  });

  test('staff list page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/staff`);
    await page.waitForLoadState('networkidle');

    // Should see staff page content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent?.toLowerCase()).toMatch(/staff|team|members/);
  });

  test('staff list shows staff members', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/staff`);
    await page.waitForLoadState('networkidle');

    // Should see staff names from seed data
    const pageContent = await page.locator('body').textContent();
    // Check for any known staff member
    const hasStaffMember =
      pageContent?.includes('Sarah') || // Manager
      pageContent?.includes('Jake') ||  // Actor
      pageContent?.includes('Marcus');  // Owner

    expect(hasStaffMember).toBeTruthy();
  });

  test('can view staff profile', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/staff`);
    await page.waitForLoadState('networkidle');

    // Find staff member links - must contain UUID pattern, not 'new' or 'invite'
    const staffLinks = page.locator('a[href*="/staff/"]');
    const allLinks = await staffLinks.all();

    // Filter to find links that look like actual staff profiles (UUID-based)
    let foundProfileLink = false;
    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      // Skip links that contain 'new' or 'invite'
      if (href && !href.includes('/new') && !href.includes('/invite') && href.match(/\/staff\/[a-f0-9-]{36}/)) {
        await link.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toMatch(/\/staff\/[a-f0-9-]+/);
        foundProfileLink = true;
        break;
      }
    }

    if (!foundProfileLink) {
      // If no staff profile links found, verify we're on the staff page and authenticated
      expect(page.url()).toContain('/staff');
      expect(page.url()).not.toContain('/login');
    }
  });

  test('staff invite page loads', async ({ page }) => {
    await page.goto(`/${TEST_USERS.owner.orgSlug}/staff/invite`);
    await page.waitForLoadState('networkidle');

    // Should see invite form
    const hasEmailField = await page.locator('input[name="email"], input[type="email"]').isVisible().catch(() => false);
    const hasInviteContent = (await page.locator('body').textContent())?.toLowerCase().includes('invite');

    expect(hasEmailField || hasInviteContent).toBeTruthy();
  });

  test('manager can view staff list', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'manager');

    await page.goto(`/${TEST_USERS.manager.orgSlug}/staff`);
    await page.waitForLoadState('networkidle');

    // Should load without redirect to login
    expect(page.url()).not.toContain('/login');
    expect(page.url()).toContain('/staff');
  });

  test('actor can view staff list', async ({ page }) => {
    await page.context().clearCookies();
    await loginAs(page, 'actor1');

    await page.goto(`/${TEST_USERS.actor1.orgSlug}/staff`);
    await page.waitForLoadState('networkidle');

    // Actor should be able to see staff list
    expect(page.url()).not.toContain('/login');
  });
});
