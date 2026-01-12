import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Signup Page Object
 *
 * Encapsulates all interactions with the signup page.
 */
export class SignupPage extends BasePage {
  // ============================================================================
  // Locators
  // ============================================================================

  get fullNameInput(): Locator {
    return this.page.locator('input[name="fullName"]');
  }

  get emailInput(): Locator {
    return this.page.locator('input[name="email"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('input[name="password"]');
  }

  get submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  get loginLink(): Locator {
    return this.page.getByRole('link', { name: /log.*in|sign.*in|already.*account/i });
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], [data-testid="error-message"], .text-destructive');
  }

  get successMessage(): Locator {
    return this.page.locator('[role="alert"], [data-testid="success-message"]').filter({
      hasText: /check.*email|confirmation.*link|verify/i,
    });
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to the signup page
   */
  async goto(): Promise<void> {
    await super.goto(ROUTES.auth.signup);
  }

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
    await this.waitForUrl(ROUTES.auth.login);
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Fill the full name field
   */
  async fillFullName(name: string): Promise<void> {
    await this.fullNameInput.fill(name);
  }

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
   * Submit the signup form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Complete signup flow with all required fields
   *
   * @example
   * ```ts
   * await signupPage.signup('John Doe', 'john@example.com', 'password123');
   * ```
   */
  async signup(
    fullName: string,
    email: string,
    password: string,
    options?: { waitForSuccess?: boolean }
  ): Promise<void> {
    await this.fillFullName(fullName);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();

    if (options?.waitForSuccess !== false) {
      // Wait for either success message or error
      await this.page.waitForSelector(
        '[role="alert"], [data-testid="success-message"], [data-testid="error-message"]',
        { timeout: TIMEOUTS.standard }
      );
    }
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert that the signup page is displayed
   */
  async expectSignupPage(): Promise<void> {
    await expect(this.fullNameInput).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.emailInput).toBeVisible();
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
   * Assert that success message is displayed (check email for confirmation)
   */
  async expectSignupSuccess(): Promise<void> {
    // Look for success message about checking email
    const successIndicator = this.page.locator('[role="alert"], .text-green-600, .text-success');
    await expect(successIndicator.first()).toBeVisible({ timeout: TIMEOUTS.standard });
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
}

/**
 * Create a SignupPage instance
 *
 * @example
 * ```ts
 * const signupPage = createSignupPage(page);
 * await signupPage.goto();
 * await signupPage.signup('John Doe', 'john@example.com', 'password123');
 * ```
 */
export function createSignupPage(page: Page): SignupPage {
  return new SignupPage(page);
}
