import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TIMEOUTS } from '../../helpers/fixtures';

/**
 * Storefront Pages Dashboard Page Object
 *
 * Encapsulates interactions with the storefront pages management in the dashboard.
 */
export class StorefrontPagesPage extends BasePage {
  private readonly orgSlug: string;
  private readonly attractionId: string;

  constructor(page: Page, orgSlug: string, attractionId: string) {
    super(page);
    this.orgSlug = orgSlug;
    this.attractionId = attractionId;
  }

  // ============================================================================
  // Locators - Pages List
  // ============================================================================

  /** Page heading */
  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Pages', level: 1 }).first();
  }

  /** Create Page button */
  get createPageButton(): Locator {
    return this.page.getByRole('link', { name: /create page/i }).first();
  }

  /** Page list container */
  get pageList(): Locator {
    return this.page.locator('[class*="card"]').filter({ hasText: 'All Pages' }).first();
  }

  /** Individual page rows in the list - each row has an h4 with the page title */
  get pageRows(): Locator {
    // Page rows are in the All Pages section - each has an h4 with the title
    return this.page.locator('main').first().getByRole('heading', { level: 4 });
  }

  /** Empty state message */
  get emptyState(): Locator {
    return this.page.getByText('No pages yet').first();
  }

  /** Published pages count stat card */
  get publishedCount(): Locator {
    // Target the stat card specifically - use first() to avoid strict mode violation
    return this.page
      .locator('[class*="card"]')
      .filter({ hasText: 'Published' })
      .locator('.text-2xl')
      .first();
  }

  /** Drafts count stat card */
  get draftsCount(): Locator {
    return this.page
      .locator('[class*="card"]')
      .filter({ hasText: 'Drafts' })
      .locator('.text-2xl')
      .first();
  }

  // ============================================================================
  // Locators - Page Editor Form
  // ============================================================================

  /** Title input field */
  get titleInput(): Locator {
    return this.page.locator('#title').first();
  }

  /** Slug input field */
  get slugInput(): Locator {
    return this.page.locator('#slug');
  }

  /** Content editor - the Slate rich text editor textbox adjacent to the toolbar */
  get contentEditor(): Locator {
    // The Slate editor is a textbox that's in the Content section
    // Use the heading "Content" to find the right section, then get the textbox
    return this.page
      .locator('h3')
      .filter({ hasText: 'Content' })
      .locator('..')
      .locator('..')
      .locator('[role="textbox"]');
  }

  /** Status select */
  get statusSelect(): Locator {
    return this.page.locator('button').filter({ hasText: /draft|published|archived/i }).first();
  }

  /** Page type select */
  get pageTypeSelect(): Locator {
    return this.page
      .locator('[class*="card"]')
      .filter({ hasText: 'Page Type' })
      .locator('button[role="combobox"]');
  }

  /** Show in navigation toggle */
  get showInNavSwitch(): Locator {
    return this.page.locator('button[role="switch"]');
  }

  /** Save/Create Page button */
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: /create page|save changes/i }).first();
  }

  /** Back to pages button */
  get backButton(): Locator {
    return this.page.getByRole('button', { name: /back to pages/i });
  }

  /** Preview button (edit mode only) */
  get previewButton(): Locator {
    return this.page.getByRole('button', { name: /preview/i });
  }

  // ============================================================================
  // Locators - SEO Fields
  // ============================================================================

  /** Meta title input */
  get metaTitleInput(): Locator {
    return this.page.locator('#seoTitle');
  }

  /** Meta description textarea */
  get metaDescriptionInput(): Locator {
    return this.page.locator('#seoDescription');
  }

  /** OG image URL input */
  get ogImageInput(): Locator {
    return this.page.locator('#seoOgImage');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to the storefront pages list
   */
  override async goto(): Promise<void> {
    await super.goto(`/${this.orgSlug}/attractions/${this.attractionId}/storefront/pages`);
  }

  /**
   * Navigate to the new page form
   */
  async gotoNewPage(): Promise<void> {
    await super.goto(`/${this.orgSlug}/attractions/${this.attractionId}/storefront/pages/new`);
  }

  /**
   * Navigate to edit a specific page
   */
  async gotoEditPage(pageId: string): Promise<void> {
    await super.goto(
      `/${this.orgSlug}/attractions/${this.attractionId}/storefront/pages/${pageId}/edit`
    );
  }

  // ============================================================================
  // Actions - Pages List
  // ============================================================================

  /**
   * Get a page row by title - finds the row container with the rounded border
   */
  getPageRow(pageTitle: string): Locator {
    // Find the row container (div with border class) that contains the page title
    return this.page
      .locator('main')
      .first()
      .locator('div.rounded-lg.border')
      .filter({ hasText: pageTitle })
      .first();
  }

  /**
   * Click Edit button for a page
   */
  async clickEditPage(pageTitle: string): Promise<void> {
    const row = this.getPageRow(pageTitle);
    await expect(row).toBeVisible({ timeout: TIMEOUTS.standard });
    await row.getByRole('link', { name: /edit/i }).first().click();
    await this.waitForPageLoad();
  }

  /**
   * Click View button for a published page
   */
  async clickViewPage(pageTitle: string): Promise<void> {
    const row = this.getPageRow(pageTitle);
    const viewLink = row.getByRole('link', { name: /view/i });
    await viewLink.click();
  }

  /**
   * Open action menu for a page and click an action
   */
  async clickPageAction(pageTitle: string, action: 'publish' | 'unpublish' | 'archive' | 'delete'): Promise<void> {
    const row = this.getPageRow(pageTitle);
    // Find the dropdown trigger (button with more icon)
    const moreButton = row.locator('button').last();
    await moreButton.click();
    await this.page.waitForTimeout(200);

    // Click the action
    const actionText = {
      publish: /publish/i,
      unpublish: /unpublish|make draft/i,
      archive: /archive/i,
      delete: /delete/i,
    };

    const menuItem = this.page.locator('[role="menuitem"]').filter({ hasText: actionText[action] });
    await menuItem.click();
    await this.page.waitForTimeout(500);
  }

  // ============================================================================
  // Actions - Page Editor
  // ============================================================================

  /**
   * Fill the page form with basic data
   */
  async fillPageForm(data: {
    title: string;
    slug?: string;
    content?: string;
    status?: 'draft' | 'published' | 'archived';
    pageType?: string;
    showInNav?: boolean;
    seo?: {
      title?: string;
      description?: string;
      ogImage?: string;
    };
  }): Promise<void> {
    // Fill title
    await this.titleInput.fill(data.title);

    // Fill slug if provided (otherwise auto-generated from title)
    if (data.slug) {
      await this.slugInput.fill(data.slug);
    }

    // Fill content if provided - Slate editor needs special handling
    if (data.content) {
      const editor = this.contentEditor;
      if (await editor.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editor.click();
        // Slate editors need keyboard input, not fill()
        await this.page.keyboard.type(data.content);
      }
    }

    // Set status if provided
    if (data.status) {
      await this.statusSelect.click();
      await this.page.waitForTimeout(100);
      const statusOption = this.page.getByRole('option', { name: new RegExp(data.status, 'i') });
      await statusOption.click();
    }

    // Set page type if provided
    if (data.pageType) {
      await this.pageTypeSelect.click();
      await this.page.waitForTimeout(100);
      const typeOption = this.page.getByRole('option', { name: new RegExp(data.pageType, 'i') });
      await typeOption.click();
    }

    // Toggle show in nav if specified
    if (data.showInNav !== undefined) {
      const isChecked = await this.showInNavSwitch.getAttribute('data-state');
      if ((data.showInNav && isChecked !== 'checked') || (!data.showInNav && isChecked === 'checked')) {
        await this.showInNavSwitch.click();
      }
    }

    // Fill SEO fields if provided
    if (data.seo) {
      if (data.seo.title) {
        await this.metaTitleInput.fill(data.seo.title);
      }
      if (data.seo.description) {
        await this.metaDescriptionInput.fill(data.seo.description);
      }
      if (data.seo.ogImage) {
        await this.ogImageInput.fill(data.seo.ogImage);
      }
    }
  }

  /**
   * Click save/create button and wait for navigation
   */
  async savePage(): Promise<void> {
    await this.saveButton.click();
    // Wait for redirect back to pages list
    await this.page.waitForURL(/\/storefront\/pages$/);
    await this.waitForPageLoad();
  }

  /**
   * Create a new page with the given data
   */
  async createPage(data: {
    title: string;
    slug?: string;
    content?: string;
    status?: 'draft' | 'published' | 'archived';
    pageType?: string;
    showInNav?: boolean;
  }): Promise<void> {
    await this.gotoNewPage();
    await this.fillPageForm(data);
    await this.savePage();
  }

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert pages list is displayed
   */
  async expectPagesListVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.createPageButton).toBeVisible();
  }

  /**
   * Assert new page form is displayed
   */
  async expectNewPageFormVisible(): Promise<void> {
    // Use .first() to handle duplicate elements (e.g., from layout double-rendering)
    await expect(
      this.page.locator('h1').filter({ hasText: /create new page/i }).first()
    ).toBeVisible({
      timeout: TIMEOUTS.standard,
    });
    await expect(this.titleInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  /**
   * Assert edit page form is displayed
   */
  async expectEditPageFormVisible(): Promise<void> {
    await expect(this.titleInput).toBeVisible({ timeout: TIMEOUTS.standard });
    await expect(this.saveButton).toBeVisible();
    await expect(this.previewButton).toBeVisible();
  }

  /**
   * Assert a page exists in the list
   */
  async expectPageInList(pageTitle: string): Promise<void> {
    await expect(this.getPageRow(pageTitle)).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Assert a page has a specific status
   */
  async expectPageStatus(pageTitle: string, status: 'published' | 'draft' | 'archived'): Promise<void> {
    const row = this.getPageRow(pageTitle);
    await expect(row).toBeVisible({ timeout: TIMEOUTS.standard });
    // Status badge should contain the status text - use .first() to handle multiple matches
    await expect(row.locator('span').filter({ hasText: new RegExp(status, 'i') }).first()).toBeVisible();
  }

  /**
   * Assert no pages exist
   */
  async expectNoPages(): Promise<void> {
    await expect(this.emptyState).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  /**
   * Assert page count matches expected
   */
  async expectPageCount(count: number): Promise<void> {
    if (count === 0) {
      await this.expectNoPages();
    } else {
      await expect(this.pageRows).toHaveCount(count, { timeout: TIMEOUTS.standard });
    }
  }

  /**
   * Assert toast notification appears
   */
  async expectToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator('[role="alert"], [data-sonner-toast]');
    await expect(toast.filter({ hasText: message })).toBeVisible({ timeout: TIMEOUTS.standard });
  }
}

/**
 * Create a StorefrontPagesPage instance
 */
export function createStorefrontPagesPage(
  page: Page,
  orgSlug: string,
  attractionId: string
): StorefrontPagesPage {
  return new StorefrontPagesPage(page, orgSlug, attractionId);
}
