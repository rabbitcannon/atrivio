import { test, expect, type Page } from '@playwright/test';
import path from 'path';

/**
 * Documentation Screenshot Automation
 *
 * This test file captures screenshots for the documentation site.
 * Screenshots are saved to public/docs/screenshots/ for use in MDX files.
 *
 * Run: pnpm --filter @haunt/web screenshots
 */

const SCREENSHOT_DIR = path.join(__dirname, '../../public/docs/screenshots');

// Test account credentials from seed data
// Password for ALL test users: "password123"
const TEST_CREDENTIALS = {
  owner: { email: 'owner@haunt.dev', password: 'password123' },
  manager: { email: 'manager1@haunt.dev', password: 'password123' },
  actor: { email: 'actor1@haunt.dev', password: 'password123' },
};

const ORG_SLUG = 'nightmare-manor';

// Helper to login
async function login(page: Page, credentials: { email: string; password: string }) {
  await page.goto('/login');
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');
  // Login redirects to /dashboard, which then redirects to the user's org
  await page.waitForURL(`**/${ORG_SLUG}`, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

// Helper to take screenshot with consistent settings
async function takeScreenshot(page: Page, name: string) {
  // Wait for any animations to complete
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  });
}

test.describe('Getting Started Screenshots', () => {
  test('register page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'register');
  });

  test('login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'login');
  });
});

test.describe('Dashboard Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.owner);
  });

  test('dashboard overview', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'dashboard-overview');
  });

  test('attractions list', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/attractions`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'attractions-list');
  });
});

test.describe('Staff Management Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.owner);
  });

  test('staff list', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/staff`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'staff-list');
  });

  test('invite staff modal', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/staff`);
    await page.waitForLoadState('networkidle');

    // Click invite button if it exists
    const inviteButton = page.getByRole('button', { name: /invite/i });
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
      await page.waitForTimeout(300);
      await takeScreenshot(page, 'invite-staff');
    }
  });
});

test.describe('Time Clock Screenshots', () => {
  test('time clock page', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/time`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'time-clock');
  });
});

test.describe('Scheduling Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.owner);
  });

  test('schedule calendar', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/schedule`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'schedule-calendar');
  });

  test('shift templates', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/schedule/templates`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'shift-templates');
  });
});

test.describe('Ticketing Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.owner);
  });

  test('ticket types', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/ticketing`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'ticket-types');
  });

  test('promo codes', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/ticketing/promo-codes`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Wait for content to render
    await takeScreenshot(page, 'promo-codes');
  });

  test('orders list', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/ticketing/orders`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500); // Wait for content to render
    await takeScreenshot(page, 'orders-list');
  });
});

test.describe('Check-In Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.owner);
  });

  test('check-in page', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/check-in`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'check-in');
  });
});

test.describe('Settings Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.owner);
  });

  test('organization settings', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/settings`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'org-settings');
  });

  test('payments settings', async ({ page }) => {
    await page.goto(`/${ORG_SLUG}/payments`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'payments');
  });

  test('storefront settings', async ({ page }) => {
    // Storefront is under attractions - use first attraction
    await page.goto(`/${ORG_SLUG}/attractions/c0000000-0000-0000-0000-000000000001/storefront`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'storefront');
  });
});

test.describe('Public Storefront Screenshots', () => {
  test('storefront homepage', async ({ page }) => {
    // Public storefront is on port 3002
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'storefront-public');
  });
});
