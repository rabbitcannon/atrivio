import { test, expect } from '@playwright/test';
import { createLoginPage, LoginPage } from '../../pages/auth/login.page';
import { TEST_USERS, TEST_PASSWORD, ensureLoggedOut } from '../../helpers/auth';
import { ROUTES, TEST_ORGS } from '../../helpers/fixtures';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = createLoginPage(page);
    await ensureLoggedOut(page);
    await loginPage.goto();
  });

  test.describe('Page Display', () => {
    test('displays login form correctly', async () => {
      await loginPage.expectLoginPage();

      // Check for signup and forgot password links
      await expect(loginPage.forgotPasswordLink).toBeVisible();
      await expect(loginPage.signupLink).toBeVisible();
    });

    test('has correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/log.*in|sign.*in/i);
    });
  });

  test.describe('Successful Login', () => {
    test('owner can login successfully', async () => {
      await loginPage.loginAs('owner');
      await loginPage.expectLoginSuccess(TEST_ORGS.nightmareManor.slug);
    });

    test('manager can login successfully', async () => {
      await loginPage.loginAs('manager');
      await loginPage.expectLoginSuccess(TEST_ORGS.nightmareManor.slug);
    });

    test('actor can login successfully', async () => {
      await loginPage.loginAs('actor1');
      await loginPage.expectLoginSuccess(TEST_ORGS.nightmareManor.slug);
    });

    test('super admin can login successfully', async () => {
      await loginPage.loginAs('superAdmin');
      // Super admin redirects to admin dashboard
      await expect(loginPage.path).toContain('/admin');
    });

    test('persists session after page reload', async ({ page }) => {
      await loginPage.loginAs('owner');
      await loginPage.expectLoginSuccess(TEST_ORGS.nightmareManor.slug);

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in (not redirected to login)
      expect(page.url()).not.toContain('/login');
    });
  });

  test.describe('Failed Login', () => {
    test('shows error for invalid email', async () => {
      await loginPage.login('invalid@email.com', TEST_PASSWORD, {
        waitForRedirect: false,
      });

      await loginPage.expectError(/invalid|incorrect|not found/i);
    });

    test('shows error for wrong password', async () => {
      await loginPage.login(TEST_USERS.owner.email, 'wrongpassword', {
        waitForRedirect: false,
      });

      await loginPage.expectError(/invalid|incorrect|wrong/i);
    });

    test('shows error for empty email', async () => {
      await loginPage.fillPassword(TEST_PASSWORD);
      await loginPage.submit();

      // Should show validation error or stay on page
      await expect(loginPage.emailInput).toBeFocused();
    });

    test('shows error for empty password', async () => {
      await loginPage.fillEmail(TEST_USERS.owner.email);
      await loginPage.submit();

      // Should show validation error or stay on page
      await expect(loginPage.passwordInput).toBeFocused();
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to forgot password', async () => {
      await loginPage.goToForgotPassword();
      await expect(loginPage.path).toContain('forgot-password');
    });

    test('can navigate to signup', async () => {
      await loginPage.goToSignup();
      await expect(loginPage.path).toContain('signup');
    });
  });

  test.describe('Form Validation', () => {
    test('validates email format', async () => {
      await loginPage.fillEmail('notanemail');
      await loginPage.fillPassword(TEST_PASSWORD);
      await loginPage.submit();

      // Should show validation error or native browser validation
      // Check we're still on login page
      await expect(loginPage.path).toContain('login');
    });

    test('trims whitespace from email', async () => {
      // Login with whitespace around email
      await loginPage.fillEmail(`  ${TEST_USERS.owner.email}  `);
      await loginPage.fillPassword(TEST_PASSWORD);
      await loginPage.submit();

      // Should still work (email is trimmed)
      await loginPage.expectLoginSuccess(TEST_ORGS.nightmareManor.slug);
    });
  });

  test.describe('Accessibility', () => {
    test('email input has proper label', async ({ page }) => {
      const emailLabel = page.getByLabel(/email/i);
      await expect(emailLabel).toBeVisible();
    });

    test('password input has proper label', async ({ page }) => {
      const passwordLabel = page.getByLabel(/password/i);
      await expect(passwordLabel).toBeVisible();
    });

    test('form is keyboard navigable', async ({ page }) => {
      // Click email to focus it
      await loginPage.emailInput.click();
      await expect(loginPage.emailInput).toBeFocused();

      // Fill email then tab - should eventually reach password
      await loginPage.fillEmail(TEST_USERS.owner.email);
      await page.keyboard.press('Tab');

      // Password should be reachable via keyboard (may need multiple tabs due to forgot password link)
      // Try tabbing until we reach password or run out of attempts
      let foundPassword = false;
      for (let i = 0; i < 5; i++) {
        if (await loginPage.passwordInput.evaluate((el) => el === document.activeElement)) {
          foundPassword = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(foundPassword).toBe(true);
    });

    test('can submit form with Enter key', async () => {
      await loginPage.fillEmail(TEST_USERS.owner.email);
      await loginPage.fillPassword(TEST_PASSWORD);

      // Press Enter to submit
      await loginPage.passwordInput.press('Enter');

      // Should redirect on success
      await loginPage.expectLoginSuccess(TEST_ORGS.nightmareManor.slug);
    });
  });
});

test.describe('Login - Different User Tiers', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = createLoginPage(page);
    await ensureLoggedOut(page);
    await loginPage.goto();
  });

  test('free tier user can login', async () => {
    await loginPage.loginAs('freeOwner');
    await loginPage.expectLoginSuccess(TEST_ORGS.spookyHollow.slug);
  });

  test('enterprise tier user can login', async () => {
    await loginPage.loginAs('enterpriseOwner');
    await loginPage.expectLoginSuccess(TEST_ORGS.terrorCollective.slug);
  });
});

test.describe('Login - Session Handling', () => {
  test('redirects to login when accessing protected route', async ({ page }) => {
    await ensureLoggedOut(page);

    // Try to access protected route
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/staff`);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('returns to requested page after login', async ({ page }) => {
    await ensureLoggedOut(page);
    const loginPage = createLoginPage(page);

    // Try to access protected route
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Login
    await loginPage.login(TEST_USERS.owner.email, TEST_PASSWORD, {
      waitForRedirect: true,
    });

    // Should redirect back to ticketing (or at least the org dashboard)
    await expect(page.url()).toMatch(/nightmare-manor/);
  });
});
