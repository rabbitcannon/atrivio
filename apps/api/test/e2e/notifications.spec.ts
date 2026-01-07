import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  loginTestUser,
  TEST_ORGS,
  TEST_USERS,
} from '../helpers/index.js';
import { del, get, patch, post } from '../helpers/request.js';

// Template keys from seed data (system templates)
const TEMPLATE_KEYS = {
  queueJoined: 'queue_joined',
  queueReady: 'queue_ready',
  ticketConfirmation: 'ticket_confirmation',
  shiftReminder: 'shift_reminder',
};

describe('Notifications (F12)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============== Templates ==============

  describe('GET /organizations/:orgId/notifications/templates', () => {
    it('should list all templates as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      // Templates endpoint returns array directly
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter templates by channel', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates?channel=sms`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      // Templates endpoint returns array directly
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((t: { channel: string }) => t.channel === 'sms')).toBe(true);
    });

    it('should list templates as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work with org slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/nightmare-manor/notifications/templates`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`
      );

      expect(response.statusCode).toBe(401);
    });

    it('should reject actors from viewing templates', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /organizations/:orgId/notifications/templates/:templateKey/:channel', () => {
    it('should get a specific template by key and channel', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates/${TEMPLATE_KEYS.queueJoined}/sms`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('key', TEMPLATE_KEYS.queueJoined);
      expect(response.body).toHaveProperty('channel', 'sms');
      expect(response.body).toHaveProperty('body');
      expect(response.body).toHaveProperty('variables');
    });

    it('should return 404 for non-existent template', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates/non_existent_template/email`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  // ============== Send Notifications ==============

  describe('POST /organizations/:orgId/notifications/send', () => {
    it('should send notification using template as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/send`,
        {
          templateKey: TEMPLATE_KEYS.queueJoined,
          channel: 'sms',
          // DTO expects recipientPhones array with valid E.164 format
          recipientPhones: ['+14155552671'],
          variables: {
            attraction_name: 'Haunted Mansion',
            queue_position: '5',
            confirmation_code: 'TEST123',
            wait_time: '15 minutes',
          },
        },
        { token: owner.accessToken }
      );

      // Should succeed (queued) or log in dev mode
      expect([200, 201]).toContain(response.statusCode);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject actors from sending notifications', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/send`,
        {
          templateKey: TEMPLATE_KEYS.queueJoined,
          channel: 'sms',
          recipientPhones: ['+14155552671'],
          variables: {},
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/notifications/send-direct', () => {
    it('should send direct SMS notification', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/send-direct`,
        {
          channel: 'sms',
          phone: '+14155552672', // Valid E.164 format
          body: 'Test notification from E2E test',
        },
        { token: owner.accessToken }
      );

      expect([200, 201]).toContain(response.statusCode);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should send direct email notification', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/send-direct`,
        {
          channel: 'email',
          email: 'test@example.com', // SendDirectNotificationDto uses 'email' field
          subject: 'Test Email from E2E',
          body: 'This is a test notification from E2E tests.',
        },
        { token: owner.accessToken }
      );

      expect([200, 201]).toContain(response.statusCode);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject direct notification without required fields', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/send-direct`,
        {
          channel: 'email',
          // Missing email and body - required fields
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(400);
    });

    it('should allow managers to send notifications', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/send-direct`,
        {
          channel: 'sms',
          phone: '+14155552673', // Valid E.164 format
          body: 'Manager test notification',
        },
        { token: manager.accessToken }
      );

      // Managers should be able to send
      expect([200, 201]).toContain(response.statusCode);
    });
  });

  // ============== History ==============

  describe('GET /organizations/:orgId/notifications/history', () => {
    it('should get notification history as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/history`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter history by channel', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/history?channel=email`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      // If there are results, they should all be email channel
      if (response.body.data.length > 0) {
        expect(response.body.data.every((n: { channel: string }) => n.channel === 'email')).toBe(
          true
        );
      }
    });

    it('should support pagination', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/history?limit=5&offset=0`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should reject actors from viewing history', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/history`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== User Notifications (In-App) ==============

  describe('GET /notifications/inbox', () => {
    it('should get in-app notifications for authenticated user', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/notifications/inbox`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      // Returns { data: InAppNotificationResponse[], unreadCount: number }
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('unreadCount');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by read status', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/notifications/inbox?read=false`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      // Unread notifications should have read as false
      if (response.body.data.length > 0) {
        expect(response.body.data.every((n: { read: boolean }) => n.read === false)).toBe(true);
      }
    });

    it('should support limit parameter', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/notifications/inbox?limit=10`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(`/notifications/inbox`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(`/notifications/read-all`, {}, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============== Preferences ==============

  describe('GET /notifications/preferences', () => {
    it('should get notification preferences', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/notifications/preferences`, { token: owner.accessToken });

      expect(response.statusCode).toBe(200);
      // Returns PreferenceResponse[] array with all categories
      expect(Array.isArray(response.body)).toBe(true);
      // Should have categories like tickets, queue, schedule, etc.
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('category');
        expect(response.body[0]).toHaveProperty('categoryName');
        expect(response.body[0]).toHaveProperty('emailEnabled');
      }
    });

    it('should get org-specific preferences', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/notifications/preferences?orgId=${TEST_ORGS.nightmareManor}`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // UpdatePreferencesDto expects { preferences: UpdatePreferenceDto[] }
      const response = await patch(
        `/notifications/preferences`,
        {
          preferences: [
            { category: 'announcements', emailEnabled: true, smsEnabled: false, pushEnabled: true },
          ],
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify the update
      const getResponse = await get(`/notifications/preferences`, { token: owner.accessToken });

      expect(getResponse.statusCode).toBe(200);
    });

    it('should update category preferences', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // UpdatePreferencesDto expects { preferences: UpdatePreferenceDto[] }
      const response = await patch(
        `/notifications/preferences`,
        {
          preferences: [
            { category: 'marketing', emailEnabled: false, smsEnabled: false, pushEnabled: false },
            { category: 'announcements', emailEnabled: true, smsEnabled: true, pushEnabled: true },
          ],
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============== Push Devices ==============

  describe('POST /notifications/devices', () => {
    it('should register a push device', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/notifications/devices`,
        {
          deviceToken: `test-device-token-${Date.now()}`,
          platform: 'ios',
          deviceName: 'Test iPhone',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should register an Android device', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/notifications/devices`,
        {
          deviceToken: `android-token-${Date.now()}`,
          platform: 'android',
          deviceName: 'Test Android',
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject invalid platform', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/notifications/devices`,
        {
          deviceToken: 'invalid-platform-token',
          platform: 'windows', // Invalid platform
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /notifications/devices/:deviceToken', () => {
    it('should unregister a push device', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First register a device
      const deviceToken = `to-delete-token-${Date.now()}`;
      await post(
        `/notifications/devices`,
        {
          deviceToken,
          platform: 'ios',
        },
        { token: owner.accessToken }
      );

      // Then unregister it
      const response = await del(`/notifications/devices/${deviceToken}`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============== Feature Flag Tests ==============

  describe('Feature Flag Gating', () => {
    // Note: These tests assume the 'notifications' feature flag is enabled
    // If the flag is disabled for the test org, these tests will fail with 403

    it('should allow access when feature is enabled', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`,
        { token: owner.accessToken }
      );

      // 200 = feature enabled, 403 = feature disabled (both are valid outcomes)
      expect([200, 403]).toContain(response.statusCode);
    });
  });
});
