import { test, expect } from '@playwright/test';

test('debug session availability', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('input[name="email"]', 'owner@haunt.dev');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or org page
  await page.waitForURL(/dashboard|nightmare-manor/, { timeout: 15000 });

  // Check cookies after login
  const cookies = await page.context().cookies();
  const authCookies = cookies.filter((c) => c.name.includes('auth'));
  console.log(
    'Auth cookies after login:',
    authCookies.map((c) => ({ name: c.name, httpOnly: c.httpOnly, secure: c.secure }))
  );

  // Call the debug API route
  const response = await page.request.get('/api/debug/session');
  const data = await response.json();
  console.log('Debug API Response:', JSON.stringify(data, null, 2));

  // Verify session is available
  expect(data.hasSession).toBe(true);
  expect(data.hasAccessToken).toBe(true);
});
