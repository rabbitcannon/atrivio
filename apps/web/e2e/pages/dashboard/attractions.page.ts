import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Attractions Page Object
 *
 * Handles:
 * - Attractions list page
 * - Attraction detail page
 * - Create attraction page
 * - Seasons management
 * - Zones management
 */
export class AttractionsPage {
  readonly page: Page;
  readonly orgSlug: string;

  // List Page Locators
  readonly pageHeading: Locator;
  readonly addAttractionButton: Locator;
  readonly attractionsGrid: Locator;
  readonly attractionCards: Locator;
  readonly emptyState: Locator;
  readonly errorAlert: Locator;

  // Create Page Locators
  readonly createHeading: Locator;
  readonly attractionForm: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly typeSelect: Locator;
  readonly capacityInput: Locator;
  readonly statusSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Detail Page Locators
  readonly detailHeading: Locator;
  readonly statusBadge: Locator;
  readonly settingsButton: Locator;
  readonly zonesCard: Locator;
  readonly seasonsCard: Locator;
  readonly storefrontCard: Locator;
  readonly zonesCount: Locator;
  readonly capacityDisplay: Locator;
  readonly typeDisplay: Locator;

  // Seasons Page Locators
  readonly seasonsHeading: Locator;
  readonly seasonsList: Locator;
  readonly seasonCards: Locator;
  readonly addSeasonForm: Locator;
  readonly seasonNameInput: Locator;
  readonly seasonStartDate: Locator;
  readonly seasonEndDate: Locator;
  readonly addSeasonButton: Locator;
  readonly noSeasonsState: Locator;

  // Zones Page Locators
  readonly zonesHeading: Locator;
  readonly zonesList: Locator;
  readonly zoneCards: Locator;
  readonly addZoneForm: Locator;
  readonly zoneNameInput: Locator;
  readonly zoneDescriptionInput: Locator;
  readonly zoneCapacityInput: Locator;
  readonly zoneColorInput: Locator;
  readonly addZoneButton: Locator;
  readonly noZonesState: Locator;

  // Breadcrumb
  readonly breadcrumb: Locator;

  constructor(page: Page, orgSlug: string) {
    this.page = page;
    this.orgSlug = orgSlug;

    // List Page
    this.pageHeading = page.getByRole('heading', { name: /attractions/i, level: 1 });
    this.addAttractionButton = page.getByRole('link', { name: /add attraction/i });
    this.attractionsGrid = page.locator('[class*="grid"]').first();
    this.attractionCards = page.locator('[data-testid="attraction-card"], [class*="card"]');
    this.emptyState = page.locator('text=/no attractions|get started|create your first/i');
    this.errorAlert = page.getByRole('alert');

    // Create Page
    this.createHeading = page.getByRole('heading', { name: /create attraction/i, level: 1 });
    this.attractionForm = page.locator('form');
    this.nameInput = page.getByLabel(/name/i);
    this.descriptionInput = page.getByLabel(/description/i);
    this.typeSelect = page.locator('[name="type"], [data-testid="type-select"]').first();
    this.capacityInput = page.getByLabel(/capacity/i);
    this.statusSelect = page.locator('[name="status"], [data-testid="status-select"]').first();
    this.submitButton = page.getByRole('button', { name: /create|save|submit/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Detail Page
    this.detailHeading = page.getByRole('heading', { level: 1 }).first();
    this.statusBadge = page.locator('[class*="badge"]').first();
    this.settingsButton = page.getByRole('link', { name: /settings/i });
    this.zonesCard = page.locator('a[href*="/zones"]').first();
    this.seasonsCard = page.locator('a[href*="/seasons"]').first();
    this.storefrontCard = page.locator('a[href*="/storefront"]').first();
    this.zonesCount = page.locator('text=/\\d+ zone/i');
    this.capacityDisplay = page.locator('text=/capacity/i').locator('xpath=..').locator('[class*="font-bold"]');
    this.typeDisplay = page.locator('[class*="capitalize"]');

    // Seasons Page
    this.seasonsHeading = page.getByRole('heading', { name: /seasons/i, level: 1 });
    this.seasonsList = page.locator('[class*="space-y"]').first();
    this.seasonCards = page.locator('[data-testid="season-card"], [class*="card"]');
    this.addSeasonForm = page.locator('form').first();
    this.seasonNameInput = page.getByLabel(/name|season name/i);
    this.seasonStartDate = page.getByLabel(/start/i);
    this.seasonEndDate = page.getByLabel(/end/i);
    this.addSeasonButton = page.getByRole('button', { name: /add season|create season/i });
    this.noSeasonsState = page.locator('text=/no seasons|create your first season/i');

    // Zones Page
    this.zonesHeading = page.getByRole('heading', { name: /zones/i, level: 1 });
    this.zonesList = page.locator('[class*="space-y"]').first();
    this.zoneCards = page.locator('[data-testid="zone-card"], [class*="card"]');
    this.addZoneForm = page.locator('form').first();
    this.zoneNameInput = page.getByLabel(/name|zone name/i);
    this.zoneDescriptionInput = page.getByLabel(/description/i);
    this.zoneCapacityInput = page.getByLabel(/capacity/i);
    this.zoneColorInput = page.getByLabel(/color/i);
    this.addZoneButton = page.getByRole('button', { name: /add zone|create zone/i });
    this.noZonesState = page.locator('text=/no zones|create your first zone/i');

    // Breadcrumb
    this.breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label="breadcrumb"]');
  }

  // Navigation Methods
  async goto(): Promise<void> {
    await this.page.goto(`/${this.orgSlug}/attractions`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCreate(): Promise<void> {
    await this.page.goto(`/${this.orgSlug}/attractions/new`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoDetail(attractionId: string): Promise<void> {
    await this.page.goto(`/${this.orgSlug}/attractions/${attractionId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoSeasons(attractionId: string): Promise<void> {
    await this.page.goto(`/${this.orgSlug}/attractions/${attractionId}/seasons`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoZones(attractionId: string): Promise<void> {
    await this.page.goto(`/${this.orgSlug}/attractions/${attractionId}/zones`);
    await this.page.waitForLoadState('networkidle');
  }

  // Actions - List Page
  async clickAddAttraction(): Promise<void> {
    await this.addAttractionButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickAttractionCard(name: string): Promise<void> {
    await this.page.locator(`text=${name}`).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  // Actions - Create Page
  async fillAttractionForm(data: {
    name: string;
    description?: string;
    type?: string;
    capacity?: number;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    if (data.capacity) {
      await this.capacityInput.fill(String(data.capacity));
    }
    // Type selection would need specific handling based on UI
  }

  async submitAttractionForm(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForTimeout(500);
  }

  async createAttraction(data: {
    name: string;
    description?: string;
    type?: string;
    capacity?: number;
  }): Promise<void> {
    await this.fillAttractionForm(data);
    await this.submitAttractionForm();
  }

  // Actions - Detail Page
  async clickZonesCard(): Promise<void> {
    await this.zonesCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickSeasonsCard(): Promise<void> {
    await this.seasonsCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickStorefrontCard(): Promise<void> {
    await this.storefrontCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Actions - Seasons Page
  async fillSeasonForm(data: {
    name: string;
    startDate?: string;
    endDate?: string;
  }): Promise<void> {
    await this.seasonNameInput.fill(data.name);
    if (data.startDate) {
      await this.seasonStartDate.fill(data.startDate);
    }
    if (data.endDate) {
      await this.seasonEndDate.fill(data.endDate);
    }
  }

  async addSeason(data: {
    name: string;
    startDate?: string;
    endDate?: string;
  }): Promise<void> {
    await this.fillSeasonForm(data);
    await this.addSeasonButton.click();
    await this.page.waitForTimeout(500);
  }

  // Actions - Zones Page
  async fillZoneForm(data: {
    name: string;
    description?: string;
    capacity?: number;
  }): Promise<void> {
    await this.zoneNameInput.fill(data.name);
    if (data.description) {
      await this.zoneDescriptionInput.fill(data.description);
    }
    if (data.capacity) {
      await this.zoneCapacityInput.fill(String(data.capacity));
    }
  }

  async addZone(data: {
    name: string;
    description?: string;
    capacity?: number;
  }): Promise<void> {
    await this.fillZoneForm(data);
    await this.addZoneButton.click();
    await this.page.waitForTimeout(500);
  }

  // Assertions - List Page
  async expectAttractionsPageVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.addAttractionButton).toBeVisible();
  }

  async expectAttractionsDisplayed(): Promise<void> {
    const hasCards = await this.attractionCards.count();
    expect(hasCards).toBeGreaterThan(0);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  // Assertions - Create Page
  async expectCreatePageVisible(): Promise<void> {
    await expect(this.createHeading).toBeVisible();
    await expect(this.attractionForm).toBeVisible();
  }

  // Assertions - Detail Page
  async expectDetailPageVisible(attractionName?: string): Promise<void> {
    if (attractionName) {
      await expect(this.page.getByRole('heading', { name: attractionName })).toBeVisible();
    } else {
      await expect(this.detailHeading).toBeVisible();
    }
  }

  async expectFeatureCardsVisible(): Promise<void> {
    await expect(this.zonesCard).toBeVisible();
    await expect(this.seasonsCard).toBeVisible();
    await expect(this.storefrontCard).toBeVisible();
  }

  // Assertions - Seasons Page
  async expectSeasonsPageVisible(): Promise<void> {
    await expect(this.seasonsHeading).toBeVisible();
  }

  async expectSeasonsDisplayed(): Promise<void> {
    const seasonCount = await this.seasonCards.count();
    expect(seasonCount).toBeGreaterThan(0);
  }

  async expectNoSeasons(): Promise<void> {
    await expect(this.noSeasonsState).toBeVisible();
  }

  // Assertions - Zones Page
  async expectZonesPageVisible(): Promise<void> {
    await expect(this.zonesHeading).toBeVisible();
  }

  async expectZonesDisplayed(): Promise<void> {
    const zoneCount = await this.zoneCards.count();
    expect(zoneCount).toBeGreaterThan(0);
  }

  async expectNoZones(): Promise<void> {
    await expect(this.noZonesState).toBeVisible();
  }

  // Utility Methods
  async getAttractionCount(): Promise<number> {
    return await this.attractionCards.count();
  }

  async getSeasonCount(): Promise<number> {
    return await this.seasonCards.count();
  }

  async getZoneCount(): Promise<number> {
    return await this.zoneCards.count();
  }
}

export function createAttractionsPage(page: Page, orgSlug: string): AttractionsPage {
  return new AttractionsPage(page, orgSlug);
}
