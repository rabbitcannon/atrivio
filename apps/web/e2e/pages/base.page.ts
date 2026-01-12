import { type Page, type Locator, expect } from '@playwright/test';
import { TIMEOUTS } from '../helpers/fixtures';
import { byTestId, loading } from '../helpers/selectors';

/**
 * Base Page Object - provides common functionality for all page objects
 *
 * All page objects should extend this class to inherit common methods.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to a path and wait for the page to load
   */
  async goto(path: string, options?: { waitForNetworkIdle?: boolean }): Promise<void> {
    await this.page.goto(path);

    if (options?.waitForNetworkIdle !== false) {
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Get the current URL
   */
  get url(): string {
    return this.page.url();
  }

  /**
   * Get the current path (URL without origin)
   */
  get path(): string {
    return new URL(this.page.url()).pathname;
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
  }

  // ============================================================================
  // Waiting
  // ============================================================================

  /**
   * Wait for the page to finish loading
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a URL pattern
   */
  async waitForUrl(pattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForURL(pattern, {
      timeout: options?.timeout ?? TIMEOUTS.standard,
    });
  }

  /**
   * Wait for loading indicators to disappear
   */
  async waitForLoadingComplete(): Promise<void> {
    const loadingIndicator = loading.indicator(this.page);
    const count = await loadingIndicator.count();

    if (count > 0) {
      await expect(loadingIndicator.first()).not.toBeVisible({
        timeout: TIMEOUTS.standard,
      });
    }
  }

  /**
   * Wait for a specific amount of time (use sparingly!)
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  // ============================================================================
  // Element Queries
  // ============================================================================

  /**
   * Get element by data-testid
   */
  byTestId(testId: string): Locator {
    return byTestId(this.page, testId);
  }

  /**
   * Get element by role
   */
  byRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get element by text
   */
  byText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by label
   */
  byLabel(text: string | RegExp): Locator {
    return this.page.getByLabel(text);
  }

  /**
   * Get element by placeholder
   */
  byPlaceholder(text: string | RegExp): Locator {
    return this.page.getByPlaceholder(text);
  }

  // ============================================================================
  // Common Elements
  // ============================================================================

  /**
   * Get the page heading (h1)
   */
  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  /**
   * Get all headings of a specific level
   */
  headings(level: 1 | 2 | 3 | 4 | 5 | 6): Locator {
    return this.page.getByRole('heading', { level });
  }

  /**
   * Get a button by name
   */
  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
  }

  /**
   * Get a link by name
   */
  link(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert that the page has a specific heading
   */
  async expectHeading(text: string | RegExp): Promise<void> {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible({
      timeout: TIMEOUTS.standard,
    });
  }

  /**
   * Assert that the page title matches
   */
  async expectTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * Assert that the URL matches a pattern
   */
  async expectUrl(pattern: string | RegExp): Promise<void> {
    if (typeof pattern === 'string') {
      await expect(this.page).toHaveURL(new RegExp(pattern));
    } else {
      await expect(this.page).toHaveURL(pattern);
    }
  }

  /**
   * Assert that an element is visible
   */
  async expectVisible(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await expect(locator).toBeVisible({
      timeout: options?.timeout ?? TIMEOUTS.standard,
    });
  }

  /**
   * Assert that an element is not visible
   */
  async expectNotVisible(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await expect(locator).not.toBeVisible({
      timeout: options?.timeout ?? TIMEOUTS.standard,
    });
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Click an element
   */
  async click(locator: Locator, options?: { force?: boolean }): Promise<void> {
    await locator.click({ force: options?.force });
  }

  /**
   * Fill an input field
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Clear and fill an input field
   */
  async clearAndFill(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Select an option from a dropdown
   */
  async select(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  /**
   * Check a checkbox or radio button
   */
  async check(locator: Locator): Promise<void> {
    await locator.check();
  }

  /**
   * Uncheck a checkbox
   */
  async uncheck(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  // ============================================================================
  // Screenshot
  // ============================================================================

  /**
   * Take a screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `./e2e/screenshots/${name}.png`,
      fullPage: false,
    });
  }
}
