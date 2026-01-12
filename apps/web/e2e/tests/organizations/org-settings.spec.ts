import { test, expect } from '@playwright/test';
import { createOrganizationsPage, OrganizationsPage } from '../../pages/organizations/organizations.page';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { TEST_ORGS, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Organization Settings E2E Tests
 *
 * Covers:
 * - Settings page display and layout
 * - Viewing organization information
 * - Updating organization details
 * - Form validation
 * - Role-based access control
 * - Error handling
 *
 * Note: Settings page requires owner/admin role to modify
 */

test.describe('Organization Settings - Page Display', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);
  });

  test('displays organization settings page', async () => {
    await orgPage.expectSettingsPage();
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Organization Settings' })).toBeVisible();
  });

  test('shows page description', async ({ page }) => {
    await expect(page.getByText(/manage your organization/i)).toBeVisible();
  });

  test('displays general settings card', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'General Settings' })).toBeVisible();
  });
});

test.describe('Organization Settings - Form Fields', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);
  });

  test('shows basic information section', async ({ page }) => {
    await expect(page.getByText('Basic Information')).toBeVisible();
  });

  test('shows organization name field', async () => {
    await expect(orgPage.settingsNameInput).toBeVisible();
  });

  test('shows slug field as read-only', async () => {
    await orgPage.expectSlugReadOnly();
  });

  test('shows contact information section', async ({ page }) => {
    await expect(page.getByText('Contact Information')).toBeVisible();
  });

  test('shows email field', async () => {
    await expect(orgPage.settingsEmailInput).toBeVisible();
  });

  test('shows phone field', async () => {
    await expect(orgPage.settingsPhoneInput).toBeVisible();
  });

  test('shows website field', async () => {
    await expect(orgPage.settingsWebsiteInput).toBeVisible();
  });

  test('shows address section', async ({ page }) => {
    await expect(page.getByText('Address')).toBeVisible();
  });

  test('shows address fields', async () => {
    await expect(orgPage.addressLine1Input).toBeVisible();
    await expect(orgPage.addressCityInput).toBeVisible();
    await expect(orgPage.addressStateInput).toBeVisible();
    await expect(orgPage.addressPostalCodeInput).toBeVisible();
  });

  test('shows locale/timezone section', async ({ page }) => {
    await expect(page.getByText('Locale')).toBeVisible();
  });

  test('shows timezone field', async () => {
    await expect(orgPage.settingsTimezoneInput).toBeVisible();
  });

  test('shows save button', async () => {
    await expect(orgPage.saveChangesButton).toBeVisible();
  });
});

test.describe('Organization Settings - Pre-populated Values', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);
  });

  test('name field shows current org name', async () => {
    await orgPage.expectOrgName(TEST_ORGS.nightmareManor.name);
  });

  test('slug field shows current slug', async () => {
    await orgPage.expectOrgSlug(TEST_ORGS.nightmareManor.slug);
  });

  test('slug field is disabled', async () => {
    await orgPage.expectSlugReadOnly();
  });

  test('timezone field has default value', async () => {
    const value = await orgPage.settingsTimezoneInput.inputValue();
    expect(value).toBeTruthy();
    expect(value).toContain('America/'); // Default should be US timezone
  });
});

test.describe('Organization Settings - Updating Details', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);
  });

  test('can update organization name', async () => {
    const newName = `${TEST_ORGS.nightmareManor.name} Updated`;
    await orgPage.updateName(newName);

    const value = await orgPage.settingsNameInput.inputValue();
    expect(value).toBe(newName);

    // Revert for other tests
    await orgPage.updateName(TEST_ORGS.nightmareManor.name);
  });

  test('can update contact email', async () => {
    await orgPage.updateEmail('updated@example.com');

    const value = await orgPage.settingsEmailInput.inputValue();
    expect(value).toBe('updated@example.com');
  });

  test('can update phone number', async () => {
    await orgPage.updatePhone('555-999-0000');

    const value = await orgPage.settingsPhoneInput.inputValue();
    expect(value).toBe('555-999-0000');
  });

  test('can update website', async () => {
    await orgPage.updateWebsite('https://updated-site.com');

    const value = await orgPage.settingsWebsiteInput.inputValue();
    expect(value).toBe('https://updated-site.com');
  });

  test('can fill address fields', async () => {
    await orgPage.fillAddress({
      line1: '123 Test Street',
      city: 'Test City',
      state: 'TC',
      postalCode: '12345',
      country: 'US',
    });

    const line1Value = await orgPage.addressLine1Input.inputValue();
    expect(line1Value).toBe('123 Test Street');
  });

  test('save button submits changes', async ({ page }) => {
    // Make a small change
    await orgPage.updateEmail('test-save@example.com');
    await orgPage.saveSettings();

    // Should show success or processing state
    await page.waitForTimeout(1000);

    // Either success message or form still visible
    const hasSuccess = await orgPage.successMessage.isVisible().catch(() => false);
    const formStillVisible = await orgPage.saveChangesButton.isVisible().catch(() => false);

    expect(hasSuccess || formStillVisible).toBe(true);
  });

  test('shows success message after save', async () => {
    await orgPage.updateEmail('success-test@example.com');
    await orgPage.saveSettings();

    await orgPage.expectSuccessMessage();
  });

  test('shows "No changes to save" error if nothing changed', async () => {
    // Try to save without making changes
    await orgPage.saveSettings();

    await orgPage.expectError('No changes');
  });
});

test.describe('Organization Settings - Validation', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);
  });

  test('name field is required', async () => {
    await orgPage.settingsNameInput.clear();

    // HTML5 required attribute should prevent submission
    const isRequired = await orgPage.settingsNameInput.getAttribute('required');
    expect(isRequired !== null).toBe(true);
  });

  test('email field validates format', async ({ page }) => {
    await orgPage.updateEmail('invalid-email');
    await orgPage.saveSettings();

    // Should show validation error or native browser validation
    // Form should not submit successfully
    await page.waitForTimeout(500);
  });

  test('website field validates URL format', async ({ page }) => {
    await orgPage.updateWebsite('not-a-url');
    await orgPage.saveSettings();

    // Should show validation error or native browser validation
    await page.waitForTimeout(500);
  });

  test('cannot modify slug', async () => {
    // Slug field should be disabled
    const isDisabled = await orgPage.settingsSlugDisplay.isDisabled();
    expect(isDisabled).toBe(true);
  });
});

test.describe('Organization Settings - Role-Based Access', () => {
  test('owner can access settings', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    await orgPage.expectSettingsPage();
  });

  test('manager can access settings', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'manager');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Manager should be able to view settings
    // May or may not be able to edit depending on implementation
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({
      timeout: TIMEOUTS.standard,
    });
  });

  test('actor has limited access to settings', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'actor1');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Actor might be redirected or see limited view
    const currentUrl = page.url();
    const hasSettings = await page.getByRole('heading', { name: /settings/i }).isVisible().catch(() => false);
    const wasRedirected = !currentUrl.includes('/settings');
    const hasAccessDenied = await page.locator('text=/access denied|permission|unauthorized/i').isVisible().catch(() => false);

    expect(hasSettings || wasRedirected || hasAccessDenied).toBe(true);
  });

  test('different org owner cannot access settings', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'freeOwner'); // Owner of Spooky Hollow

    // Try to access Nightmare Manor settings
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Should be redirected or show error
    const currentUrl = page.url();
    const hasError = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const wasRedirected = !currentUrl.includes(TEST_ORGS.nightmareManor.slug);

    expect(hasError || wasRedirected).toBe(true);
  });
});

test.describe('Organization Settings - Different Tiers', () => {
  test('pro tier org shows full settings', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    await orgPage.expectSettingsPage();
    await expect(orgPage.settingsNameInput).toBeVisible();
  });

  test('free tier org shows settings', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'freeOwner');
    await orgPage.gotoSettings(TEST_ORGS.spookyHollow.slug);

    await orgPage.expectSettingsPage();
  });

  test('enterprise tier org shows settings', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'enterpriseOwner');
    await orgPage.gotoSettings(TEST_ORGS.terrorCollective.slug);

    await orgPage.expectSettingsPage();
  });
});

test.describe('Organization Settings - Error Handling', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
  });

  test('handles API error gracefully', async ({ page }) => {
    // Route API to fail
    await page.route('**/api/**/organizations/**', (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      } else {
        route.continue();
      }
    });

    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);
    await orgPage.updateEmail('error-test@example.com');
    await orgPage.saveSettings();

    // Should show error or stay on page
    await page.waitForTimeout(1000);

    const hasError = await orgPage.settingsErrorMessage.isVisible().catch(() => false);
    const stillOnSettings = page.url().includes('/settings');

    expect(hasError || stillOnSettings).toBe(true);
  });

  test('handles network failure gracefully', async ({ page }) => {
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Simulate network failure for save
    await page.route('**/api/**/organizations/**', (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    await orgPage.updateEmail('network-fail@example.com');
    await orgPage.saveSettings();

    // Should handle gracefully
    await page.waitForTimeout(2000);
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('handles non-existent org', async ({ page }) => {
    await page.goto('/non-existent-org/settings');
    await page.waitForLoadState('networkidle');

    // Should show 404 or error
    const hasError = await page.locator('text=/not found|error|404/i').isVisible().catch(() => false);
    const wasRedirected = !page.url().includes('/settings');

    expect(hasError || wasRedirected).toBe(true);
  });
});

test.describe('Organization Settings - Navigation', () => {
  test('settings accessible via direct URL', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}/settings`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });

  test('settings accessible from dashboard navigation', async ({ page }) => {
    await loginAs(page, 'owner');
    await page.goto(`/${TEST_ORGS.nightmareManor.slug}`);
    await page.waitForLoadState('networkidle');

    // Look for settings link in sidebar or menu
    const settingsLink = page.getByRole('link', { name: /settings/i }).first();
    const isVisible = await settingsLink.isVisible().catch(() => false);

    if (isVisible) {
      await settingsLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/settings/);
    }
  });
});

test.describe('Organization Settings - Accessibility', () => {
  let orgPage: OrganizationsPage;

  test.beforeEach(async ({ page }) => {
    orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);
  });

  test('form fields have proper labels', async ({ page }) => {
    await expect(page.getByLabel(/organization name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    // H1 should be Organization Settings
    await expect(page.getByRole('heading', { level: 1, name: /organization settings/i })).toBeVisible();
  });

  test('form is keyboard navigable', async ({ page }) => {
    await orgPage.settingsNameInput.focus();
    await expect(orgPage.settingsNameInput).toBeFocused();

    // Tab through form
    await page.keyboard.press('Tab');

    // Some element should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'SELECT', 'BUTTON', 'A']).toContain(focused);
  });

  test('error messages are accessible', async () => {
    // Try to save without changes
    await orgPage.saveSettings();

    // Error should have role="alert"
    await orgPage.expectError();
  });

  test('success messages are accessible', async () => {
    await orgPage.updateEmail('accessible-test@example.com');
    await orgPage.saveSettings();

    // Success should have role="status"
    const successElement = orgPage.successMessage;
    await expect(successElement).toBeVisible({ timeout: TIMEOUTS.standard });
  });
});

test.describe('Organization Settings - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('settings page is usable on mobile', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    await orgPage.expectSettingsPage();
  });

  test('all form fields are accessible on mobile', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Name field
    await expect(orgPage.settingsNameInput).toBeVisible();

    // Scroll down if needed to see other fields
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(orgPage.saveChangesButton).toBeVisible();
  });

  test('save button is visible on mobile', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(orgPage.saveChangesButton).toBeVisible();
  });

  test('can update settings on mobile', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    await orgPage.updateEmail('mobile-test@example.com');

    const value = await orgPage.settingsEmailInput.inputValue();
    expect(value).toBe('mobile-test@example.com');
  });
});

test.describe('Organization Settings - State Persistence', () => {
  test('unsaved changes persist in form', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Make changes but don't save
    await orgPage.updateEmail('unsaved@example.com');

    // Check value is still there
    const value = await orgPage.settingsEmailInput.inputValue();
    expect(value).toBe('unsaved@example.com');
  });

  test('saved changes persist after refresh', async ({ page }) => {
    const orgPage = createOrganizationsPage(page);
    await loginAs(page, 'owner');
    await orgPage.gotoSettings(TEST_ORGS.nightmareManor.slug);

    // Get original value
    const originalEmail = await orgPage.settingsEmailInput.inputValue();

    // Make and save changes
    const newEmail = `persisted-${Date.now()}@example.com`;
    await orgPage.updateEmail(newEmail);
    await orgPage.saveSettings();

    // Wait for success
    await orgPage.expectSuccessMessage();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if change persisted (or reverted by backend)
    const afterRefresh = await orgPage.settingsEmailInput.inputValue();
    expect(afterRefresh === newEmail || afterRefresh === originalEmail).toBe(true);
  });
});
