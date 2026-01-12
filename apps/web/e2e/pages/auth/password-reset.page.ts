import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Password Reset Page Object
 *
 * Covers both:
 * - Forgot Password page (request password reset email)
 * - Reset Password page (set new password after clicking email link)
 */
export class PasswordResetPage extends BasePage {
  // ============================================================================
  // Forgot Password Page Locators
  // ============================================================================

  get emailInput(): Locator {
    return this.page.locator('input[name="email"]');
  }

  get submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  get loginLink(): Locator {
    return this.page.getByRole('link', { name: /log.*in|sign.*in|back.*login/i });
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], [data-testid="error-message"], .text-destructive');
  }

  get successMessage(): Locator {
    return this.page.locator('[role="alert"], [data-testid="success-message"]').filter({
      hasText: /check.*email|reset.*link|password.*reset/i,
    });
  }

  // ============================================================================
  // Reset Password Page Locators (after clicking email link)
  // ============================================================================

  get newPasswordInput(): Locator {
    return this.page.locator('input[name="password"]');
  }

  get confirmPasswordInput(): Locator {
    return this.page.locator('input[name="confirmPassword"]');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to the forgot password page
   */
  async goto(): Promise<void> {
    await super.goto(ROUTES.auth.forgotPassword);
  }

  /**
   * Navigate to the forgot password page
   */
  async gotoForgotPassword(): Promise<void> {
    await super.goto(ROUTES.auth.forgotPassword);
  }

  /**
   * Navigate to reset password page (usually accessed via email link)
   */
  async gotoResetPassword(): Promise<void> {
    await super.goto(ROUTES.auth.resetPassword);
  }

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
    await this.waitForUrl(ROUTES.auth.login);
  }

  // ============================================================================
  // Forgot Password Actions
  // ============================================================================

  /**
   * Fill the email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Submit the forgot password form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Request password reset for an email
   *
   * @example
   * ```ts
   * await passwordResetPage.requestReset('user@example.com');
   * ```
   */
  async requestReset(email: string, options?: { waitForResult?: boolean }): Promise<void> {
    await this.fillEmail(email);
    await this.submit();

    if (options?.waitForResult !== false) {
      // Wait for either success message or error
      await this.page.waitForSelector(
        '[role="alert"], [data-testid="success-message"], [data-testid="error-message"]',
        { timeout: TIMEOUTS.standard }
      );
    }
  }

  // ============================================================================
  // Reset Password Actions (on reset-password page)
  // ============================================================================

  /**
   * Fill the new password field
   */
  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordInput.fill(password);
  }

  /**
   * Fill the confirm password field
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Set new password (on reset-password page)
   *
   * @example
   * ```ts
   * await passwordResetPage.setNewPassword('newPassword123', 'newPassword123');
   * ```
   */
  async setNewPassword(
    password: string,
    confirmPassword: string,
    options?: { waitForResult?: boolean }
  ): Promise<void> {
    await this.fillNewPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.submit();

    if (options?.waitForResult !== false) {
      // Wait for either success or error
      await this.page.waitForSelector(
        '[role="alert"], [data-testid="success-message"], [data-testid="error-message"]',
        { timeout: TIMEOUTS.standard }
      );
    }
  }

  // ============================================================================
  // Assertions - Forgot Password Page
  // ============================================================================

  /**
   * Assert that the forgot password page is displayed
   */
  async expectForgotPasswordPage(): Promise<void> {
    await expect(this.emailInput).toBeVisible({ timeout: TIMEOUTS.standard });
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
   * Assert that success message is displayed (check email)
   */
  async expectResetEmailSent(): Promise<void> {
    // Look for success message about checking email
    const successIndicator = this.page.locator('[role="alert"], .text-green-600, .text-success');
    await expect(successIndicator.first()).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  // ============================================================================
  // Assertions - Reset Password Page
  // ============================================================================

  /**
   * Assert that the reset password page is displayed
   */
  async expectResetPasswordPage(): Promise<void> {
    await expect(this.newPasswordInput).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Assert that password was updated successfully
   */
  async expectPasswordUpdated(): Promise<void> {
    // Look for success message or redirect to login
    const successText = this.page.getByText(/password.*updated|password.*changed|success/i);
    const redirectedToLogin = this.page.url().includes('/login');

    if (!redirectedToLogin) {
      await expect(successText.first()).toBeVisible({ timeout: TIMEOUTS.standard });
    }
  }

  /**
   * Assert that passwords don't match error is shown
   */
  async expectPasswordMismatchError(): Promise<void> {
    await this.expectError(/passwords.*match|confirm.*password/i);
  }
}

/**
 * Create a PasswordResetPage instance
 *
 * @example
 * ```ts
 * const resetPage = createPasswordResetPage(page);
 * await resetPage.gotoForgotPassword();
 * await resetPage.requestReset('user@example.com');
 * ```
 */
export function createPasswordResetPage(page: Page): PasswordResetPage {
  return new PasswordResetPage(page);
}
