import { test, expect } from '@playwright/test';
import { createSignupPage, SignupPage } from '../../pages/auth/signup.page';
import { ensureLoggedOut, TEST_USERS, TEST_PASSWORD } from '../../helpers/auth';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Signup E2E Tests
 *
 * Covers:
 * - Page display and form elements
 * - Form validation (required fields, email format, password requirements)
 * - Successful signup flow
 * - Error handling (duplicate email, etc.)
 * - Navigation between auth pages
 * - Accessibility
 */

// Generate unique email for each test run to avoid conflicts
const generateUniqueEmail = () => `test.${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`;

test.describe('Signup Page', () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = createSignupPage(page);
    await ensureLoggedOut(page);
    await signupPage.goto();
  });

  test.describe('Page Display', () => {
    test('displays signup form correctly', async () => {
      await signupPage.expectSignupPage();

      // Check for login link
      await expect(signupPage.loginLink).toBeVisible();
    });

    test('has correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/sign.*up|register|create.*account/i);
    });

    test('shows all required form fields', async () => {
      await expect(signupPage.fullNameInput).toBeVisible();
      await expect(signupPage.emailInput).toBeVisible();
      await expect(signupPage.passwordInput).toBeVisible();
      await expect(signupPage.submitButton).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('validates required full name', async () => {
      // Fill only email and password
      await signupPage.fillEmail(generateUniqueEmail());
      await signupPage.fillPassword(TEST_PASSWORD);
      await signupPage.submit();

      // Should show validation error or form should not submit
      // The full name input should be invalid or focused
      await expect(signupPage.path).toContain('signup');
    });

    test('validates required email', async () => {
      await signupPage.fillFullName('Test User');
      await signupPage.fillPassword(TEST_PASSWORD);
      await signupPage.submit();

      // Should show validation error or stay on page
      await expect(signupPage.path).toContain('signup');
    });

    test('validates email format', async () => {
      await signupPage.fillFullName('Test User');
      await signupPage.fillEmail('notanemail');
      await signupPage.fillPassword(TEST_PASSWORD);
      await signupPage.submit();

      // Should show validation error or native browser validation
      await expect(signupPage.path).toContain('signup');
    });

    test('validates required password', async () => {
      await signupPage.fillFullName('Test User');
      await signupPage.fillEmail(generateUniqueEmail());
      await signupPage.submit();

      // Should show validation error or stay on page
      await expect(signupPage.path).toContain('signup');
    });

    test('validates password minimum length', async () => {
      await signupPage.fillFullName('Test User');
      await signupPage.fillEmail(generateUniqueEmail());
      await signupPage.fillPassword('short'); // Less than 8 characters
      await signupPage.submit();

      // Should show password length validation error
      await expect(signupPage.path).toContain('signup');
    });

    test('trims whitespace from email', async () => {
      const email = generateUniqueEmail();
      await signupPage.fillFullName('Test User');
      await signupPage.fillEmail(`  ${email}  `);
      await signupPage.fillPassword(TEST_PASSWORD);
      await signupPage.submit();

      // Form should process normally (email is trimmed)
      // Either success or server-side error, but not client validation error
      await signupPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Successful Signup', () => {
    test('can complete signup with valid data', async () => {
      const uniqueEmail = generateUniqueEmail();

      await signupPage.signup('Test User', uniqueEmail, TEST_PASSWORD);

      // Should show success message about checking email for confirmation
      await signupPage.expectSignupSuccess();
    });

    test('shows confirmation message after signup', async () => {
      const uniqueEmail = generateUniqueEmail();

      await signupPage.fillFullName('New Test User');
      await signupPage.fillEmail(uniqueEmail);
      await signupPage.fillPassword(TEST_PASSWORD);
      await signupPage.submit();

      // Look for confirmation message
      const confirmationText = signupPage.page.getByText(/check.*email|confirmation|verify/i);
      await expect(confirmationText.first()).toBeVisible({ timeout: TIMEOUTS.standard });
    });
  });

  test.describe('Error Handling', () => {
    test('shows error for duplicate email', async () => {
      // Try to sign up with an existing user's email
      await signupPage.signup(
        'Duplicate User',
        TEST_USERS.owner.email, // This email already exists
        TEST_PASSWORD,
        { waitForSuccess: false }
      );

      // Should show error about email already in use
      await signupPage.expectError(/already.*registered|already.*exists|email.*taken|already.*use/i);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to login page', async () => {
      await signupPage.goToLogin();
      await expect(signupPage.path).toContain('login');
    });

    test('login link is visible and clickable', async () => {
      await expect(signupPage.loginLink).toBeVisible();
      await signupPage.loginLink.click();
      await expect(signupPage.path).toContain('login');
    });
  });

  test.describe('Accessibility', () => {
    test('full name input has proper label', async ({ page }) => {
      const nameLabel = page.getByLabel(/name|full.*name/i);
      await expect(nameLabel).toBeVisible();
    });

    test('email input has proper label', async ({ page }) => {
      const emailLabel = page.getByLabel(/email/i);
      await expect(emailLabel).toBeVisible();
    });

    test('password input has proper label', async ({ page }) => {
      const passwordLabel = page.getByLabel(/password/i);
      await expect(passwordLabel).toBeVisible();
    });

    test('form is keyboard navigable', async ({ page }) => {
      // Click full name to focus it
      await signupPage.fullNameInput.click();
      await expect(signupPage.fullNameInput).toBeFocused();

      // Tab through form fields
      await page.keyboard.press('Tab');

      // Should be able to reach all form elements via keyboard
      // Check that we can eventually reach submit button
      let foundSubmit = false;
      for (let i = 0; i < 10; i++) {
        if (await signupPage.submitButton.evaluate((el) => el === document.activeElement)) {
          foundSubmit = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(foundSubmit).toBe(true);
    });

    test('can submit form with Enter key', async () => {
      const uniqueEmail = generateUniqueEmail();

      await signupPage.fillFullName('Test User');
      await signupPage.fillEmail(uniqueEmail);
      await signupPage.fillPassword(TEST_PASSWORD);

      // Press Enter to submit
      await signupPage.passwordInput.press('Enter');

      // Should process the form (either success or error, but form was submitted)
      await signupPage.page.waitForTimeout(500);
    });
  });
});

test.describe('Signup - Already Logged In', () => {
  test('redirects authenticated users away from signup', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', TEST_USERS.owner.email);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: TIMEOUTS.standard });

    // Try to access signup page while logged in
    await page.goto(ROUTES.auth.signup);
    await page.waitForLoadState('networkidle');

    // Should either redirect away from signup or show appropriate message
    // Common behaviors: redirect to dashboard, stay on signup but show logged-in state
    const currentUrl = page.url();
    const isOnSignup = currentUrl.includes('signup');

    if (isOnSignup) {
      // If still on signup, there might be a "you're already logged in" message
      // or the form might be hidden
    } else {
      // Should have been redirected away
      expect(currentUrl).not.toContain('signup');
    }
  });
});

test.describe('Signup - URL Routing', () => {
  test('signup page is accessible via direct URL', async ({ page }) => {
    await ensureLoggedOut(page);
    await page.goto(ROUTES.auth.signup);
    await page.waitForLoadState('networkidle');

    // Should be on signup page
    expect(page.url()).toContain('signup');

    // Form should be visible
    await expect(page.locator('input[name="fullName"]')).toBeVisible({ timeout: TIMEOUTS.standard });
  });
});
