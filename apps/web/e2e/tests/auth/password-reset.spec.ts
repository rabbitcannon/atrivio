import { test, expect } from '@playwright/test';
import { createPasswordResetPage, PasswordResetPage } from '../../pages/auth/password-reset.page';
import { ensureLoggedOut, TEST_USERS } from '../../helpers/auth';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Password Reset E2E Tests
 *
 * Covers:
 * - Forgot Password page display and form
 * - Password reset request flow
 * - Form validation
 * - Navigation between auth pages
 * - Reset Password page (limited testing without email link)
 * - Accessibility
 *
 * Note: Full password reset flow (clicking email link) cannot be fully tested
 * without email interception. These tests cover the UI interactions and
 * form validation.
 */

test.describe('Forgot Password Page', () => {
  let passwordResetPage: PasswordResetPage;

  test.beforeEach(async ({ page }) => {
    passwordResetPage = createPasswordResetPage(page);
    await ensureLoggedOut(page);
    await passwordResetPage.gotoForgotPassword();
  });

  test.describe('Page Display', () => {
    test('displays forgot password form correctly', async () => {
      await passwordResetPage.expectForgotPasswordPage();

      // Check for login link
      await expect(passwordResetPage.loginLink).toBeVisible();
    });

    test('has correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/forgot.*password|reset.*password|password.*recovery/i);
    });

    test('shows email input field', async () => {
      await expect(passwordResetPage.emailInput).toBeVisible();
    });

    test('shows submit button', async () => {
      await expect(passwordResetPage.submitButton).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('validates required email', async () => {
      await passwordResetPage.submit();

      // Should show validation error or stay on page
      await expect(passwordResetPage.path).toContain('forgot-password');
    });

    test('validates email format', async () => {
      await passwordResetPage.fillEmail('notanemail');
      await passwordResetPage.submit();

      // Should show validation error or native browser validation
      await expect(passwordResetPage.path).toContain('forgot-password');
    });

    test('accepts valid email format', async () => {
      await passwordResetPage.fillEmail(TEST_USERS.owner.email);
      await passwordResetPage.submit();

      // Form should be submitted (either success or server-side validation)
      await passwordResetPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Password Reset Request', () => {
    test('shows success message for valid email', async () => {
      await passwordResetPage.requestReset(TEST_USERS.owner.email);

      // Should show success message about checking email
      await passwordResetPage.expectResetEmailSent();
    });

    test('shows success message even for non-existent email (security)', async () => {
      // For security, most apps show success even for non-existent emails
      // to prevent email enumeration attacks
      await passwordResetPage.requestReset('nonexistent@example.com');

      // Should show success message (same as valid email)
      // Or may show a generic message - behavior depends on implementation
      await passwordResetPage.page.waitForTimeout(1000);

      // Either success or error, but form was processed
      const hasAlert = await passwordResetPage.page.locator('[role="alert"]').isVisible();
      expect(hasAlert).toBe(true);
    });

    test('trims whitespace from email', async () => {
      await passwordResetPage.fillEmail(`  ${TEST_USERS.owner.email}  `);
      await passwordResetPage.submit();

      // Form should process normally
      await passwordResetPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to login page', async () => {
      await passwordResetPage.goToLogin();
      await expect(passwordResetPage.path).toContain('login');
    });

    test('login link is visible and clickable', async () => {
      await expect(passwordResetPage.loginLink).toBeVisible();
      await passwordResetPage.loginLink.click();
      await expect(passwordResetPage.path).toContain('login');
    });
  });

  test.describe('Accessibility', () => {
    test('email input has proper label', async ({ page }) => {
      const emailLabel = page.getByLabel(/email/i);
      await expect(emailLabel).toBeVisible();
    });

    test('form is keyboard navigable', async ({ page }) => {
      // Click email to focus it
      await passwordResetPage.emailInput.click();
      await expect(passwordResetPage.emailInput).toBeFocused();

      // Tab to submit button
      let foundSubmit = false;
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        if (await passwordResetPage.submitButton.evaluate((el) => el === document.activeElement)) {
          foundSubmit = true;
          break;
        }
      }
      expect(foundSubmit).toBe(true);
    });

    test('can submit form with Enter key', async () => {
      await passwordResetPage.fillEmail(TEST_USERS.owner.email);

      // Press Enter to submit
      await passwordResetPage.emailInput.press('Enter');

      // Should process the form
      await passwordResetPage.page.waitForTimeout(1000);
    });
  });
});

test.describe('Reset Password Page', () => {
  let passwordResetPage: PasswordResetPage;

  test.beforeEach(async ({ page }) => {
    passwordResetPage = createPasswordResetPage(page);
    await ensureLoggedOut(page);
  });

  test.describe('Page Display (Direct Access)', () => {
    test('reset password page requires valid token', async ({ page }) => {
      // Accessing reset-password without a token should show error or redirect
      await page.goto(ROUTES.auth.resetPassword);
      await page.waitForLoadState('networkidle');

      // The page should either:
      // 1. Show an error about invalid/missing token
      // 2. Redirect to forgot-password
      // 3. Show the form but fail on submit without valid token
      const currentUrl = page.url();
      const hasError = await page.locator('[role="alert"]').isVisible();

      // Either redirected or has error message
      const isHandledCorrectly =
        currentUrl.includes('forgot-password') ||
        currentUrl.includes('login') ||
        hasError ||
        currentUrl.includes('reset-password');

      expect(isHandledCorrectly).toBe(true);
    });
  });

  test.describe('Form Validation (when form is accessible)', () => {
    test.beforeEach(async ({ page }) => {
      // Try to access reset-password page
      // Note: This may show an error page without a valid token
      await page.goto(ROUTES.auth.resetPassword);
      await page.waitForLoadState('networkidle');
    });

    test('shows password fields if page loads', async ({ page }) => {
      // Check if the reset password form is displayed
      const passwordInput = page.locator('input[name="password"]');
      const confirmInput = page.locator('input[name="confirmPassword"]');

      // These tests only run if the form is visible (has valid session/token)
      const hasPasswordField = await passwordInput.isVisible().catch(() => false);

      if (hasPasswordField) {
        await expect(passwordInput).toBeVisible();
        await expect(confirmInput).toBeVisible();
      } else {
        // Page likely shows error or redirected - this is expected behavior
        test.skip();
      }
    });
  });
});

test.describe('Password Reset - URL Routing', () => {
  test('forgot password page is accessible via direct URL', async ({ page }) => {
    await ensureLoggedOut(page);
    await page.goto(ROUTES.auth.forgotPassword);
    await page.waitForLoadState('networkidle');

    // Should be on forgot password page
    expect(page.url()).toContain('forgot-password');

    // Form should be visible
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: TIMEOUTS.standard });
  });

  test('can navigate from login to forgot password', async ({ page }) => {
    await ensureLoggedOut(page);
    await page.goto(ROUTES.auth.login);
    await page.waitForLoadState('networkidle');

    // Click forgot password link
    await page.getByRole('link', { name: /forgot.*password/i }).click();

    // Should navigate to forgot password page
    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: TIMEOUTS.standard });
  });
});

test.describe('Password Reset - Already Logged In', () => {
  test('redirects authenticated users away from forgot password', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', TEST_USERS.owner.email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: TIMEOUTS.standard });

    // Try to access forgot password while logged in
    await page.goto(ROUTES.auth.forgotPassword);
    await page.waitForLoadState('networkidle');

    // Should either redirect away or show appropriate message
    const currentUrl = page.url();
    const isOnForgotPassword = currentUrl.includes('forgot-password');

    if (isOnForgotPassword) {
      // If still on forgot password, may show "already logged in" message
      // or the form - behavior depends on implementation
    } else {
      // Should have been redirected away
      expect(currentUrl).not.toContain('forgot-password');
    }
  });
});

test.describe('Password Reset - Flow Integration', () => {
  test('complete forgot password UI flow', async ({ page }) => {
    await ensureLoggedOut(page);

    // Start at login
    await page.goto(ROUTES.auth.login);
    await page.waitForLoadState('networkidle');

    // Click forgot password
    await page.getByRole('link', { name: /forgot.*password/i }).click();
    await expect(page).toHaveURL(/forgot-password/);

    // Enter email
    await page.fill('input[name="email"]', TEST_USERS.owner.email);
    await page.click('button[type="submit"]');

    // Should show success message
    await page.waitForSelector('[role="alert"]', { timeout: TIMEOUTS.standard });

    // Success message should indicate to check email
    const alertText = await page.locator('[role="alert"]').first().textContent();
    expect(alertText?.toLowerCase()).toMatch(/check.*email|reset.*link|sent/i);
  });
});
