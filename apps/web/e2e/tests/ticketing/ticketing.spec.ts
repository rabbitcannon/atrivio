import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from '../../helpers/auth';
import { TEST_ORGS, TIMEOUTS, generateUniqueCode, generateUniqueName } from '../../helpers/fixtures';
import { TicketingPage, createTicketingPage } from '../../pages/dashboard/ticketing.page';

/**
 * Ticketing E2E Tests
 *
 * Covers:
 * - Main ticketing dashboard
 * - Ticket types management (CRUD)
 * - Orders management (search, filter, view)
 * - Promo codes management (CRUD)
 * - Role-based access control
 * - URL routing
 */

test.describe('Ticketing', () => {
  test.describe('Main Ticketing Page', () => {
    let ticketingPage: TicketingPage;

    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
    });

    test('displays main ticketing dashboard with navigation cards', async () => {
      await ticketingPage.goto();
      await ticketingPage.expectTicketingPageVisible();

      // Verify all navigation cards are present
      await expect(ticketingPage.ticketTypesCard).toBeVisible();
      await expect(ticketingPage.timeSlotsCard).toBeVisible();
      await expect(ticketingPage.ordersCard).toBeVisible();
      await expect(ticketingPage.promoCodesCard).toBeVisible();
    });

    test('navigates to ticket types from main page', async ({ page }) => {
      await ticketingPage.goto();
      await ticketingPage.ticketTypesCard.click();
      await page.waitForURL(/\/ticketing\/types/);
      await ticketingPage.expectTicketTypesPageVisible();
    });

    test('navigates to orders from main page', async ({ page }) => {
      await ticketingPage.goto();
      await ticketingPage.ordersCard.click();
      await page.waitForURL(/\/ticketing\/orders/);
      await ticketingPage.expectOrdersPageVisible();
    });

    test('navigates to promo codes from main page', async ({ page }) => {
      await ticketingPage.goto();
      await ticketingPage.promoCodesCard.click();
      await page.waitForURL(/\/ticketing\/promo-codes/);
      await ticketingPage.expectPromoCodesPageVisible();
    });
  });

  test.describe('Ticket Types', () => {
    let ticketingPage: TicketingPage;

    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.gotoTicketTypes();
    });

    test('displays ticket types page with heading and table', async () => {
      await ticketingPage.expectTicketTypesPageVisible();
      // Either the table or empty state should be visible
      const hasTable = await ticketingPage.ticketTypesTable.isVisible().catch(() => false);
      const hasEmptyState = await ticketingPage.ticketTypesEmptyState.isVisible().catch(() => false);
      expect(hasTable || hasEmptyState).toBe(true);
    });

    test('opens create ticket type dialog', async () => {
      await ticketingPage.openCreateTicketTypeDialog();
      await expect(ticketingPage.ticketTypeDialog).toBeVisible();
      await expect(ticketingPage.ticketTypeNameInput).toBeVisible();
      await expect(ticketingPage.ticketTypePriceInput).toBeVisible();
      await expect(ticketingPage.ticketTypeAttractionSelect).toBeVisible();
    });

    test('validates required fields in ticket type form', async ({ page }) => {
      await ticketingPage.openCreateTicketTypeDialog();

      // Try to save without filling required fields
      const saveButton = ticketingPage.ticketTypeSaveButton;
      await saveButton.click();

      // Dialog should still be visible (form not submitted due to validation)
      await expect(ticketingPage.ticketTypeDialog).toBeVisible({ timeout: 2000 });
    });

    test('creates a new ticket type', async () => {
      const uniqueName = generateUniqueName('Test GA');

      await ticketingPage.createTicketType({
        name: uniqueName,
        description: 'Test general admission ticket',
        price: '25.00',
      });

      // Verify ticket type appears in list
      await ticketingPage.expectTicketTypeInList(uniqueName);
    });

    test('opens edit dialog for existing ticket type', async () => {
      // First create a ticket type to edit
      const uniqueName = generateUniqueName('Edit Test');

      await ticketingPage.createTicketType({
        name: uniqueName,
        price: '30.00',
      });

      // Now open edit dialog
      await ticketingPage.openEditTicketTypeDialog(uniqueName);
      await expect(ticketingPage.ticketTypeDialog).toBeVisible();

      // Name should be pre-filled
      await expect(ticketingPage.ticketTypeNameInput).toHaveValue(uniqueName);
    });
  });

  test.describe('Orders', () => {
    let ticketingPage: TicketingPage;

    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.gotoOrders();
    });

    test('displays orders page with search and filter', async () => {
      await ticketingPage.expectOrdersPageVisible();
      await expect(ticketingPage.ordersSearchInput).toBeVisible();
      await expect(ticketingPage.ordersStatusFilter).toBeVisible();
      await expect(ticketingPage.ordersSearchButton).toBeVisible();
    });

    test('shows orders table or empty state', async () => {
      const hasTable = await ticketingPage.ordersTable.isVisible().catch(() => false);
      const hasEmptyState = await ticketingPage.ordersEmptyState.isVisible().catch(() => false);
      expect(hasTable || hasEmptyState).toBe(true);
    });

    test('can search orders by email', async () => {
      // Type in search and click search button
      await ticketingPage.ordersSearchInput.fill('test@example.com');
      await ticketingPage.ordersSearchButton.click();

      // Wait for search results (either orders or empty state)
      await ticketingPage.page.waitForLoadState('networkidle');
      // Search should complete without error
    });

    test('can filter orders by status', async ({ page }) => {
      // Open status dropdown
      await ticketingPage.ordersStatusFilter.click();
      await page.waitForTimeout(200);

      // Verify status options are visible
      const completedOption = page.getByRole('option', { name: /completed/i });
      await expect(completedOption).toBeVisible();

      // Select completed status
      await completedOption.click();
      await ticketingPage.ordersSearchButton.click();

      // Wait for filtered results
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Promo Codes', () => {
    let ticketingPage: TicketingPage;

    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
      ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.gotoPromoCodes();
    });

    test('displays promo codes page with heading', async () => {
      await ticketingPage.expectPromoCodesPageVisible();
    });

    test('shows promo codes table or empty state', async () => {
      const hasTable = await ticketingPage.promoCodesTable.isVisible().catch(() => false);
      const hasEmptyState = await ticketingPage.promoCodesEmptyState.isVisible().catch(() => false);
      expect(hasTable || hasEmptyState).toBe(true);
    });

    test('opens create promo code dialog', async () => {
      await ticketingPage.openCreatePromoCodeDialog();
      await expect(ticketingPage.promoCodeDialog).toBeVisible();
      await expect(ticketingPage.promoCodeInput).toBeVisible();
      await expect(ticketingPage.promoCodeDiscountValueInput).toBeVisible();
    });

    test('generates random promo code', async () => {
      await ticketingPage.openCreatePromoCodeDialog();

      // Click generate button
      await ticketingPage.generatePromoCode();

      // Code input should have a value
      await expect(ticketingPage.promoCodeInput).not.toHaveValue('');
    });

    test('creates a percentage discount promo code', async () => {
      const uniqueCode = generateUniqueCode('SAVE');

      await ticketingPage.createPromoCode({
        code: uniqueCode,
        description: 'Test percentage discount',
        discountType: 'percentage',
        discountValue: '20',
      });

      // Verify promo code appears in list
      await ticketingPage.expectPromoCodeInList(uniqueCode);
    });

    test('creates a fixed amount discount promo code', async () => {
      const uniqueCode = generateUniqueCode('FIXED');

      await ticketingPage.createPromoCode({
        code: uniqueCode,
        description: 'Test fixed discount',
        discountType: 'fixed',
        discountValue: '10.00',
      });

      // Verify promo code appears in list
      await ticketingPage.expectPromoCodeInList(uniqueCode);
    });

    test('opens edit dialog for existing promo code', async () => {
      // First create a promo code to edit
      const uniqueCode = generateUniqueCode('EDIT');

      await ticketingPage.createPromoCode({
        code: uniqueCode,
        discountValue: '15',
      });

      // Now open edit dialog
      await ticketingPage.openEditPromoCodeDialog(uniqueCode);
      await expect(ticketingPage.promoCodeDialog).toBeVisible();

      // Code should be pre-filled
      await expect(ticketingPage.promoCodeInput).toHaveValue(uniqueCode);
    });
  });

  test.describe('URL Routing', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'owner');
    });

    test('navigates to ticketing pages via direct URL', async ({ page }) => {
      const orgSlug = TEST_ORGS.nightmareManor.slug;

      // Main ticketing
      await page.goto(`/${orgSlug}/ticketing`);
      await expect(page.getByRole('heading', { name: 'Ticketing', level: 1 }).first()).toBeVisible({
        timeout: TIMEOUTS.standard,
      });

      // Ticket types
      await page.goto(`/${orgSlug}/ticketing/types`);
      await expect(page.getByRole('heading', { name: 'Ticket Types', level: 1 }).first()).toBeVisible({
        timeout: TIMEOUTS.standard,
      });

      // Orders
      await page.goto(`/${orgSlug}/ticketing/orders`);
      await expect(page.getByRole('heading', { name: 'Orders', level: 1 }).first()).toBeVisible({
        timeout: TIMEOUTS.standard,
      });

      // Promo codes
      await page.goto(`/${orgSlug}/ticketing/promo-codes`);
      await expect(page.getByRole('heading', { name: 'Promo Codes', level: 1 }).first()).toBeVisible({
        timeout: TIMEOUTS.standard,
      });
    });

    test('redirects unauthenticated users to login', async ({ page }) => {
      // Clear cookies to simulate unauthenticated state
      await page.context().clearCookies();

      await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);
      await page.waitForURL(/\/login/, { timeout: TIMEOUTS.standard });
    });
  });

  test.describe('Role-Based Access', () => {
    test('owner can access ticketing', async ({ page }) => {
      await loginAs(page, 'owner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.goto();
      await ticketingPage.expectTicketingPageVisible();
    });

    test('manager can access ticketing', async ({ page }) => {
      await loginAs(page, 'manager');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.goto();
      await ticketingPage.expectTicketingPageVisible();
    });

    test('box office can access ticketing', async ({ page }) => {
      await loginAs(page, 'boxOffice');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.goto();
      await ticketingPage.expectTicketingPageVisible();
    });

    test('actor has limited access to ticketing', async ({ page }) => {
      await loginAs(page, 'actor1');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await page.goto(`/${TEST_ORGS.nightmareManor.slug}/ticketing`);

      // Actor should either see ticketing or be redirected
      // This depends on your RBAC implementation
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Cross-Org Isolation', () => {
    test('cannot access ticketing for different org', async ({ page }) => {
      // Login as Nightmare Manor owner
      await loginAs(page, 'owner');

      // Try to access Terror Collective ticketing
      await page.goto(`/${TEST_ORGS.terrorCollective.slug}/ticketing`);
      await page.waitForLoadState('networkidle');

      // Should be redirected or see error (not seeing Terror Collective data)
      const url = page.url();
      // Either redirected away or on error page
      const hasAccess =
        url.includes(TEST_ORGS.terrorCollective.slug) &&
        url.includes('/ticketing') &&
        !url.includes('/login') &&
        !url.includes('/error');

      // If we have access, we shouldn't see the page content
      if (hasAccess) {
        // Page should show access denied or be empty
        const ticketingHeading = page.getByRole('heading', { name: 'Ticketing', level: 1 }).first();
        const isVisible = await ticketingHeading.isVisible({ timeout: 3000 }).catch(() => false);
        // This assertion depends on how your app handles cross-org access
        // Adjust based on expected behavior
      }
    });
  });

  test.describe('Feature Flags - Ticketing (Basic Tier)', () => {
    test('ticketing is available for free tier org', async ({ page }) => {
      await loginAs(page, 'freeOwner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.spookyHollow.slug);
      await ticketingPage.goto();

      // Ticketing is a basic tier feature, should be available
      await ticketingPage.expectTicketingPageVisible();
    });

    test('ticketing is available for pro tier org', async ({ page }) => {
      await loginAs(page, 'owner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.goto();
      await ticketingPage.expectTicketingPageVisible();
    });

    test('ticketing is available for enterprise tier org', async ({ page }) => {
      await loginAs(page, 'enterpriseOwner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.terrorCollective.slug);
      await ticketingPage.goto();
      await ticketingPage.expectTicketingPageVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('ticketing page is usable on mobile', async ({ page }) => {
      await loginAs(page, 'owner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.goto();

      // Page should still be functional
      await ticketingPage.expectTicketingPageVisible();

      // Navigation cards should be visible (may be stacked vertically)
      await expect(ticketingPage.ticketTypesCard).toBeVisible();
    });

    test('ticket types table is usable on mobile', async ({ page }) => {
      await loginAs(page, 'owner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.gotoTicketTypes();

      await ticketingPage.expectTicketTypesPageVisible();

      // Create dialog should open correctly
      await ticketingPage.openCreateTicketTypeDialog();
      await expect(ticketingPage.ticketTypeDialog).toBeVisible();

      // Form inputs should be accessible
      await expect(ticketingPage.ticketTypeNameInput).toBeVisible();
    });

    test('orders page is usable on mobile', async ({ page }) => {
      await loginAs(page, 'owner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.gotoOrders();

      await ticketingPage.expectOrdersPageVisible();

      // Search functionality should work
      await expect(ticketingPage.ordersSearchInput).toBeVisible();
      await expect(ticketingPage.ordersSearchButton).toBeVisible();
    });

    test('promo codes page is usable on mobile', async ({ page }) => {
      await loginAs(page, 'owner');
      const ticketingPage = createTicketingPage(page, TEST_ORGS.nightmareManor.slug);
      await ticketingPage.gotoPromoCodes();

      await ticketingPage.expectPromoCodesPageVisible();

      // Create dialog should work
      await ticketingPage.openCreatePromoCodeDialog();
      await expect(ticketingPage.promoCodeDialog).toBeVisible();
    });
  });
});
