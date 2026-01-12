import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ROUTES, TIMEOUTS } from '../../helpers/fixtures';

/**
 * Orders Page Object
 *
 * Encapsulates interactions with the orders management page in the dashboard.
 */
export class OrdersPage extends BasePage {
  private readonly orgSlug: string;

  constructor(page: Page, orgSlug: string) {
    super(page);
    this.orgSlug = orgSlug;
  }

  // ============================================================================
  // Locators
  // ============================================================================

  /** Page heading (h1 specifically) */
  get pageHeading(): Locator {
    return this.page.locator('h1').filter({ hasText: 'Orders' });
  }

  /** Search input for email */
  get searchInput(): Locator {
    return this.page.getByPlaceholder('Search by customer email...');
  }

  /** Status filter dropdown */
  get statusFilter(): Locator {
    return this.page.locator('button').filter({ hasText: /All statuses|Pending|Completed|Refunded/i });
  }

  /** Search button */
  get searchButton(): Locator {
    return this.page.getByRole('button', { name: /Search/i });
  }

  /** Orders table */
  get ordersTable(): Locator {
    return this.page.locator('table');
  }

  /** Order rows in the table */
  get orderRows(): Locator {
    return this.ordersTable.locator('tbody tr');
  }

  /** Order details dialog */
  get orderDetailsDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /** Empty state message */
  get emptyState(): Locator {
    return this.page.getByText('No orders found');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to the orders page
   */
  async goto(): Promise<void> {
    await super.goto(ROUTES.dashboard(this.orgSlug).ticketingOrders);
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Search orders by customer email
   */
  async searchByEmail(email: string): Promise<void> {
    await this.searchInput.fill(email);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Filter orders by status
   */
  async filterByStatus(status: 'all' | 'pending' | 'completed' | 'canceled' | 'refunded'): Promise<void> {
    await this.statusFilter.click();
    const statusOption = this.page.getByRole('option', {
      name: status === 'all' ? 'All statuses' : new RegExp(status, 'i')
    });
    await statusOption.click();
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Get the row for a specific order by order number
   */
  getOrderRow(orderNumber: string): Locator {
    return this.orderRows.filter({ hasText: orderNumber });
  }

  /**
   * Get the row for an order by customer email
   */
  getOrderRowByEmail(email: string): Locator {
    return this.orderRows.filter({ hasText: email });
  }

  /**
   * Open the actions dropdown for an order row
   */
  async openOrderActions(orderRow: Locator): Promise<void> {
    // Ensure the row is visible and stable first
    await expect(orderRow).toBeVisible({ timeout: TIMEOUTS.standard });

    // Find the dropdown trigger button - it's in the last td of the row and contains an svg icon
    const actionsCell = orderRow.locator('td').last();
    const moreButton = actionsCell.locator('button').first();

    // Ensure button is visible and clickable
    await expect(moreButton).toBeVisible({ timeout: TIMEOUTS.fast });
    await moreButton.click();

    // Wait for the dropdown menu to appear
    await expect(this.page.locator('[role="menu"]')).toBeVisible({ timeout: TIMEOUTS.fast });
  }

  /**
   * Click refund in the dropdown menu
   */
  async clickRefund(): Promise<void> {
    // The dropdown menu item contains both an icon and text
    const refundItem = this.page.locator('[role="menuitem"]').filter({ hasText: /Refund/i });
    await expect(refundItem).toBeVisible({ timeout: TIMEOUTS.fast });
    await refundItem.click();
  }

  /**
   * Click view details in the dropdown menu
   */
  async clickViewDetails(): Promise<void> {
    const viewItem = this.page.locator('[role="menuitem"]').filter({ hasText: /View Details/i });
    await expect(viewItem).toBeVisible({ timeout: TIMEOUTS.fast });
    await viewItem.click();
  }

  /**
   * Click cancel in the dropdown menu
   */
  async clickCancel(): Promise<void> {
    const cancelItem = this.page.locator('[role="menuitem"]').filter({ hasText: /Cancel/i });
    await expect(cancelItem).toBeVisible({ timeout: TIMEOUTS.fast });
    await cancelItem.click();
  }

  /**
   * Refund an order by order number
   * Handles the browser confirm dialog automatically
   */
  async refundOrder(orderNumber: string): Promise<void> {
    const orderRow = this.getOrderRow(orderNumber);
    await expect(orderRow).toBeVisible({ timeout: TIMEOUTS.standard });

    // Set up dialog handler before triggering the action
    this.page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Refund order');
      await dialog.accept();
    });

    await this.openOrderActions(orderRow);
    await this.clickRefund();

    // Wait for the refund to complete (status update)
    await this.page.waitForTimeout(2000);
    await this.waitForPageLoad();
  }

  /**
   * Refund an order by customer email
   */
  async refundOrderByEmail(email: string): Promise<void> {
    // Search for the order first
    await this.searchByEmail(email);

    const orderRow = this.getOrderRowByEmail(email).first();
    await expect(orderRow).toBeVisible({ timeout: TIMEOUTS.standard });

    // Set up dialog handler before triggering the action
    this.page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Refund order');
      await dialog.accept();
    });

    await this.openOrderActions(orderRow);
    await this.clickRefund();

    // Wait for the refund to complete
    await this.page.waitForTimeout(2000);
    await this.waitForPageLoad();
  }

  /**
   * View order details
   */
  async viewOrderDetails(orderNumber: string): Promise<void> {
    const orderRow = this.getOrderRow(orderNumber);
    await this.openOrderActions(orderRow);
    await this.clickViewDetails();
    await expect(this.orderDetailsDialog).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Get the status badge text for an order row
   * Status is in column 5 (0-indexed: Order, Customer, Attraction, Total, Status, Date, Actions)
   */
  async getOrderStatus(orderRow: Locator): Promise<string> {
    // Status is in the 5th column (index 4) - look for the div with rounded styling (the badge)
    const statusCell = orderRow.locator('td').nth(4);
    const statusText = await statusCell.textContent();
    return statusText?.trim() || '';
  }

  /**
   * Get the first order row
   */
  getFirstOrder(): Locator {
    return this.orderRows.first();
  }

  /**
   * Get all completed orders
   */
  async getCompletedOrders(): Promise<Locator> {
    // Filter to completed status first
    await this.filterByStatus('completed');
    return this.orderRows;
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert that the orders page is displayed
   */
  async expectOrdersPage(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.ordersTable).toBeVisible();
  }

  /**
   * Assert that an order exists with a specific status
   */
  async expectOrderStatus(orderNumber: string, status: string): Promise<void> {
    const orderRow = this.getOrderRow(orderNumber);
    await expect(orderRow).toBeVisible({ timeout: TIMEOUTS.standard });
    const statusBadge = orderRow.locator('[class*="badge"]');
    await expect(statusBadge).toContainText(status, { ignoreCase: true });
  }

  /**
   * Assert that a toast notification appears
   */
  async expectToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator('[role="alert"], [data-sonner-toast]');
    await expect(toast.filter({ hasText: message })).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Assert that no orders are found
   */
  async expectNoOrders(): Promise<void> {
    await expect(this.emptyState).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Assert that the order count matches
   */
  async expectOrderCount(count: number): Promise<void> {
    if (count === 0) {
      await this.expectNoOrders();
    } else {
      await expect(this.orderRows).toHaveCount(count);
    }
  }

  /**
   * Assert that an order was refunded successfully
   */
  async expectOrderRefunded(orderNumber: string): Promise<void> {
    await this.expectOrderStatus(orderNumber, 'refunded');
  }

  /**
   * Assert that the order details dialog shows specific information
   */
  async expectOrderDetailsVisible(): Promise<void> {
    await expect(this.orderDetailsDialog).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Close the order details dialog
   */
  async closeOrderDetails(): Promise<void> {
    // Click outside or press escape
    await this.page.keyboard.press('Escape');
    await expect(this.orderDetailsDialog).not.toBeVisible();
  }
}

/**
 * Create an OrdersPage instance
 */
export function createOrdersPage(page: Page, orgSlug: string): OrdersPage {
  return new OrdersPage(page, orgSlug);
}
