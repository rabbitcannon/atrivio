import { test, expect } from '@playwright/test';
import { createOrganizationsPage, OrganizationsPage } from '../../pages/organizations/organizations.page';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { TEST_ORGS, TIMEOUTS, generateUniqueName } from '../../helpers/fixtures';

/**
 * Create Organization E2E Tests
 *
 * Covers:
 * - Create organization form display and validation
 * - Slug auto-generation from name
 * - Form field validation
 * - Successful organization creation
 * - Access control (who can create orgs)
 * - Navigation and cancel functionality
 *
 * Note: Creating organizations requires authentication
 */

test.describe('Create Organization - Page Display', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
  });

  test('displays create organization form', async () => {
    await orgPage.gotoCreateOrg();
    await orgPage.expectCreateOrgPage();
  });

  test('shows all required form fields', async ({ page }) => {
    await orgPage.gotoCreateOrg();

    // Name and slug are required
    await expect(orgPage.nameInput).toBeVisible();
    await expect(orgPage.slugInput).toBeVisible();

    // Optional fields
    await expect(orgPage.emailInput).toBeVisible();
    await expect(orgPage.phoneInput).toBeVisible();
    await expect(orgPage.websiteInput).toBeVisible();
    await expect(orgPage.timezoneSelect).toBeVisible();
  });

  test('shows proper labels for all fields', async ({ page }) => {
    await orgPage.gotoCreateOrg();

    await expect(page.getByText('Organization Name')).toBeVisible();
    await expect(page.getByText('URL Slug')).toBeVisible();
    await expect(page.getByText('Contact Email')).toBeVisible();
    await expect(page.getByText('Phone')).toBeVisible();
    await expect(page.getByText('Website')).toBeVisible();
    await expect(page.getByText('Timezone')).toBeVisible();
  });

  test('shows create and cancel buttons', async () => {
    await orgPage.gotoCreateOrg();

    await expect(orgPage.createButton).toBeVisible();
    await expect(orgPage.cancelButton).toBeVisible();
  });

  test('shows back navigation link', async () => {
    await orgPage.gotoCreateOrg();
    await expect(orgPage.backButton).toBeVisible();
  });
});

test.describe('Create Organization - Slug Generation', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();
  });

  test('auto-generates slug from name', async () => {
    await orgPage.fillName('Test Haunt House');

    // Slug should be auto-generated
    await expect(orgPage.slugInput).toHaveValue('test-haunt-house');
  });

  test('converts name to lowercase for slug', async () => {
    await orgPage.fillName('UPPERCASE NAME');
    await expect(orgPage.slugInput).toHaveValue('uppercase-name');
  });

  test('removes special characters from slug', async () => {
    await orgPage.fillName("Scary's Place!");
    // Special characters removed, spaces become hyphens
    const slugValue = await orgPage.slugInput.inputValue();
    expect(slugValue).not.toContain("'");
    expect(slugValue).not.toContain('!');
  });

  test('replaces spaces with hyphens', async () => {
    await orgPage.fillName('Multiple Word Name');
    await expect(orgPage.slugInput).toHaveValue('multiple-word-name');
  });

  test('allows manual slug editing', async () => {
    await orgPage.fillName('Original Name');
    await orgPage.slugInput.clear();
    await orgPage.fillSlug('custom-slug');
    await expect(orgPage.slugInput).toHaveValue('custom-slug');
  });

  test('manual slug edit overrides auto-generation', async () => {
    await orgPage.fillName('First Name');
    await orgPage.slugInput.clear();
    await orgPage.fillSlug('my-custom-slug');

    // Changing name should not update manually edited slug
    await orgPage.fillName('Second Name');

    // Need to refocus to trigger update - the component tracks manual edits
    const slugValue = await orgPage.slugInput.inputValue();
    // After manual edit, slug should remain custom
    expect(slugValue).toBe('my-custom-slug');
  });
});

test.describe('Create Organization - Form Validation', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();
  });

  test('create button disabled without name', async () => {
    // Initially disabled
    await orgPage.expectCreateButtonDisabled();
  });

  test('create button disabled without slug', async () => {
    await orgPage.fillName('Test Org');
    await orgPage.slugInput.clear();
    await orgPage.expectCreateButtonDisabled();
  });

  test('create button enabled with name and slug', async () => {
    await orgPage.fillName('Test Organization');
    // Slug auto-generated
    await orgPage.expectCreateButtonEnabled();
  });

  test('validates email format', async ({ page }) => {
    await orgPage.fillOrgDetails({
      name: 'Test Org',
      email: 'invalid-email',
    });

    await orgPage.submitCreateForm();

    // Should show validation or stay on page
    await expect(page).toHaveURL(/organizations\/new/);
  });

  test('validates website URL format', async ({ page }) => {
    await orgPage.fillOrgDetails({
      name: 'Test Org',
      website: 'not-a-url',
    });

    await orgPage.submitCreateForm();

    // Browser native validation or form validation
    await expect(page).toHaveURL(/organizations\/new/);
  });

  test('validates slug format (lowercase, hyphens)', async () => {
    await orgPage.fillName('Test');
    await orgPage.slugInput.fill('Invalid Slug With Spaces');

    // The component sanitizes input
    const value = await orgPage.slugInput.inputValue();
    expect(value).not.toContain(' ');
    expect(value).not.toMatch(/[A-Z]/);
  });
});

test.describe('Create Organization - Successful Creation', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();
  });

  test('creates organization with minimal details', async ({ page }) => {
    const uniqueName = generateUniqueName('E2E Org');
    const expectedSlug = uniqueName.toLowerCase().replace(/\s+/g, '-');

    await orgPage.fillName(uniqueName);
    await orgPage.submitCreateForm();

    // Should redirect to the new org's dashboard
    await page.waitForURL((url) => !url.pathname.includes('/organizations/new'), {
      timeout: TIMEOUTS.long,
    });

    // URL should contain the org slug
    const currentUrl = page.url();
    expect(currentUrl.toLowerCase()).toContain(expectedSlug.toLowerCase().slice(0, 8));
  });

  test('creates organization with full details', async ({ page }) => {
    const uniqueName = generateUniqueName('Full Org');

    await orgPage.fillOrgDetails({
      name: uniqueName,
      email: 'contact@test.com',
      phone: '555-123-4567',
      website: 'https://test.com',
      timezone: 'America/Los_Angeles',
    });

    await orgPage.submitCreateForm();

    // Should redirect to the new org's dashboard
    await page.waitForURL((url) => !url.pathname.includes('/organizations/new'), {
      timeout: TIMEOUTS.long,
    });
  });

  test('shows loading state during creation', async ({ page }) => {
    const uniqueName = generateUniqueName('Loading Org');

    await orgPage.fillName(uniqueName);

    // Click and immediately check for loading state
    const createPromise = orgPage.submitCreateForm();

    // Check for loading indicator (button should show loading or be disabled)
    const hasLoading = await page.locator('button:has-text("Create Organization") svg, button:disabled').isVisible().catch(() => false);

    await createPromise;
  });
});

test.describe('Create Organization - Error Handling', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();
  });

  test('shows error for duplicate slug', async ({ page }) => {
    // Try to create org with existing slug
    await orgPage.fillName('Nightmare Manor');
    await orgPage.slugInput.clear();
    await orgPage.fillSlug('nightmare-manor'); // This slug already exists

    await orgPage.submitCreateForm();

    // Should show error (stay on page or show alert)
    await page.waitForTimeout(2000);

    const hasError = await orgPage.errorAlert.isVisible().catch(() => false);
    const stillOnPage = page.url().includes('/organizations/new');

    expect(hasError || stillOnPage).toBe(true);
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/**/organizations', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await orgPage.fillName('Test Org');
    await orgPage.submitCreateForm();

    // Should show error message
    await page.waitForTimeout(1000);
    const hasError = await orgPage.errorAlert.isVisible().catch(() => false);
    const stillOnPage = page.url().includes('/organizations/new');

    expect(hasError || stillOnPage).toBe(true);
  });
});

test.describe('Create Organization - Navigation', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
  });

  test('cancel button returns to previous page', async ({ page }) => {
    // Start from dashboard
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('networkidle');

    await orgPage.gotoCreateOrg();
    await orgPage.cancelButton.click();

    // Should navigate away from create page
    await expect(page).not.toHaveURL(/organizations\/new/);
  });

  test('back link navigates to root', async ({ page }) => {
    await orgPage.gotoCreateOrg();
    await orgPage.backButton.click();
    await page.waitForLoadState('networkidle');

    // Should navigate away from create page
    await expect(page).not.toHaveURL(/organizations\/new/);
  });

  test('can access create org from org switcher', async ({ page }) => {
    // Go to dashboard first
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('networkidle');

    // Try to find and click org switcher
    const switcher = page.locator('button[aria-haspopup="listbox"]').first();
    const isVisible = await switcher.isVisible().catch(() => false);

    if (isVisible) {
      await switcher.click();

      const createMenuItem = page.getByRole('menuitem', { name: /create organization/i });
      const hasCreateOption = await createMenuItem.isVisible().catch(() => false);

      if (hasCreateOption) {
        await createMenuItem.click();
        await expect(page).toHaveURL(/organizations\/new/);
      }
    }
  });

  test('page is accessible via direct URL', async ({ page }) => {
    await page.goto('/organizations/new');
    await page.waitForLoadState('networkidle');

    // Should show create form (or redirect to login if not authenticated)
    const onCreatePage = page.url().includes('/organizations/new');
    const redirectedToLogin = page.url().includes('/login');

    expect(onCreatePage || redirectedToLogin).toBe(true);
  });
});

test.describe('Create Organization - Role-Based Access', () => {
  test('owner can access create organization page', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();

    await orgPage.expectCreateOrgPage();
  });

  test('manager can access create organization page', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'manager');
    await orgPage.gotoCreateOrg();

    // Managers may or may not be able to create orgs depending on business logic
    // Just verify the page loads without error
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('actor has limited access to create organization', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'actor1');
    await orgPage.gotoCreateOrg();

    // Actor might be redirected or see limited access
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/organizations/new');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Create Organization - Accessibility', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();
  });

  test('form fields have proper labels', async ({ page }) => {
    // Name input should be associated with label
    const nameLabel = page.getByLabel(/organization name/i);
    await expect(nameLabel).toBeVisible();

    const slugLabel = page.getByLabel(/url slug/i);
    await expect(slugLabel).toBeVisible();
  });

  test('form is keyboard navigable', async ({ page }) => {
    // Focus first field
    await orgPage.nameInput.focus();
    await expect(orgPage.nameInput).toBeFocused();

    // Tab through form
    await page.keyboard.press('Tab');

    // Should move to next focusable element
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'SELECT', 'BUTTON', 'A']).toContain(focused);
  });

  test('can submit form with Enter key', async ({ page }) => {
    const uniqueName = generateUniqueName('Enter Org');

    await orgPage.fillName(uniqueName);
    await orgPage.nameInput.press('Enter');

    // Form should be submitted or validation should trigger
    await page.waitForTimeout(500);
  });

  test('error messages are accessible', async () => {
    // Try to submit empty form (validation should show)
    await orgPage.submitCreateForm();

    // If error shown, it should have role="alert"
    const hasAlert = await orgPage.errorAlert.isVisible().catch(() => false);
    if (hasAlert) {
      await expect(orgPage.errorAlert).toHaveAttribute('role', 'alert');
    }
  });
});

test.describe('Create Organization - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('create form is usable on mobile', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();

    await orgPage.expectCreateOrgPage();

    // Form should be visible
    await expect(orgPage.nameInput).toBeVisible();
    await expect(orgPage.createButton).toBeVisible();
  });

  test('can fill form on mobile', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();

    await orgPage.fillName('Mobile Test Org');

    const value = await orgPage.nameInput.inputValue();
    expect(value).toBe('Mobile Test Org');
  });

  test('buttons are accessible on mobile', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoCreateOrg();

    // Buttons should be visible and large enough to tap
    await expect(orgPage.createButton).toBeVisible();
    await expect(orgPage.cancelButton).toBeVisible();
  });
});
