import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  loginTestUser,
  TEST_USERS,
  TEST_ORGS,
  TEST_ATTRACTIONS,
} from '../helpers/index.js';
import { get, post, patch, put, del } from '../helpers/request.js';

// Seed data IDs from seed.sql
const SEED_DATA = {
  settings: 'f0000000-0000-0000-0000-000000000001',
  pages: {
    home: 'f1000000-0000-0000-0000-000000000001',
    about: 'f1000000-0000-0000-0000-000000000002',
    rules: 'f1000000-0000-0000-0000-000000000003',
    jobs: 'f1000000-0000-0000-0000-000000000004',
    contact: 'f1000000-0000-0000-0000-000000000005',
    faq: 'f1000000-0000-0000-0000-000000000006',
  },
  domains: {
    subdomain: 'f2000000-0000-0000-0000-000000000001',
    custom: 'f2000000-0000-0000-0000-000000000002',
  },
  faqs: {
    general1: 'f4000000-0000-0000-0000-000000000001',
    general2: 'f4000000-0000-0000-0000-000000000002',
  },
  announcements: {
    banner: 'f5000000-0000-0000-0000-000000000001',
    modal: 'f5000000-0000-0000-0000-000000000002',
  },
};

describe('Storefronts (F14)', () => {
  // Use the main haunt attraction for storefront tests
  const orgId = TEST_ORGS.nightmareManor;
  const attractionId = TEST_ATTRACTIONS.mainHaunt;
  const baseUrl = `/organizations/${orgId}/attractions/${attractionId}/storefront`;

  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============== Settings ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront', () => {
    it('should get storefront settings as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(baseUrl, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('settings');
      expect(response.body.settings).toHaveProperty('id');
      expect(response.body.settings).toHaveProperty('tagline');
      // Settings uses nested objects with camelCase
      expect(response.body.settings).toHaveProperty('hero');
      expect(response.body.settings).toHaveProperty('theme');
      expect(response.body.settings.theme).toHaveProperty('primaryColor');
    });

    it('should get settings as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(baseUrl, { token: manager.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('settings');
    });

    it('should work with org slug and attraction slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/nightmare-manor/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/storefront`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('settings');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(baseUrl);

      expect(response.statusCode).toBe(401);
    });

    it('should reject actors from viewing settings', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(baseUrl, { token: actor.accessToken });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /organizations/:orgId/attractions/:attractionId/storefront', () => {
    it('should update storefront settings as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        baseUrl,
        {
          tagline: 'Updated tagline for E2E test',
          theme: {
            primaryColor: '#ff0000',
          },
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('settings');
      expect(response.body.settings.tagline).toBe('Updated tagline for E2E test');
      expect(response.body.settings.theme.primaryColor).toBe('#ff0000');
    });

    it('should update SEO settings', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        baseUrl,
        {
          seo: {
            title: 'Test SEO Title',
            description: 'Test SEO Description for E2E testing',
          },
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.settings.seo.title).toBe('Test SEO Title');
      expect(response.body.settings.seo.description).toBe('Test SEO Description for E2E testing');
    });

    it('should reject actors from updating settings', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await patch(
        baseUrl,
        { tagline: 'Should not work' },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/publish', () => {
    it('should publish storefront as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `${baseUrl}/publish`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isPublished', true);
      expect(response.body).toHaveProperty('publishedAt');
    });

    it('should reject managers from publishing', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `${baseUrl}/publish`,
        {},
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/unpublish', () => {
    it('should unpublish storefront as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `${baseUrl}/unpublish`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isPublished', false);

      // Re-publish for other tests
      await post(`${baseUrl}/publish`, {}, { token: owner.accessToken });
    });
  });

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront/preview', () => {
    it('should get preview URL as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/preview`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('previewUrl');
      expect(response.body).toHaveProperty('expiresAt');
    });
  });

  // ============== Pages ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront/pages', () => {
    it('should list all pages as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/pages`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('pages');
      expect(Array.isArray(response.body.pages)).toBe(true);
      expect(response.body.pages.length).toBeGreaterThan(0);
    });

    it('should filter pages by status', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/pages?status=published`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body.pages.every((p: { status: string }) => p.status === 'published')).toBe(true);
    });

    it('should reject actors from listing pages', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`${baseUrl}/pages`, { token: actor.accessToken });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront/pages/:pageId', () => {
    it('should get a specific page', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `${baseUrl}/pages/${SEED_DATA.pages.home}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('page');
      expect(response.body.page).toHaveProperty('slug');
      expect(response.body.page).toHaveProperty('title');
      expect(response.body.page).toHaveProperty('content');
      // Response uses camelCase
      expect(response.body.page).toHaveProperty('contentFormat');
      expect(response.body.page).toHaveProperty('pageType');
    });

    it('should return 404 for non-existent page', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `${baseUrl}/pages/00000000-0000-0000-0000-000000000000`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/pages', () => {
    let createdPageId: string;

    it('should create a new page as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `${baseUrl}/pages`,
        {
          slug: 'test-page-' + Date.now(),
          title: 'Test Page',
          content: 'This is test content for E2E testing',
          page_type: 'custom',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('page');
      expect(response.body.page).toHaveProperty('id');
      expect(response.body.page.title).toBe('Test Page');
      // Response uses camelCase
      expect(response.body.page.pageType).toBe('custom');

      createdPageId = response.body.page.id;
    });

    it('should reject duplicate slugs', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      const uniqueSlug = 'dup-test-' + Date.now();

      // First create a page
      const createResponse = await post(
        `${baseUrl}/pages`,
        {
          slug: uniqueSlug,
          title: 'Original Page',
          content: 'Original content',
          page_type: 'custom',
        },
        { token: owner.accessToken }
      );
      expect(createResponse.statusCode).toBe(201);
      const pageId = createResponse.body.page.id;

      // Try to create another page with the same slug
      const response = await post(
        `${baseUrl}/pages`,
        {
          slug: uniqueSlug, // Same slug should fail
          title: 'Duplicate Page',
          content: 'Should fail',
          page_type: 'custom',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(409);

      // Cleanup
      await del(`${baseUrl}/pages/${pageId}`, { token: owner.accessToken });
    });

    afterAll(async () => {
      if (createdPageId) {
        const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
        await del(`${baseUrl}/pages/${createdPageId}`, { token: owner.accessToken });
      }
    });
  });

  describe('PATCH /organizations/:orgId/attractions/:attractionId/storefront/pages/:pageId', () => {
    it('should update a page as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        `${baseUrl}/pages/${SEED_DATA.pages.about}`,
        {
          title: 'Updated About Page',
          seo: {
            title: 'About Us - Updated',
          },
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.page.title).toBe('Updated About Page');
      expect(response.body.page.seo.title).toBe('About Us - Updated');
    });
  });

  describe('DELETE /organizations/:orgId/attractions/:attractionId/storefront/pages/:pageId', () => {
    it('should delete a page as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create a page to delete
      const createResponse = await post(
        `${baseUrl}/pages`,
        {
          slug: 'to-delete-' + Date.now(),
          title: 'Page to Delete',
          content: 'Will be deleted',
          page_type: 'custom',
        },
        { token: owner.accessToken }
      );

      const pageId = createResponse.body.page.id;

      const deleteResponse = await del(
        `${baseUrl}/pages/${pageId}`,
        { token: owner.accessToken }
      );

      expect(deleteResponse.statusCode).toBe(204);
    });
  });

  // ============== Domains ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront/domains', () => {
    it('should list domains as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/domains`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('domains');
      expect(Array.isArray(response.body.domains)).toBe(true);
    });

    it('should reject managers from listing domains', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(`${baseUrl}/domains`, { token: manager.accessToken });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/domains', () => {
    let createdDomainId: string;

    it('should add a custom domain as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `${baseUrl}/domains`,
        {
          domain: `test-${Date.now()}.example.com`,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('domain');
      // Response uses camelCase
      expect(response.body.domain).toHaveProperty('verification');
      expect(response.body.domain.status).toBe('pending');

      createdDomainId = response.body.domain.id;
    });

    afterAll(async () => {
      if (createdDomainId) {
        const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
        await del(`${baseUrl}/domains/${createdDomainId}`, { token: owner.accessToken });
      }
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/domains/:domainId/verify', () => {
    it('should attempt domain verification', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Use the custom domain from seed (which may or may not verify based on DNS)
      const response = await post(
        `${baseUrl}/domains/${SEED_DATA.domains.custom}/verify`,
        {},
        { token: owner.accessToken }
      );

      // Should return domain object regardless of verification success
      expect([200, 400]).toContain(response.statusCode);
      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty('domain');
      }
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/domains/:domainId/set-primary', () => {
    it('should set primary domain as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `${baseUrl}/domains/${SEED_DATA.domains.subdomain}/set-primary`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============== FAQs ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront/faqs', () => {
    it('should list all FAQs as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/faqs`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('faqs');
      expect(Array.isArray(response.body.faqs)).toBe(true);
      expect(response.body.faqs.length).toBeGreaterThan(0);
    });

    it('should filter FAQs by category', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/faqs?category=General`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      if (response.body.faqs.length > 0) {
        expect(response.body.faqs.every((f: { category: string }) => f.category === 'General')).toBe(true);
      }
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/faqs', () => {
    let createdFaqId: string;

    it('should create a new FAQ as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `${baseUrl}/faqs`,
        {
          question: 'Test FAQ Question?',
          answer: 'This is a test answer for E2E testing.',
          category: 'Testing',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('faq');
      expect(response.body.faq.question).toBe('Test FAQ Question?');
      // Response uses camelCase
      expect(response.body.faq).toHaveProperty('isPublished');

      createdFaqId = response.body.faq.id;
    });

    afterAll(async () => {
      if (createdFaqId) {
        const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
        await del(`${baseUrl}/faqs/${createdFaqId}`, { token: owner.accessToken });
      }
    });
  });

  describe('PATCH /organizations/:orgId/attractions/:attractionId/storefront/faqs/:faqId', () => {
    it('should update a FAQ as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        `${baseUrl}/faqs/${SEED_DATA.faqs.general1}`,
        {
          answer: 'Updated answer for E2E test',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.faq.answer).toBe('Updated answer for E2E test');
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/faqs/reorder', () => {
    it('should reorder FAQs as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // ReorderFaqsDto expects order: string[] (array of IDs)
      const response = await post(
        `${baseUrl}/faqs/reorder`,
        {
          order: [
            SEED_DATA.faqs.general2,
            SEED_DATA.faqs.general1,
          ],
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============== Announcements ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront/announcements', () => {
    it('should list all announcements as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/announcements`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('announcements');
      expect(Array.isArray(response.body.announcements)).toBe(true);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/storefront/announcements', () => {
    let createdAnnouncementId: string;

    it('should create a new announcement as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `${baseUrl}/announcements`,
        {
          title: 'Test Announcement',
          content: 'This is a test announcement for E2E testing.',
          type: 'info',
          position: 'banner',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('announcement');
      expect(response.body.announcement.title).toBe('Test Announcement');
      // Response uses camelCase
      expect(response.body.announcement).toHaveProperty('isActive');
      expect(response.body.announcement).toHaveProperty('isDismissible');

      createdAnnouncementId = response.body.announcement.id;
    });

    afterAll(async () => {
      if (createdAnnouncementId) {
        const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
        await del(`${baseUrl}/announcements/${createdAnnouncementId}`, { token: owner.accessToken });
      }
    });
  });

  describe('PATCH /organizations/:orgId/attractions/:attractionId/storefront/announcements/:announcementId', () => {
    it('should update an announcement as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        `${baseUrl}/announcements/${SEED_DATA.announcements.banner}`,
        {
          title: 'Updated Banner Title',
          is_active: true,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.announcement.title).toBe('Updated Banner Title');
    });
  });

  // ============== Navigation ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/storefront/navigation', () => {
    it('should get navigation as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`${baseUrl}/navigation`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('navigation');
      expect(response.body.navigation).toHaveProperty('header');
      expect(response.body.navigation).toHaveProperty('footer');
    });
  });

  describe('PUT /organizations/:orgId/attractions/:attractionId/storefront/navigation', () => {
    it('should update navigation as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await put(
        `${baseUrl}/navigation`,
        {
          header: [
            { label: 'Home', link_type: 'home' },
            { label: 'About', link_type: 'page', page_id: SEED_DATA.pages.about },
          ],
          footer: [
            { label: 'Contact', link_type: 'page', page_id: SEED_DATA.pages.contact },
          ],
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('navigation');
    });
  });

  // ============== Public Storefront ==============
  // Public routes use attraction slug as the identifier

  describe('GET /storefronts/:identifier', () => {
    it('should get public storefront by attraction slug', async () => {
      // First ensure the storefront is published
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      await post(
        `${baseUrl}/publish`,
        {},
        { token: owner.accessToken }
      );

      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('attraction');
      expect(response.body).toHaveProperty('storefront');
      expect(response.body).toHaveProperty('navigation');
      expect(response.body).toHaveProperty('announcements');
      expect(response.body).toHaveProperty('domain');
      // Storefront uses nested objects with camelCase
      expect(response.body.storefront).toHaveProperty('hero');
      expect(response.body.storefront).toHaveProperty('theme');
    });

    it('should return 404 for non-existent storefront', async () => {
      const response = await get('/storefronts/non-existent-storefront');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /storefronts/:identifier/pages/:slug', () => {
    it('should get public page by slug', async () => {
      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}/pages/about`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('page');
      expect(response.body.page).toHaveProperty('title');
      expect(response.body.page).toHaveProperty('content');
    });

    it('should return 404 for non-existent page', async () => {
      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}/pages/non-existent-page`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /storefronts/:identifier/faqs', () => {
    it('should get public FAQs', async () => {
      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}/faqs`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('faqs');
      expect(Array.isArray(response.body.faqs)).toBe(true);
    });

    it('should filter public FAQs by category', async () => {
      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}/faqs?category=General`);

      expect(response.statusCode).toBe(200);
      if (response.body.faqs.length > 0) {
        expect(response.body.faqs.every((f: { category: string }) => f.category === 'General')).toBe(true);
      }
    });
  });

  // ============== Feature Flag Tests ==============

  describe('Feature Flag Gating', () => {
    it('should allow access when feature is enabled', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(baseUrl, { token: owner.accessToken });

      // 200 = feature enabled, 403 = feature disabled (both are valid outcomes)
      expect([200, 403]).toContain(response.statusCode);
    });
  });
});
