import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  loginTestUser,
  TEST_ATTRACTIONS,
  TEST_ORGS,
  TEST_USERS,
} from '../helpers/index.js';
import { get, post } from '../helpers/request.js';

/**
 * Phase 16: Performance Testing
 *
 * Tests API response times and ensures they meet performance budgets.
 * Performance budgets are based on user experience requirements:
 * - Fast operations (reads): < 200ms
 * - Medium operations (simple writes): < 500ms
 * - Complex operations (multi-step): < 1000ms
 */

const PERFORMANCE_BUDGETS = {
  FAST: 200, // Simple reads, cached data
  MEDIUM: 500, // Writes, filtered queries
  SLOW: 1000, // Complex operations, multiple DB calls
  VERY_SLOW: 2000, // Batch operations, report generation
};

interface TimedResponse<T = unknown> {
  response: {
    statusCode: number;
    body: T;
  };
  duration: number;
}

async function timedGet<T = unknown>(
  url: string,
  options?: { token?: string }
): Promise<TimedResponse<T>> {
  const start = performance.now();
  const response = await get<T>(url, options);
  const duration = performance.now() - start;
  return { response, duration };
}

async function timedPost<T = unknown>(
  url: string,
  body: unknown,
  options?: { token?: string }
): Promise<TimedResponse<T>> {
  const start = performance.now();
  const response = await post<T>(url, body, options);
  const duration = performance.now() - start;
  return { response, duration };
}

describe('Phase 16: Performance Tests', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============================================================================
  // AUTHENTICATION PERFORMANCE
  // ============================================================================
  describe('Authentication Performance', () => {
    it('Login should complete within budget', async () => {
      const start = performance.now();
      await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });

    it('Token validation (protected route) should be fast', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const { response, duration } = await timedGet(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });
  });

  // ============================================================================
  // READ OPERATIONS PERFORMANCE
  // ============================================================================
  describe('Read Operations Performance', () => {
    let ownerToken: string;

    beforeAll(async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      ownerToken = owner.accessToken;
    });

    it('Organization details should load fast', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });

    it('Attractions list should load within budget', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });

    it('Staff list should load within budget', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/staff`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });

    it('Ticket types list should load within budget', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/ticket-types`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });

    it('Check-in stats should load within budget', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });

    it('Notification templates should load fast', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });

    it('Queue config should load within budget', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      // Queue config involves more complex queries (feature flag checks, etc.)
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });

    it('Schedules list should load within budget', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });
  });

  // ============================================================================
  // WRITE OPERATIONS PERFORMANCE
  // ============================================================================
  describe('Write Operations Performance', () => {
    let ownerToken: string;

    beforeAll(async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      ownerToken = owner.accessToken;
    });

    it('Creating an order should complete within budget', async () => {
      const { response, duration } = await timedPost(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: `perf-test-${Date.now()}@example.com`,
          items: [
            {
              ticketTypeId: '80000000-0000-0000-0000-000000000001',
              quantity: 2,
            },
          ],
        },
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });

    it('Cart creation should be fast', async () => {
      const { response, duration } = await timedPost(
        `/organizations/${TEST_ORGS.nightmareManor}/cart`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          items: [
            {
              ticketTypeId: '80000000-0000-0000-0000-000000000001',
              quantity: 1,
            },
          ],
        },
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });

    it('Queue entry creation should complete within budget', async () => {
      const { response, duration } = await timedPost(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        {
          guestName: `Perf Test ${Date.now()}`,
          partySize: 2,
          phone: '555-PERF',
        },
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });
  });

  // ============================================================================
  // COMPLEX OPERATIONS PERFORMANCE
  // ============================================================================
  describe('Complex Operations Performance', () => {
    let ownerToken: string;

    beforeAll(async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      ownerToken = owner.accessToken;
    });

    it('Order completion (creates tickets) should complete within budget', async () => {
      // First create an order
      const orderResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: `perf-complete-${Date.now()}@example.com`,
          items: [
            {
              ticketTypeId: '80000000-0000-0000-0000-000000000001',
              quantity: 3,
            },
          ],
        },
        { token: ownerToken }
      );

      const orderId = (orderResponse.body as { id: string }).id;

      // Time the completion (which creates tickets)
      const { response, duration } = await timedPost(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.SLOW);
    });

    it('Walk-up sale (order + check-in) should complete within budget', async () => {
      const { response, duration } = await timedPost(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/walk-up`,
        {
          ticketTypeId: '80000000-0000-0000-0000-000000000001',
          quantity: 2,
          guestNames: ['Perf Guest A', 'Perf Guest B'],
          paymentMethod: 'cash',
          waiverSigned: true,
        },
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(201);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.SLOW);
    });

    it('Queue stats generation should complete within budget', async () => {
      const { response, duration } = await timedGet(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/stats`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });
  });

  // ============================================================================
  // PUBLIC ENDPOINTS PERFORMANCE
  // ============================================================================
  describe('Public Endpoints Performance', () => {
    it('Public storefront should load fast (no auth)', async () => {
      const { response, duration } = await timedGet(
        `/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}`
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });

    it('Public queue info should load fast', async () => {
      const { response, duration } = await timedGet(
        `/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/info`
      );

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });

    it('Public attraction search should be responsive', async () => {
      const { response, duration } = await timedGet('/attractions');

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.FAST);
    });
  });

  // ============================================================================
  // CONCURRENT REQUEST HANDLING
  // ============================================================================
  describe('Concurrent Request Handling', () => {
    let ownerToken: string;

    beforeAll(async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      ownerToken = owner.accessToken;
    });

    it('Should handle 5 concurrent read requests efficiently', async () => {
      const start = performance.now();

      const requests = [
        get(`/organizations/${TEST_ORGS.nightmareManor}`, { token: ownerToken }),
        get(`/organizations/${TEST_ORGS.nightmareManor}/attractions`, { token: ownerToken }),
        get(`/organizations/${TEST_ORGS.nightmareManor}/staff`, { token: ownerToken }),
        get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-types`, { token: ownerToken }),
        get(`/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`, { token: ownerToken }),
      ];

      const results = await Promise.all(requests);
      const duration = performance.now() - start;

      // All should succeed
      results.forEach((r) => expect(r.statusCode).toBe(200));

      // Total time should be less than 5 sequential requests would take
      // (i.e., parallelization is working)
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM * 2);
    });

    it('Should handle 3 concurrent public requests efficiently', async () => {
      const start = performance.now();

      const requests = [
        get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}`),
        get(`/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/info`),
        get('/attractions'),
      ];

      const results = await Promise.all(requests);
      const duration = performance.now() - start;

      // All should succeed
      results.forEach((r) => expect(r.statusCode).toBe(200));

      // Should complete quickly even with multiple requests
      expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.MEDIUM);
    });
  });

  // ============================================================================
  // RESPONSE SIZE VALIDATION
  // ============================================================================
  describe('Response Size Validation', () => {
    let ownerToken: string;

    beforeAll(async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      ownerToken = owner.accessToken;
    });

    it('List responses should include pagination info', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: ownerToken,
      });

      expect(response.statusCode).toBe(200);
      // Orders endpoint returns paginated data
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('Staff list should be reasonably sized', async () => {
      const response = await get<{ data: unknown[] }>(
        `/organizations/${TEST_ORGS.nightmareManor}/staff`,
        { token: ownerToken }
      );

      expect(response.statusCode).toBe(200);
      // Nightmare Manor has ~8 staff in seed data
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.length).toBeLessThan(100);
    });
  });
});
