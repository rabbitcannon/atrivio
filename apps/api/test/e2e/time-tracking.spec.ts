import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  loginTestUser,
  TEST_USERS,
  TEST_ORGS,
  TEST_ATTRACTIONS,
} from '../helpers/index.js';
import { get, post } from '../helpers/request.js';

describe('Time Tracking (F7a)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /organizations/:orgId/time/my-status', () => {
    it('should get status for staff member using org UUID', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/time/my-status`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('is_clocked_in');
      expect(response.body).toHaveProperty('staff_id');
      expect(response.body).toHaveProperty('attractions');
    });

    it('should get status for staff member using org slug', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get('/organizations/nightmare-manor/time/my-status', {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('is_clocked_in');
      expect(response.body).toHaveProperty('staff_id');
    });

    it('should reject unauthenticated request', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/time/my-status`);

      expect(response.statusCode).toBe(401);
    });

    it('should allow super admin to access', async () => {
      // Super admin bypasses org membership check
      const admin = await loginTestUser(TEST_USERS.superAdmin.email, TEST_USERS.superAdmin.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/time/my-status`, {
        token: admin.accessToken,
      });

      // Super admin gets 404 because they don't have an org_membership record
      // This is expected - they can access the endpoint but have no staff record
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe('POST /organizations/:orgId/time/clock-in', () => {
    it('should clock in a staff member', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // First check if already clocked in
      const statusResponse = await get<{ is_clocked_in: boolean }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );

      // If already clocked in, clock out first
      if (statusResponse.body.is_clocked_in) {
        await post(`/organizations/${TEST_ORGS.nightmareManor}/time/clock-out`, {}, {
          token: actor.accessToken,
        });
      }

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time/clock-in`,
        { attraction_id: TEST_ATTRACTIONS.mainHaunt },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('clock_in');
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      // First check status and clock out if needed
      const statusResponse = await get<{ is_clocked_in: boolean }>(
        '/organizations/nightmare-manor/time/my-status',
        { token: manager.accessToken }
      );

      if (statusResponse.body.is_clocked_in) {
        await post('/organizations/nightmare-manor/time/clock-out', {}, {
          token: manager.accessToken,
        });
      }

      const response = await post(
        '/organizations/nightmare-manor/time/clock-in',
        { attraction_id: TEST_ATTRACTIONS.mainHaunt },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should reject double clock-in', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Ensure we're clocked in first
      const statusResponse = await get<{ is_clocked_in: boolean }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );

      if (!statusResponse.body.is_clocked_in) {
        await post(
          `/organizations/${TEST_ORGS.nightmareManor}/time/clock-in`,
          { attraction_id: TEST_ATTRACTIONS.mainHaunt },
          { token: actor.accessToken }
        );
      }

      // Try to clock in again
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time/clock-in`,
        { attraction_id: TEST_ATTRACTIONS.mainHaunt },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code');
      expect((response.body as { code: string }).code).toBe('STAFF_ALREADY_CLOCKED_IN');
    });

    it('should reject unauthenticated request', async () => {
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time/clock-in`,
        { attraction_id: TEST_ATTRACTIONS.mainHaunt }
      );

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /organizations/:orgId/time/clock-out', () => {
    it('should clock out a staff member', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Ensure we're clocked in first
      const statusResponse = await get<{ is_clocked_in: boolean }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );

      if (!statusResponse.body.is_clocked_in) {
        await post(
          `/organizations/${TEST_ORGS.nightmareManor}/time/clock-in`,
          { attraction_id: TEST_ATTRACTIONS.mainHaunt },
          { token: actor.accessToken }
        );
      }

      const response = await post(`/organizations/${TEST_ORGS.nightmareManor}/time/clock-out`, {}, {
        token: actor.accessToken,
      });

      // POST returns 201 by default in NestJS, but update operations often return 200
      expect([200, 201]).toContain(response.statusCode);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('clock_out');
    });

    it('should reject clock-out when not clocked in', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Ensure we're clocked out first
      const statusResponse = await get<{ is_clocked_in: boolean }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );

      if (statusResponse.body.is_clocked_in) {
        await post(`/organizations/${TEST_ORGS.nightmareManor}/time/clock-out`, {}, {
          token: actor.accessToken,
        });
      }

      // Try to clock out again
      const response = await post(`/organizations/${TEST_ORGS.nightmareManor}/time/clock-out`, {}, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code');
      expect((response.body as { code: string }).code).toBe('STAFF_NOT_CLOCKED_IN');
    });
  });

  describe('GET /organizations/:orgId/time/active', () => {
    it('should allow managers to view active staff', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/time/active`, {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
      // API returns { data: [...], count: X }
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray((response.body as { data: unknown[] }).data)).toBe(true);
    });

    it('should allow owners to view active staff', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/organizations/nightmare-manor/time/active', {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray((response.body as { data: unknown[] }).data)).toBe(true);
    });

    it('should reject actors from viewing active staff (role restriction)', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/time/active`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /organizations/by-slug/:slug', () => {
    it('should get org info by slug (public endpoint)', async () => {
      const response = await get('/organizations/by-slug/nightmare-manor');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect((response.body as { name: string }).name).toBe('Nightmare Manor');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await get('/organizations/by-slug/non-existent-org');

      expect(response.statusCode).toBe(404);
    });
  });
});
