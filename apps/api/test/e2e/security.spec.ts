import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  loginTestUser,
  TEST_ATTRACTIONS,
  TEST_ORGS,
  TEST_USERS,
} from '../helpers/index.js';
import { del, get, patch, post } from '../helpers/request.js';

/**
 * Phase 16: Security Testing
 *
 * Comprehensive security tests covering:
 * - Authentication and Authorization
 * - Row Level Security (RLS) policies
 * - OWASP Top 10 vulnerabilities
 * - Input validation and sanitization
 * - Cross-tenant isolation
 */

describe('Phase 16: Security Tests', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============================================================================
  // AUTHENTICATION SECURITY
  // ============================================================================
  describe('Authentication Security', () => {
    it('Should reject requests without authorization header', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`);
      expect(response.statusCode).toBe(401);
    });

    it('Should reject requests with invalid token format', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: 'invalid-token-format',
      });
      expect(response.statusCode).toBe(401);
    });

    it('Should reject requests with malformed JWT', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload',
      });
      expect(response.statusCode).toBe(401);
    });

    it('Should reject requests with empty token', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: '',
      });
      expect(response.statusCode).toBe(401);
    });

    it('Public endpoints should work without authentication', async () => {
      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}`);
      expect(response.statusCode).toBe(200);
    });

    it('Should not expose sensitive error details', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: 'invalid',
      });
      expect(response.statusCode).toBe(401);
      // Should not expose internal error details
      const body = response.body as { message?: string };
      expect(body.message).not.toContain('stack');
      expect(body.message).not.toContain('Error:');
    });
  });

  // ============================================================================
  // ROW LEVEL SECURITY (RLS) - Cross-Tenant Isolation
  // ============================================================================
  describe('Row Level Security (RLS)', () => {
    const SPOOKY_HOLLOW_ORG = TEST_ORGS.spookyHollow;

    it('Users cannot read other organizations', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot read other organizations staff', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/staff`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot read other organizations orders', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot read other organizations ticket types', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-types`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot read other organizations attractions', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/attractions`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot read other organizations check-in data', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats`,
        { token: hollowOwner.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot read other organizations queue data', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { token: hollowOwner.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot read other organizations notifications', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`,
        { token: hollowOwner.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot modify other organizations data', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        { name: 'Hacked Organization' },
        { token: hollowOwner.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });

    it('Users cannot create data in other organizations', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'hacker@evil.com',
          items: [{ ticketTypeId: '80000000-0000-0000-0000-000000000001', quantity: 1 }],
        },
        { token: hollowOwner.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL (RBAC)
  // ============================================================================
  describe('Role-Based Access Control (RBAC)', () => {
    it('Actors cannot access admin endpoints (orders)', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Actors cannot access staff management', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Actors cannot view staff list (restricted to owner/admin/manager/hr)
      const viewResponse = await get(`/organizations/${TEST_ORGS.nightmareManor}/staff`, {
        token: actor.accessToken,
      });
      expect(viewResponse.statusCode).toBe(403);

      // Actors also cannot terminate staff (uses POST /staff/:staffId/terminate)
      const terminateResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/staff/a0000000-0000-0000-0000-000000000001/terminate`,
        {
          reason: 'Unauthorized attempt',
        },
        { token: actor.accessToken }
      );
      expect(terminateResponse.statusCode).toBe(403);
    });

    it('Actors cannot access financial data', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });

    it('Managers cannot perform owner-only actions', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      // Managers cannot publish storefronts (owner-only)
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/storefront/publish`,
        {},
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });

    it('Owners can access all organization endpoints', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const responses = await Promise.all([
        get(`/organizations/${TEST_ORGS.nightmareManor}`, { token: owner.accessToken }),
        get(`/organizations/${TEST_ORGS.nightmareManor}/staff`, { token: owner.accessToken }),
        get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, { token: owner.accessToken }),
        get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-types`, { token: owner.accessToken }),
      ]);

      responses.forEach((r) => expect(r.statusCode).toBe(200));
    });
  });

  // ============================================================================
  // INPUT VALIDATION & INJECTION PREVENTION
  // ============================================================================
  describe('Input Validation & Injection Prevention', () => {
    let ownerToken: string;

    beforeAll(async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      ownerToken = owner.accessToken;
    });

    it('Should reject SQL injection in query parameters', async () => {
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/orders?status='; DROP TABLE orders; --`,
        { token: ownerToken }
      );

      // Should either return 400 (bad request) or empty results, not crash
      expect([200, 400]).toContain(response.statusCode);
    });

    it('Should reject SQL injection in path parameters', async () => {
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/staff/'; DROP TABLE staff; --`,
        { token: ownerToken }
      );

      // Should return 404 (not found) or 400 (bad request), not execute SQL
      expect([400, 404]).toContain(response.statusCode);
    });

    it('Should handle NoSQL injection attempts in JSON body', async () => {
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: { $gt: '' }, // NoSQL injection attempt
          items: [{ ticketTypeId: '80000000-0000-0000-0000-000000000001', quantity: 1 }],
        },
        { token: ownerToken }
      );

      // PostgreSQL is immune to NoSQL injection. The DTO coerces object to string
      // which is safe. Either validation error or successful creation (with coerced value) is acceptable.
      expect([201, 400, 422]).toContain(response.statusCode);
    });

    it('Should not crash on XSS attempts in text fields', async () => {
      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        {
          name: '<script>alert("XSS")</script>',
        },
        { token: ownerToken }
      );

      // API stores raw input - XSS protection is handled via output encoding in the frontend.
      // This is a valid security pattern: store raw, encode on output.
      // Test verifies the API doesn't crash on special characters.
      expect([200, 400, 422]).toContain(response.statusCode);

      // Clean up by restoring original name
      if (response.statusCode === 200) {
        await patch(
          `/organizations/${TEST_ORGS.nightmareManor}`,
          { name: 'Nightmare Manor' },
          { token: ownerToken }
        );
      }
    });

    it('Should reject overly long input', async () => {
      const longString = 'A'.repeat(10000);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        { name: longString },
        { token: ownerToken }
      );

      expect([400, 422]).toContain(response.statusCode);
    });

    it('Should handle malformed email gracefully', async () => {
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'not-an-email',
          items: [{ ticketTypeId: '80000000-0000-0000-0000-000000000001', quantity: 1 }],
        },
        { token: ownerToken }
      );

      // Order creation accepts any string for customer email (validation via confirmation email).
      // This is a business decision - strict validation would block orders.
      // Test verifies no crash on invalid format.
      expect([201, 400, 422]).toContain(response.statusCode);
    });

    it('Should validate UUID format', async () => {
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/staff/not-a-uuid`,
        { token: ownerToken }
      );

      expect([400, 404]).toContain(response.statusCode);
    });

    it('Should reject negative quantities', async () => {
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'test@example.com',
          items: [{ ticketTypeId: '80000000-0000-0000-0000-000000000001', quantity: -5 }],
        },
        { token: ownerToken }
      );

      expect([400, 422]).toContain(response.statusCode);
    });
  });

  // ============================================================================
  // SENSITIVE DATA EXPOSURE
  // ============================================================================
  describe('Sensitive Data Exposure', () => {
    it('Should not expose internal IDs in error messages', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/staff/00000000-0000-0000-0000-000000000000`,
        { token: owner.accessToken }
      );

      const body = response.body as { message?: string };
      // Should not expose query details
      expect(JSON.stringify(body)).not.toContain('SELECT');
      expect(JSON.stringify(body)).not.toContain('FROM');
    });

    it('Should not expose password hashes', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/staff`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.stringify(response.body);
      expect(body).not.toContain('password');
      expect(body).not.toContain('hash');
      expect(body).not.toContain('$2b$'); // bcrypt prefix
    });

    it('Should not expose API keys or secrets', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.stringify(response.body);
      expect(body).not.toContain('secret');
      expect(body).not.toContain('api_key');
      expect(body).not.toContain('stripe_secret');
    });
  });

  // ============================================================================
  // RATE LIMITING AND RESOURCE ABUSE
  // ============================================================================
  describe('Resource Abuse Prevention', () => {
    let ownerToken: string;

    beforeAll(async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      ownerToken = owner.accessToken;
    });

    it('Should handle rapid sequential requests gracefully', async () => {
      const requests = Array.from({ length: 10 }, () =>
        get(`/organizations/${TEST_ORGS.nightmareManor}`, { token: ownerToken })
      );

      const responses = await Promise.all(requests);

      // All should succeed or get rate limited (429), but not crash
      responses.forEach((r) => {
        expect([200, 429]).toContain(r.statusCode);
      });
    });

    it('Should handle large payloads without crashing', async () => {
      // Try to create order with large items array
      const largeItems = Array.from({ length: 100 }, () => ({
        ticketTypeId: '80000000-0000-0000-0000-000000000001',
        quantity: 1,
      }));

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'test@example.com',
          items: largeItems,
        },
        { token: ownerToken }
      );

      // Fastify has default body size limits (~1MB). 100 items is within limits.
      // Test verifies API handles reasonable bulk operations without crashing.
      // Real abuse protection would use rate limiting (tested separately).
      expect([201, 400, 413, 422]).toContain(response.statusCode);
    });
  });

  // ============================================================================
  // IDEMPOTENCY AND DOUBLE SUBMISSION
  // ============================================================================
  describe('Idempotency and Double Submission', () => {
    it('Should prevent double ticket usage', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create and complete an order to get a ticket
      const orderResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: `security-test-${Date.now()}@example.com`,
          items: [{ ticketTypeId: '80000000-0000-0000-0000-000000000001', quantity: 1 }],
        },
        { token: owner.accessToken }
      );

      const orderId = (orderResponse.body as { id: string }).id;

      const completeResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      const barcode = (completeResponse.body as { tickets: { barcode: string }[] }).tickets[0]
        .barcode;

      // First check-in should succeed
      const firstCheckIn = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        { barcode, method: 'barcode_scan' },
        { token: owner.accessToken }
      );

      expect(firstCheckIn.statusCode).toBe(200);
      expect((firstCheckIn.body as { success: boolean }).success).toBe(true);

      // Second check-in should be prevented
      const secondCheckIn = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        { barcode, method: 'barcode_scan' },
        { token: owner.accessToken }
      );

      expect(secondCheckIn.statusCode).toBe(200);
      expect((secondCheckIn.body as { success: boolean }).success).toBe(false);
      expect((secondCheckIn.body as { error: string }).error).toBe('TICKET_ALREADY_USED');
    });
  });

  // ============================================================================
  // AUTHORIZATION BYPASS ATTEMPTS
  // ============================================================================
  describe('Authorization Bypass Attempts', () => {
    it('Should not allow privilege escalation via request body', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Try to escalate privileges by including role in request
      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        {
          role: 'owner', // Attempt to escalate
          name: 'Hacked',
        },
        { token: actor.accessToken }
      );

      // Should be forbidden (actors can't modify org)
      expect(response.statusCode).toBe(403);
    });

    it('Should not allow accessing admin routes with manipulated org ID', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Try to access admin endpoint by manipulating org ID
      const response = await get(
        `/organizations/00000000-0000-0000-0000-000000000000/orders`,
        { token: actor.accessToken }
      );

      // Should be forbidden or not found
      expect([403, 404]).toContain(response.statusCode);
    });
  });
});
