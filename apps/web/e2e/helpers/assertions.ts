import { type Page, expect } from '@playwright/test';
import { toast, loading, byTestId } from './selectors';
import { TIMEOUTS } from './fixtures';

/**
 * Common assertion helpers for E2E tests
 */

/**
 * Assert that a toast notification appears with the given message
 *
 * @example
 * ```ts
 * await expectToast(page, 'Successfully saved');
 * await expectToast(page, 'Error occurred', 'error');
 * ```
 */
export async function expectToast(
  page: Page,
  message: string | RegExp,
  type?: 'success' | 'error' | 'warning' | 'info',
  options?: { timeout?: number }
): Promise<void> {
  const toastLocator = type ? toast.byType(page, type) : toast.all(page);

  if (typeof message === 'string') {
    await expect(toastLocator.filter({ hasText: message })).toBeVisible({
      timeout: options?.timeout ?? TIMEOUTS.standard,
    });
  } else {
    await expect(toastLocator.filter({ hasText: message })).toBeVisible({
      timeout: options?.timeout ?? TIMEOUTS.standard,
    });
  }
}

/**
 * Assert that the page redirects to a specific URL
 *
 * @example
 * ```ts
 * await expectRedirect(page, '/dashboard');
 * await expectRedirect(page, /\/org\/[a-z-]+/);
 * ```
 */
export async function expectRedirect(
  page: Page,
  url: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  await page.waitForURL(url, { timeout: options?.timeout ?? TIMEOUTS.standard });
}

/**
 * Assert that a form field shows an error message
 *
 * @example
 * ```ts
 * await expectFormError(page, 'email', 'Email is required');
 * ```
 */
export async function expectFormError(
  page: Page,
  fieldName: string,
  errorMessage: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  // Try multiple common error element patterns
  const errorLocators = [
    page.locator(`[data-testid="${fieldName}-error"]`),
    page.locator(`[id="${fieldName}-error"]`),
    page.locator(`[aria-describedby="${fieldName}-error"]`).locator('..').locator('[role="alert"]'),
    page.locator(`input[name="${fieldName}"]`).locator('..').locator('[role="alert"]'),
    page.locator(`input[name="${fieldName}"]`).locator('..').locator('.text-destructive, .text-red-500'),
  ];

  for (const locator of errorLocators) {
    const count = await locator.count();
    if (count > 0) {
      await expect(locator.first()).toContainText(errorMessage, {
        timeout: options?.timeout ?? TIMEOUTS.fast,
      });
      return;
    }
  }

  // Fallback: look for any element with the error text near the field
  const fieldLocator = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
  const parentForm = fieldLocator.locator('xpath=ancestor::form');
  await expect(parentForm.locator(`text=${errorMessage}`)).toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.fast,
  });
}

/**
 * Assert that the page is no longer loading
 *
 * @example
 * ```ts
 * await expectPageLoaded(page);
 * ```
 */
export async function expectPageLoaded(
  page: Page,
  options?: { timeout?: number }
): Promise<void> {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle', {
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });

  // Wait for any loading indicators to disappear
  const loadingLocator = loading.indicator(page);
  const count = await loadingLocator.count();
  if (count > 0) {
    await expect(loadingLocator.first()).not.toBeVisible({
      timeout: options?.timeout ?? TIMEOUTS.standard,
    });
  }
}

/**
 * Assert that a specific element exists and is visible
 *
 * @example
 * ```ts
 * await expectVisible(page, 'user-menu');
 * ```
 */
export async function expectVisible(
  page: Page,
  testId: string,
  options?: { timeout?: number }
): Promise<void> {
  await expect(byTestId(page, testId)).toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });
}

/**
 * Assert that a specific element does not exist or is hidden
 *
 * @example
 * ```ts
 * await expectNotVisible(page, 'loading-spinner');
 * ```
 */
export async function expectNotVisible(
  page: Page,
  testId: string,
  options?: { timeout?: number }
): Promise<void> {
  await expect(byTestId(page, testId)).not.toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });
}

/**
 * Assert that the current URL matches a pattern
 *
 * @example
 * ```ts
 * await expectUrl(page, '/dashboard');
 * await expectUrl(page, /\/org\/[a-z-]+\/staff/);
 * ```
 */
export async function expectUrl(
  page: Page,
  pattern: string | RegExp
): Promise<void> {
  if (typeof pattern === 'string') {
    expect(page.url()).toContain(pattern);
  } else {
    expect(page.url()).toMatch(pattern);
  }
}

/**
 * Assert that a heading with specific text is visible
 *
 * @example
 * ```ts
 * await expectHeading(page, 'Dashboard');
 * await expectHeading(page, 'Staff', 2);
 * ```
 */
export async function expectHeading(
  page: Page,
  text: string | RegExp,
  level?: 1 | 2 | 3 | 4 | 5 | 6,
  options?: { timeout?: number }
): Promise<void> {
  const headingLocator = level
    ? page.getByRole('heading', { name: text, level })
    : page.getByRole('heading', { name: text });

  await expect(headingLocator).toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });
}

/**
 * Assert that a button with specific text is visible and optionally enabled
 *
 * @example
 * ```ts
 * await expectButton(page, 'Save');
 * await expectButton(page, 'Submit', { enabled: true });
 * ```
 */
export async function expectButton(
  page: Page,
  text: string | RegExp,
  options?: { enabled?: boolean; timeout?: number }
): Promise<void> {
  const buttonLocator = page.getByRole('button', { name: text });

  await expect(buttonLocator).toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });

  if (options?.enabled !== undefined) {
    if (options.enabled) {
      await expect(buttonLocator).toBeEnabled();
    } else {
      await expect(buttonLocator).toBeDisabled();
    }
  }
}

/**
 * Assert that a link with specific text is visible
 *
 * @example
 * ```ts
 * await expectLink(page, 'View Details');
 * ```
 */
export async function expectLink(
  page: Page,
  text: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  await expect(page.getByRole('link', { name: text })).toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });
}

/**
 * Assert that a table has a specific number of rows
 *
 * @example
 * ```ts
 * await expectTableRows(page, 5);
 * await expectTableRows(page, 5, 'users-table');
 * ```
 */
export async function expectTableRows(
  page: Page,
  count: number,
  tableTestId?: string,
  options?: { timeout?: number }
): Promise<void> {
  const tableLocator = tableTestId
    ? byTestId(page, tableTestId)
    : page.locator('table').first();

  await expect(tableLocator.locator('tbody tr')).toHaveCount(count, {
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });
}

/**
 * Assert that a modal/dialog is visible
 *
 * @example
 * ```ts
 * await expectModalOpen(page);
 * await expectModalOpen(page, 'confirm-dialog');
 * ```
 */
export async function expectModalOpen(
  page: Page,
  testId?: string,
  options?: { timeout?: number }
): Promise<void> {
  const modalLocator = testId
    ? byTestId(page, testId)
    : page.getByRole('dialog');

  await expect(modalLocator).toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });
}

/**
 * Assert that a modal/dialog is closed
 *
 * @example
 * ```ts
 * await expectModalClosed(page);
 * ```
 */
export async function expectModalClosed(
  page: Page,
  testId?: string,
  options?: { timeout?: number }
): Promise<void> {
  const modalLocator = testId
    ? byTestId(page, testId)
    : page.getByRole('dialog');

  await expect(modalLocator).not.toBeVisible({
    timeout: options?.timeout ?? TIMEOUTS.standard,
  });
}

/**
 * Assert that an input has a specific value
 *
 * @example
 * ```ts
 * await expectInputValue(page, 'email', 'user@example.com');
 * ```
 */
export async function expectInputValue(
  page: Page,
  inputName: string,
  value: string,
  options?: { timeout?: number }
): Promise<void> {
  await expect(page.locator(`input[name="${inputName}"]`)).toHaveValue(value, {
    timeout: options?.timeout ?? TIMEOUTS.fast,
  });
}
