import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  loginTestUser,
  TEST_ATTRACTIONS,
  TEST_ORGS,
  TEST_USERS,
} from '../helpers/index.js';
import { get } from '../helpers/request.js';

describe('Scheduling (F7b)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /organizations/:orgId/attractions/:attractionId/schedules', () => {
    it('should list schedules for an attraction using UUID', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      // API returns array directly
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should list schedules using org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(
        `/organizations/nightmare-manor/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules`
      );

      expect(response.statusCode).toBe(401);
    });

    it('should filter schedules by date range', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules?startDate=${today}&endDate=${nextWeek}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject actors from viewing all schedules (role restriction)', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /organizations/:orgId/attractions/:attractionId/shift-templates', () => {
    it('should list shift templates', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/shift-templates`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      // API returns array directly
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(
        `/organizations/nightmare-manor/attractions/${TEST_ATTRACTIONS.mainHaunt}/shift-templates`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /organizations/:orgId/staff/:staffId/availability', () => {
    it('should allow managers to get staff availability', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      // First get the staff ID for the manager
      const statusResponse = await get<{ staff_id: string }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: manager.accessToken }
      );
      const staffId = statusResponse.body.staff_id;

      if (staffId) {
        const response = await get(
          `/organizations/${TEST_ORGS.nightmareManor}/staff/${staffId}/availability`,
          { token: manager.accessToken }
        );

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      // Get manager's staff ID using slug
      const statusResponse = await get<{ staff_id: string }>(
        '/organizations/nightmare-manor/time/my-status',
        { token: manager.accessToken }
      );
      const staffId = statusResponse.body.staff_id;

      if (staffId) {
        const response = await get(`/organizations/nightmare-manor/staff/${staffId}/availability`, {
          token: manager.accessToken,
        });

        expect(response.statusCode).toBe(200);
      }
    });

    it('should reject actors from viewing availability (role restriction)', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // First get the staff ID for the actor
      const statusResponse = await get<{ staff_id: string }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );
      const staffId = statusResponse.body.staff_id;

      if (staffId) {
        const response = await get(
          `/organizations/${TEST_ORGS.nightmareManor}/staff/${staffId}/availability`,
          { token: actor.accessToken }
        );

        expect(response.statusCode).toBe(403);
      }
    });
  });

  describe('GET /organizations/:orgId/swap-requests', () => {
    it('should allow managers to view swap requests', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/swap-requests`, {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
      // API returns array directly
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work with org slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/organizations/nightmare-manor/swap-requests', {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject actors from viewing all swap requests', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/swap-requests`, {
        token: actor.accessToken,
      });

      // Actors should get 403 since they can only view their own
      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /organizations/:orgId/schedule-roles', () => {
    it('should list schedule roles', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/schedule-roles`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      // API returns array directly
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /organizations/:orgId/my-schedules', () => {
    it('should allow staff to view their own schedules', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/my-schedules`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      // API returns array directly
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get('/organizations/nightmare-manor/my-schedules', {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /organizations/:orgId/my-swap-requests', () => {
    it('should allow staff to view their own swap requests', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/my-swap-requests`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      // API returns array directly
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
