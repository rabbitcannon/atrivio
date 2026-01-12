import { test, expect } from '@playwright/test';

test.describe('Server Action Session Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@haunt.dev');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|nightmare-manor/, { timeout: 15000 });

    // Go to the debug action page
    await page.goto('/debug-action');
  });

  test('form-based server action has session', async ({ page }) => {
    // Capture server action response
    let actionResponse: string | null = null;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/debug-action') && response.request().method() === 'POST') {
        actionResponse = await response.text();
        console.log('Form Action Response:', actionResponse.substring(0, 500));
      }
    });

    await expect(page.locator('h1')).toHaveText('Debug Server Action');

    // Click the form button to trigger the server action via form submission
    await page.click('button:has-text("Test Session via Form")');
    await page.waitForTimeout(2000);

    console.log('Form action response captured:', actionResponse);
    expect(actionResponse).toBeTruthy();
    expect(actionResponse).toContain('"hasSession":true');
  });

  test('programmatic server action has session', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Debug Server Action');

    // Click the programmatic button
    await page.click('button:has-text("Call Action Programmatically")');

    // Wait for the result to appear
    await page.waitForSelector('pre', { timeout: 10000 });

    const result = await page.locator('pre').textContent();
    console.log('Programmatic action result:', result);

    expect(result).toBeTruthy();
    expect(result).toContain('"hasSession": true');
    expect(result).toContain('"hasAccessToken": true');
  });
});
