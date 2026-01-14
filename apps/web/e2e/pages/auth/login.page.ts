import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';
import { TEST_USERS, TEST_PASSWORD, type TestUserKey } from '../../helpers/auth';

/**
 * Login Page Object
 *
 * Encapsulates all interactions with the login page.
 */
export class LoginPage extends BasePage {
  // ============================================================================
  // Locators
  // ============================================================================

  get emailInput(): Locator {
    return this.page.locator('input[name="email"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('input[name="password"]');
  }

  get submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  get forgotPasswordLink(): Locator {
    return this.page.getByRole('link', { name: /forgot.*password/i });
  }

  get signupLink(): Locator {
    return this.page.getByRole('link', { name: /sign.*up|create.*account|register/i });
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], [data-testid="error-message"], .text-destructive');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to the login page
   */
  override async goto(): Promise<void> {
    await super.goto(ROUTES.auth.login);
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.waitForUrl(ROUTES.auth.forgotPassword);
  }

  /**
   * Navigate to signup page
   */
  async goToSignup(): Promise<void> {
    await this.signupLink.click();
    await this.waitForUrl(ROUTES.auth.signup);
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Fill the email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill the password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the login form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Complete login flow with email and password
   *
   * @example
   * ```ts
   * await loginPage.login('user@example.com', 'password123');
   * ```
   */
  async login(
    email: string,
    password: string,
    options?: { waitForRedirect?: boolean; expectedOrgSlug?: string }
  ): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();

    if (options?.waitForRedirect !== false) {
      if (options?.expectedOrgSlug) {
        await this.waitForUrl(`**/${options.expectedOrgSlug}`, {
          timeout: TIMEOUTS.standard,
        });
      } else {
        // Wait for any dashboard redirect (org slug in URL)
        await this.waitForUrl(/\/[a-z0-9-]+$/, { timeout: TIMEOUTS.standard });
      }
      await this.waitForPageLoad();
    }
  }

  /**
   * Login as a predefined test user
   *
   * @example
   * ```ts
   * await loginPage.loginAs('owner');
   * await loginPage.loginAs('manager');
   * ```
   */
  async loginAs(userKey: TestUserKey): Promise<void> {
    const user = TEST_USERS[userKey];

    // Super admins redirect to /admin instead of an org dashboard
    if (user.role === 'super_admin') {
      await this.fillEmail(user.email);
      await this.fillPassword(TEST_PASSWORD);
      await this.submit();
      await this.waitForUrl('**/admin', { timeout: TIMEOUTS.standard });
      await this.waitForPageLoad();
      return;
    }

    const expectedOrgSlug = 'orgSlug' in user ? user.orgSlug : undefined;
    await this.login(user.email, TEST_PASSWORD, { expectedOrgSlug });
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert that the login page is displayed
   */
  async expectLoginPage(): Promise<void> {
    await expect(this.emailInput).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Assert that an error message is displayed
   */
  async expectError(message?: string | RegExp): Promise<void> {
    await expect(this.errorMessage.first()).toBeVisible({
      timeout: TIMEOUTS.standard,
    });

    if (message) {
      await expect(this.errorMessage.first()).toContainText(message);
    }
  }

  /**
   * Assert that no error message is displayed
   */
  async expectNoError(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  /**
   * Assert that the submit button is disabled
   */
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Assert that the submit button is enabled
   */
  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Assert successful login (redirected to dashboard)
   */
  async expectLoginSuccess(orgSlug?: string): Promise<void> {
    if (orgSlug) {
      await this.expectUrl(`/${orgSlug}`);
    } else {
      await this.expectUrl(/\/[a-z0-9-]+$/);
    }
  }
}

/**
 * Create a LoginPage instance
 *
 * @example
 * ```ts
 * const loginPage = createLoginPage(page);
 * await loginPage.goto();
 * await loginPage.loginAs('owner');
 * ```
 */
export function createLoginPage(page: Page): LoginPage {
  return new LoginPage(page);
}
