import { type Page, type Locator } from '@playwright/test';

/**
 * Selector strategies for E2E tests
 *
 * Priority order:
 * 1. data-testid (most reliable)
 * 2. Role-based (accessible and semantic)
 * 3. Text content (user-facing, but can change)
 * 4. CSS selectors (last resort)
 */

/**
 * Get element by data-testid attribute
 *
 * @example
 * ```ts
 * await byTestId(page, 'login-button').click();
 * ```
 */
export function byTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Common form selectors
 */
export const forms = {
  /** Get input by name attribute */
  input: (page: Page, name: string): Locator =>
    page.locator(`input[name="${name}"]`),

  /** Get textarea by name attribute */
  textarea: (page: Page, name: string): Locator =>
    page.locator(`textarea[name="${name}"]`),

  /** Get select by name attribute */
  select: (page: Page, name: string): Locator =>
    page.locator(`select[name="${name}"]`),

  /** Get submit button */
  submitButton: (page: Page): Locator =>
    page.locator('button[type="submit"]'),

  /** Get form by data-testid or first form */
  form: (page: Page, testId?: string): Locator =>
    testId ? byTestId(page, testId) : page.locator('form').first(),

  /** Get error message for a field */
  fieldError: (page: Page, fieldName: string): Locator =>
    page.locator(`[data-testid="${fieldName}-error"], [id="${fieldName}-error"]`),
};

/**
 * Common navigation selectors
 */
export const nav = {
  /** Get sidebar navigation */
  sidebar: (page: Page): Locator =>
    page.locator('[data-testid="sidebar"], nav[aria-label="Sidebar"]'),

  /** Get nav link by text */
  link: (page: Page, text: string): Locator =>
    page.getByRole('link', { name: text }),

  /** Get nav button by text */
  button: (page: Page, text: string): Locator =>
    page.getByRole('button', { name: text }),

  /** Get breadcrumb */
  breadcrumb: (page: Page): Locator =>
    page.locator('[data-testid="breadcrumb"], nav[aria-label="Breadcrumb"]'),
};

/**
 * Common table selectors
 */
export const table = {
  /** Get table by testid or first table */
  table: (page: Page, testId?: string): Locator =>
    testId ? byTestId(page, testId) : page.locator('table').first(),

  /** Get table rows (tbody tr) */
  rows: (page: Page, testId?: string): Locator =>
    table.table(page, testId).locator('tbody tr'),

  /** Get specific row by index (0-based) */
  row: (page: Page, index: number, testId?: string): Locator =>
    table.rows(page, testId).nth(index),

  /** Get cell by row and column index */
  cell: (page: Page, rowIndex: number, colIndex: number, testId?: string): Locator =>
    table.row(page, rowIndex, testId).locator('td').nth(colIndex),

  /** Get header cells */
  headers: (page: Page, testId?: string): Locator =>
    table.table(page, testId).locator('thead th'),
};

/**
 * Common modal/dialog selectors
 */
export const modal = {
  /** Get modal by testid or role */
  dialog: (page: Page, testId?: string): Locator =>
    testId ? byTestId(page, testId) : page.getByRole('dialog'),

  /** Get modal title */
  title: (page: Page, testId?: string): Locator =>
    modal.dialog(page, testId).locator('[data-testid="modal-title"], h2').first(),

  /** Get close button */
  closeButton: (page: Page, testId?: string): Locator =>
    modal.dialog(page, testId).locator('[data-testid="modal-close"], button[aria-label*="close" i]'),

  /** Get primary action button (usually "Save", "Confirm", etc.) */
  primaryButton: (page: Page, testId?: string): Locator =>
    modal.dialog(page, testId).locator('button[type="submit"], [data-testid="modal-confirm"]'),

  /** Get cancel button */
  cancelButton: (page: Page, testId?: string): Locator =>
    modal.dialog(page, testId).locator('[data-testid="modal-cancel"], button:has-text("Cancel")'),
};

/**
 * Common toast/notification selectors
 */
export const toast = {
  /** Get all visible toasts */
  all: (page: Page): Locator =>
    page.locator('[data-testid="toast"], [role="alert"], .toast'),

  /** Get toast by type */
  byType: (page: Page, type: 'success' | 'error' | 'warning' | 'info'): Locator =>
    page.locator(`[data-testid="toast-${type}"], [data-type="${type}"]`),

  /** Get toast close button */
  closeButton: (page: Page): Locator =>
    toast.all(page).locator('button[aria-label*="close" i], button[aria-label*="dismiss" i]'),
};

/**
 * Common card selectors
 */
export const card = {
  /** Get card by testid */
  byTestId: (page: Page, testId: string): Locator =>
    byTestId(page, testId),

  /** Get all cards with a specific class/pattern */
  all: (page: Page, pattern?: string): Locator =>
    page.locator(pattern ? `[data-testid*="${pattern}"]` : '[data-testid*="card"]'),
};

/**
 * Common dropdown/menu selectors
 */
export const dropdown = {
  /** Get dropdown trigger button */
  trigger: (page: Page, testId?: string): Locator =>
    testId
      ? byTestId(page, testId)
      : page.locator('[data-testid*="dropdown-trigger"], [aria-haspopup="menu"]'),

  /** Get dropdown menu content */
  menu: (page: Page): Locator =>
    page.locator('[role="menu"], [data-testid="dropdown-menu"]'),

  /** Get menu item by text */
  item: (page: Page, text: string): Locator =>
    dropdown.menu(page).getByRole('menuitem', { name: text }),
};

/**
 * Loading state selectors
 */
export const loading = {
  /** Check if page has loading indicator */
  indicator: (page: Page): Locator =>
    page.locator('[data-testid="loading"], .loading, [aria-busy="true"]'),

  /** Get skeleton loaders */
  skeleton: (page: Page): Locator =>
    page.locator('.skeleton, [data-testid*="skeleton"]'),

  /** Get spinner */
  spinner: (page: Page): Locator =>
    page.locator('.spinner, [data-testid="spinner"], svg.animate-spin'),
};

/**
 * Authentication-specific selectors
 */
export const auth = {
  /** Login form email input */
  emailInput: (page: Page): Locator => forms.input(page, 'email'),

  /** Login form password input */
  passwordInput: (page: Page): Locator => forms.input(page, 'password'),

  /** Login submit button */
  loginButton: (page: Page): Locator =>
    page.locator('button[type="submit"]:has-text("Log in"), button[type="submit"]:has-text("Sign in")'),

  /** Signup submit button */
  signupButton: (page: Page): Locator =>
    page.locator('button[type="submit"]:has-text("Sign up"), button[type="submit"]:has-text("Create account")'),

  /** Logout button/link */
  logoutButton: (page: Page): Locator =>
    page.locator('button:has-text("Log out"), a:has-text("Log out"), button:has-text("Sign out")'),
};
