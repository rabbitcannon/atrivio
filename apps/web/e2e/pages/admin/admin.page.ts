import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Admin Page Object
 *
 * Handles:
 * - Admin dashboard
 * - Organizations management
 * - Users management
 * - Feature flags management
 */
export class AdminPage {
  readonly page: Page;

  // Dashboard Locators
  readonly dashboardHeading: Locator;
  readonly statsCards: Locator;
  readonly totalUsersCard: Locator;
  readonly totalOrgsCard: Locator;
  readonly totalAttractionsCard: Locator;
  readonly growthCard: Locator;
  readonly systemHealthCard: Locator;
  readonly recentActivityCard: Locator;
  readonly quickActionsCard: Locator;
  readonly errorAlert: Locator;

  // Organizations Page Locators
  readonly orgsHeading: Locator;
  readonly orgsTable: Locator;
  readonly orgsTableRows: Locator;
  readonly orgsSearchInput: Locator;
  readonly orgsSearchButton: Locator;
  readonly orgsStatusFilter: Locator;
  readonly noOrgsState: Locator;
  readonly suspendDialog: Locator;
  readonly suspendReasonInput: Locator;
  readonly suspendConfirmButton: Locator;
  readonly reactivateDialog: Locator;
  readonly reactivateConfirmButton: Locator;

  // Users Page Locators
  readonly usersHeading: Locator;
  readonly usersTable: Locator;
  readonly usersTableRows: Locator;
  readonly usersSearchInput: Locator;
  readonly usersSearchButton: Locator;
  readonly noUsersState: Locator;
  readonly grantAdminDialog: Locator;
  readonly revokeAdminDialog: Locator;
  readonly adminConfirmButton: Locator;

  // Feature Flags Page Locators
  readonly flagsHeading: Locator;
  readonly flagsTable: Locator;
  readonly flagsTableRows: Locator;
  readonly newFlagButton: Locator;
  readonly noFlagsState: Locator;
  readonly createFlagDialog: Locator;
  readonly flagKeyInput: Locator;
  readonly flagNameInput: Locator;
  readonly flagDescriptionInput: Locator;
  readonly createFlagConfirmButton: Locator;
  readonly deleteFlagDialog: Locator;
  readonly deleteFlagConfirmButton: Locator;

  // Common
  readonly loadingState: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dashboard
    this.dashboardHeading = page.getByRole('heading', { name: /platform dashboard/i, level: 1 });
    this.statsCards = page.locator('[class*="card"]');
    this.totalUsersCard = page.locator('text=/total users/i').locator('xpath=ancestor::*[contains(@class, "card")]');
    this.totalOrgsCard = page.locator('text=/organizations/i').locator('xpath=ancestor::*[contains(@class, "card")]').first();
    this.totalAttractionsCard = page.locator('text=/attractions/i').locator('xpath=ancestor::*[contains(@class, "card")]').first();
    this.growthCard = page.locator('text=/growth/i').locator('xpath=ancestor::*[contains(@class, "card")]').first();
    this.systemHealthCard = page.locator('text=/system health/i').locator('xpath=ancestor::*[contains(@class, "card")]');
    this.recentActivityCard = page.locator('text=/recent activity/i').locator('xpath=ancestor::*[contains(@class, "card")]');
    this.quickActionsCard = page.locator('text=/quick actions/i').locator('xpath=ancestor::*[contains(@class, "card")]');
    this.errorAlert = page.getByRole('alert');

    // Organizations
    this.orgsHeading = page.getByRole('heading', { name: /organizations/i, level: 1 });
    this.orgsTable = page.locator('table').first();
    this.orgsTableRows = page.locator('tbody tr');
    this.orgsSearchInput = page.getByPlaceholder(/search organizations/i);
    this.orgsSearchButton = page.getByRole('button', { name: /search/i });
    this.orgsStatusFilter = page.locator('[role="combobox"]').first();
    this.noOrgsState = page.locator('text=/no organizations found/i');
    this.suspendDialog = page.locator('[role="dialog"]').filter({ hasText: /suspend organization/i });
    this.suspendReasonInput = page.getByLabel(/reason for suspension/i);
    this.suspendConfirmButton = page.getByRole('button', { name: /suspend organization/i });
    this.reactivateDialog = page.locator('[role="dialog"]').filter({ hasText: /reactivate organization/i });
    this.reactivateConfirmButton = page.getByRole('button', { name: /reactivate organization/i });

    // Users
    this.usersHeading = page.getByRole('heading', { name: /^users$/i, level: 1 });
    this.usersTable = page.locator('table').first();
    this.usersTableRows = page.locator('tbody tr');
    this.usersSearchInput = page.getByPlaceholder(/search users/i);
    this.usersSearchButton = page.getByRole('button', { name: /search/i });
    this.noUsersState = page.locator('text=/no users found/i');
    this.grantAdminDialog = page.locator('[role="dialog"]').filter({ hasText: /grant super admin/i });
    this.revokeAdminDialog = page.locator('[role="dialog"]').filter({ hasText: /revoke super admin/i });
    this.adminConfirmButton = page.getByRole('button', { name: /grant access|revoke access/i });

    // Feature Flags
    this.flagsHeading = page.getByRole('heading', { name: /feature flags/i, level: 1 });
    this.flagsTable = page.locator('table').first();
    this.flagsTableRows = page.locator('tbody tr');
    this.newFlagButton = page.getByRole('button', { name: /new flag/i });
    this.noFlagsState = page.locator('text=/no feature flags configured/i');
    this.createFlagDialog = page.locator('[role="dialog"]').filter({ hasText: /create feature flag/i });
    this.flagKeyInput = page.getByLabel(/^key$/i);
    this.flagNameInput = page.getByLabel(/^name$/i);
    this.flagDescriptionInput = page.getByLabel(/description/i);
    this.createFlagConfirmButton = page.getByRole('button', { name: /create flag/i });
    this.deleteFlagDialog = page.locator('[role="dialog"]').filter({ hasText: /delete feature flag/i });
    this.deleteFlagConfirmButton = page.getByRole('button', { name: /delete flag/i });

    // Common
    this.loadingState = page.locator('[class*="skeleton"]');
  }

  // Navigation Methods
  async goto(): Promise<void> {
    await this.page.goto('/admin');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoOrganizations(): Promise<void> {
    await this.page.goto('/admin/organizations');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoUsers(): Promise<void> {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoFeatureFlags(): Promise<void> {
    await this.page.goto('/admin/feature-flags');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoAuditLogs(): Promise<void> {
    await this.page.goto('/admin/audit-logs');
    await this.page.waitForLoadState('networkidle');
  }

  // Dashboard Actions
  async clickQuickAction(actionName: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(actionName, 'i') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Organizations Actions
  async searchOrganizations(query: string): Promise<void> {
    await this.orgsSearchInput.fill(query);
    await this.orgsSearchButton.click();
    await this.page.waitForTimeout(500);
  }

  async filterOrganizationsByStatus(status: string): Promise<void> {
    await this.orgsStatusFilter.click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
    await this.page.waitForTimeout(500);
  }

  async openOrgActionsMenu(orgName: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: orgName });
    await row.getByRole('button', { name: /actions/i }).click();
  }

  async suspendOrganization(orgName: string, reason: string): Promise<void> {
    await this.openOrgActionsMenu(orgName);
    await this.page.getByRole('menuitem', { name: /suspend/i }).click();
    await this.suspendReasonInput.fill(reason);
    await this.suspendConfirmButton.click();
    await this.page.waitForTimeout(500);
  }

  async reactivateOrganization(orgName: string): Promise<void> {
    await this.openOrgActionsMenu(orgName);
    await this.page.getByRole('menuitem', { name: /reactivate/i }).click();
    await this.reactivateConfirmButton.click();
    await this.page.waitForTimeout(500);
  }

  // Users Actions
  async searchUsers(query: string): Promise<void> {
    await this.usersSearchInput.fill(query);
    await this.usersSearchButton.click();
    await this.page.waitForTimeout(500);
  }

  async openUserActionsMenu(userName: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: userName });
    await row.getByRole('button', { name: /actions/i }).click();
  }

  async grantSuperAdmin(userName: string): Promise<void> {
    await this.openUserActionsMenu(userName);
    await this.page.getByRole('menuitem', { name: /grant admin/i }).click();
    await this.page.getByRole('button', { name: /grant access/i }).click();
    await this.page.waitForTimeout(500);
  }

  async revokeSuperAdmin(userName: string): Promise<void> {
    await this.openUserActionsMenu(userName);
    await this.page.getByRole('menuitem', { name: /revoke admin/i }).click();
    await this.page.getByRole('button', { name: /revoke access/i }).click();
    await this.page.waitForTimeout(500);
  }

  // Feature Flags Actions
  async createFeatureFlag(key: string, name: string, description?: string): Promise<void> {
    await this.newFlagButton.click();
    await this.flagKeyInput.fill(key);
    await this.flagNameInput.fill(name);
    if (description) {
      await this.flagDescriptionInput.fill(description);
    }
    await this.createFlagConfirmButton.click();
    await this.page.waitForTimeout(500);
  }

  async toggleFeatureFlag(flagName: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: flagName });
    await row.locator('[role="switch"]').click();
    await this.page.waitForTimeout(500);
  }

  async deleteFeatureFlag(flagName: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: flagName });
    await row.getByRole('button', { name: /actions/i }).click();
    await this.page.getByRole('menuitem', { name: /delete/i }).click();
    await this.deleteFlagConfirmButton.click();
    await this.page.waitForTimeout(500);
  }

  // Assertions - Dashboard
  async expectDashboardVisible(): Promise<void> {
    await expect(this.dashboardHeading).toBeVisible();
  }

  async expectStatsCardsVisible(): Promise<void> {
    await expect(this.page.locator('text=/total users/i').first()).toBeVisible();
    await expect(this.page.locator('text=/organizations/i').first()).toBeVisible();
  }

  async expectSystemHealthVisible(): Promise<void> {
    await expect(this.systemHealthCard).toBeVisible();
  }

  async expectQuickActionsVisible(): Promise<void> {
    await expect(this.quickActionsCard).toBeVisible();
  }

  // Assertions - Organizations
  async expectOrganizationsPageVisible(): Promise<void> {
    await expect(this.orgsHeading).toBeVisible();
  }

  async expectOrganizationsTableVisible(): Promise<void> {
    await expect(this.orgsTable).toBeVisible();
  }

  async expectOrganizationInList(orgName: string): Promise<void> {
    await expect(this.page.locator('tbody tr').filter({ hasText: orgName })).toBeVisible();
  }

  // Assertions - Users
  async expectUsersPageVisible(): Promise<void> {
    await expect(this.usersHeading).toBeVisible();
  }

  async expectUsersTableVisible(): Promise<void> {
    await expect(this.usersTable).toBeVisible();
  }

  async expectUserInList(userName: string): Promise<void> {
    await expect(this.page.locator('tbody tr').filter({ hasText: userName })).toBeVisible();
  }

  // Assertions - Feature Flags
  async expectFeatureFlagsPageVisible(): Promise<void> {
    await expect(this.flagsHeading).toBeVisible();
  }

  async expectFeatureFlagsTableVisible(): Promise<void> {
    await expect(this.flagsTable).toBeVisible();
  }

  async expectFlagInList(flagName: string): Promise<void> {
    await expect(this.page.locator('tbody tr').filter({ hasText: flagName })).toBeVisible();
  }

  // Utility Methods
  async getOrganizationCount(): Promise<number> {
    const countText = await this.page.locator('text=/\\d+ total organizations/i').textContent();
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getUserCount(): Promise<number> {
    const countText = await this.page.locator('text=/\\d+ total users/i').textContent();
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getFlagCount(): Promise<number> {
    const countText = await this.page.locator('text=/\\d+ flags configured/i').textContent();
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

export function createAdminPage(page: Page): AdminPage {
  return new AdminPage(page);
}
