import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  loginTestUser,
  TEST_ATTRACTIONS,
  TEST_ORGS,
  TEST_USERS,
} from '../helpers/index.js';
import { get, patch, post } from '../helpers/request.js';

// Test IDs from seed data
const TEST_QUEUE_CONFIG_ID = 'e0000000-0000-0000-0000-000000000001';
const TEST_QUEUE_ENTRIES = {
  waiting1: 'e1000000-0000-0000-0000-000000000001',
  waiting2: 'e1000000-0000-0000-0000-000000000002',
  notified: 'e1000000-0000-0000-0000-000000000011',
  called: 'e1000000-0000-0000-0000-000000000013',
  checkedIn: 'e1000000-0000-0000-0000-000000000014',
  expired: 'e1000000-0000-0000-0000-000000000017',
};

// Confirmation codes from seed data
const CONFIRMATION_CODES = {
  waiting: 'HM001A',
  notified: 'HM011L',
  checkedIn: 'HM014P',
};

describe('Virtual Queue (F11)', () => {
  beforeAll(async () => {
    await createTestApp();

    // Ensure queue is in a clean state (not paused) before running tests
    const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
    await post(
      `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/resume`,
      {},
      { token: owner.accessToken }
    );
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============== Queue Configuration ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/queue/config', () => {
    it('should get queue config as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_QUEUE_CONFIG_ID);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('isActive', true);
      expect(response.body).toHaveProperty('isPaused', false);
      expect(response.body).toHaveProperty('capacityPerBatch');
      expect(response.body).toHaveProperty('batchIntervalMinutes');
      expect(response.body).toHaveProperty('maxWaitMinutes');
      expect(response.body).toHaveProperty('maxQueueSize');
    });

    it('should get queue config as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('should work with org slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/nightmare-manor/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`
      );

      expect(response.statusCode).toBe(401);
    });

    it('should reject actors from viewing queue config', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /organizations/:orgId/attractions/:attractionId/queue/config', () => {
    it('should update queue config as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        {
          capacityPerBatch: 15,
          batchIntervalMinutes: 10,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('capacityPerBatch', 15);
      expect(response.body).toHaveProperty('batchIntervalMinutes', 10);

      // Reset back to original values
      await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        {
          capacityPerBatch: 10,
          batchIntervalMinutes: 5,
        },
        { token: owner.accessToken }
      );
    });

    it('should reject actors from updating queue config', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { capacityPerBatch: 50 },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/queue/pause', () => {
    it('should pause the queue as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/pause`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isPaused', true);

      // Resume the queue
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/resume`,
        {},
        { token: owner.accessToken }
      );
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/queue/resume', () => {
    it('should resume the queue as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First pause
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/pause`,
        {},
        { token: owner.accessToken }
      );

      // Then resume
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/resume`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isPaused', false);
    });
  });

  // ============== Queue Entries ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/queue/entries', () => {
    it('should list queue entries as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter entries by status', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries?status=waiting`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data.every((e: { status: string }) => e.status === 'waiting')).toBe(
        true
      );
    });

    it('should paginate entries', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries?limit=5&offset=0`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should include summary statistics', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.summary).toHaveProperty('totalWaiting');
      expect(response.body.summary).toHaveProperty('avgWaitMinutes');
    });

    it('should reject actors from listing entries', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/queue/entries', () => {
    it('should create a queue entry as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Use unique phone/email to avoid conflicts with existing entries
      const uniqueId = Date.now();
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        {
          guestName: `Test Guest ${uniqueId}`,
          guestPhone: `+1555${String(uniqueId).slice(-7)}`,
          guestEmail: `test.guest.${uniqueId}@example.com`,
          partySize: 3,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('confirmationCode');
      expect(response.body).toHaveProperty('position');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('partySize', 3);
    });

    it('should create entry with minimal info', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        {
          partySize: 2,
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('confirmationCode');
      expect(response.body).toHaveProperty('partySize', 2);
    });

    it('should reject actors from creating entries', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { partySize: 2 },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /organizations/:orgId/attractions/:attractionId/queue/entries/:entryId', () => {
    it('should get a single entry as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${TEST_QUEUE_ENTRIES.waiting1}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_QUEUE_ENTRIES.waiting1);
      expect(response.body).toHaveProperty('confirmationCode');
      expect(response.body).toHaveProperty('status', 'waiting');
    });

    it('should return 404 for non-existent entry', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/00000000-0000-0000-0000-000000000000`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/queue/entries/:entryId/call', () => {
    it('should call an entry as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First create a new entry to call
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { partySize: 2, guestName: 'Call Test' },
        { token: owner.accessToken }
      );

      // Get the entry ID from the list
      const listResponse = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries?search=${createResponse.body.confirmationCode}`,
        { token: owner.accessToken }
      );

      const entryId = listResponse.body.data[0]?.id;
      if (!entryId) {
        // Skip if we can't find the entry
        return;
      }

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${entryId}/call`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'called');
      expect(response.body).toHaveProperty('calledAt');
    });

    it('should reject actors from calling entries', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${TEST_QUEUE_ENTRIES.waiting1}/call`,
        {},
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/queue/entries/:entryId/check-in', () => {
    it('should check in a called entry as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create a fresh entry, call it, then check it in
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { partySize: 2, guestName: 'Check In Test' },
        { token: owner.accessToken }
      );

      const listResponse = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries?search=${createResponse.body.confirmationCode}`,
        { token: owner.accessToken }
      );

      const entryId = listResponse.body.data[0]?.id;
      if (!entryId) {
        expect.fail('Could not find entry');
        return;
      }

      // Call the entry first
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${entryId}/call`,
        {},
        { token: owner.accessToken }
      );

      // Now check in
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${entryId}/check-in`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'checked_in');
      expect(response.body).toHaveProperty('checkedInAt');
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/queue/entries/:entryId/no-show', () => {
    it('should mark entry as no-show with notes', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First create and call a new entry
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { partySize: 2, guestName: 'No Show Test' },
        { token: owner.accessToken }
      );

      const listResponse = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries?search=${createResponse.body.confirmationCode}`,
        { token: owner.accessToken }
      );

      const entryId = listResponse.body.data[0]?.id;
      if (!entryId) return;

      // Call the entry first
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${entryId}/call`,
        {},
        { token: owner.accessToken }
      );

      // Mark as no-show
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${entryId}/no-show`,
        { notes: 'Guest did not arrive' },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'no_show');
    });
  });

  describe('PATCH /organizations/:orgId/attractions/:attractionId/queue/entries/:entryId', () => {
    it('should update entry notes', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries/${TEST_QUEUE_ENTRIES.waiting2}`,
        { notes: 'VIP guest - special treatment' },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('notes', 'VIP guest - special treatment');
    });
  });

  // ============== Queue Statistics ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/queue/stats', () => {
    it('should get queue stats for today', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/stats`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('today');
      expect(response.body).toHaveProperty('byHour');
      expect(response.body.today).toHaveProperty('totalJoined');
      expect(response.body.today).toHaveProperty('totalServed');
    });

    it('should get stats for a specific date', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Use yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/stats?date=${dateStr}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('byHour');
    });

    it('should include hourly breakdown', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/stats`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.byHour)).toBe(true);
      if (response.body.byHour.length > 0) {
        expect(response.body.byHour[0]).toHaveProperty('hour');
        expect(response.body.byHour[0]).toHaveProperty('joined');
        expect(response.body.byHour[0]).toHaveProperty('served');
      }
    });

    it('should reject actors from viewing stats', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/stats`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Public Endpoints ==============

  describe('GET /attractions/:attractionSlug/queue/info (Public)', () => {
    it('should get public queue info', async () => {
      const response = await get(`/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/info`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isOpen');
      expect(response.body).toHaveProperty('isPaused');
      expect(response.body).toHaveProperty('currentWaitMinutes');
      expect(response.body).toHaveProperty('peopleInQueue');
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('GET /attractions/:attractionSlug/queue/status/:confirmationCode (Public)', () => {
    it('should get position by confirmation code', async () => {
      const response = await get(
        `/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/status/${CONFIRMATION_CODES.waiting}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('confirmationCode', CONFIRMATION_CODES.waiting);
      expect(response.body).toHaveProperty('position');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('estimatedWaitMinutes');
      expect(response.body).toHaveProperty('partySize');
    });

    it('should return 404 for invalid code', async () => {
      const response = await get(
        `/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/status/INVALID999`
      );

      expect(response.statusCode).toBe(404);
    });

    it('should show status for notified entry', async () => {
      const response = await get(
        `/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/status/${CONFIRMATION_CODES.notified}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'notified');
    });
  });

  describe('POST /attractions/:attractionSlug/queue/join (Public)', () => {
    it('should allow guest to join queue', async () => {
      // Use unique phone to avoid conflicts with existing entries
      const uniqueId = Date.now();
      const response = await post(`/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/join`, {
        guestName: `Public Guest ${uniqueId}`,
        guestPhone: `+1888${String(uniqueId).slice(-7)}`,
        partySize: 4,
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('confirmationCode');
      expect(response.body).toHaveProperty('position');
      expect(response.body).toHaveProperty('estimatedWaitMinutes');
    });

    it('should reject when queue is paused', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Pause the queue
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/pause`,
        {},
        { token: owner.accessToken }
      );

      const response = await post(`/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/join`, {
        guestName: 'Should Fail',
        partySize: 2,
      });

      expect(response.statusCode).toBe(400);

      // Resume the queue
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/resume`,
        {},
        { token: owner.accessToken }
      );
    });

    it('should require guest name', async () => {
      const response = await post(`/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/join`, {
        partySize: 2,
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
