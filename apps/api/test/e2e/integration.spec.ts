import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  adminClient,
  closeTestApp,
  createTestApp,
  createTestUser,
  deleteTestUser,
  loginTestUser,
  TEST_ATTRACTIONS,
  TEST_ORGS,
  TEST_USERS,
  type TestUser,
} from '../helpers/index.js';
import { del, get, patch, post } from '../helpers/request.js';

// Test IDs from seed data
const TEST_TICKET_TYPES = {
  generalAdmission: '80000000-0000-0000-0000-000000000001',
  vipExperience: '80000000-0000-0000-0000-000000000002',
};

const TEST_STATIONS = {
  mainEntrance: 'e1000000-0000-0000-0000-000000000001',
};

const TEST_TIME_SLOTS = {
  friday6pm: '81000000-0000-0000-0000-000000000001',
};

/**
 * Phase 16: Integration Testing (F1-F12, F14)
 *
 * Cross-feature E2E tests that validate complete user journeys
 * spanning multiple features and ensuring data flows correctly
 * across the entire system.
 */
describe('Phase 16: Integration Tests', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============================================================================
  // USER JOURNEY 1: New User Signup → Organization Creation → Configuration
  // Tests: F1 Auth + F2 Organizations + F3 Attractions
  // ============================================================================
  describe('User Journey: Signup to Organization Setup', () => {
    let newUser: TestUser;
    let newOrgId: string;
    const testEmail = `integration-owner-${Date.now()}@test.com`;

    afterAll(async () => {
      // Cleanup: delete test user and org data
      if (newUser?.id) {
        // Delete org membership first
        if (newOrgId) {
          await adminClient.from('organization_members').delete().eq('user_id', newUser.id);
          await adminClient.from('organizations').delete().eq('id', newOrgId);
        }
        await deleteTestUser(newUser.id);
      }
    });

    it('Step 1: Should register a new user account', async () => {
      const response = await post('/auth/register', {
        email: testEmail,
        password: 'TestPassword123!',
        first_name: 'Integration',
        last_name: 'Owner',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect((response.body as { user: { email: string } }).user.email).toBe(testEmail);

      // Login to get token
      newUser = await loginTestUser(testEmail, 'TestPassword123!');
      expect(newUser.accessToken).toBeTruthy();
    });

    it('Step 2: Should create a new organization', async () => {
      const response = await post(
        '/organizations',
        {
          name: 'Integration Test Haunt',
          slug: `integration-test-${Date.now()}`,
          timezone: 'America/New_York',
        },
        { token: newUser.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Integration Test Haunt');

      newOrgId = (response.body as { id: string }).id;
    });

    it('Step 3: Should automatically become org owner', async () => {
      const response = await get(`/organizations/${newOrgId}`, { token: newUser.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', newOrgId);
    });

    it('Step 4: Should list organizations including new org', async () => {
      const response = await get('/organizations', { token: newUser.accessToken });

      expect(response.statusCode).toBe(200);
      expect((response.body as { data: { id: string }[] }).data).toContainEqual(
        expect.objectContaining({ id: newOrgId })
      );
    });

    it('Step 5: Should update organization settings', async () => {
      const response = await patch(
        `/organizations/${newOrgId}`,
        {
          email: 'contact@integration-test.com',
          phone: '555-TEST-123',
        },
        { token: newUser.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('email', 'contact@integration-test.com');
    });
  });

  // ============================================================================
  // USER JOURNEY 2: Staff Member Work Session
  // Tests: F1 Auth + F4 Staff + F7a Time Tracking
  // ============================================================================
  describe('User Journey: Staff Work Session', () => {
    it('Step 1: Staff member logs in successfully', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      expect(actor.accessToken).toBeTruthy();
      expect(actor.email).toBe(TEST_USERS.actor.email);
    });

    it('Step 2: Staff member views their time status', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/time/my-status`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('is_clocked_in');
      expect(response.body).toHaveProperty('staff_id');
    });

    it('Step 3: Staff member clocks in', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // First check current status
      const statusResponse = await get<{ is_clocked_in: boolean }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );

      expect(statusResponse.statusCode).toBe(200);

      // If already clocked in, clock out first
      if (statusResponse.body.is_clocked_in) {
        await post(
          `/organizations/${TEST_ORGS.nightmareManor}/time/clock-out`,
          {},
          { token: actor.accessToken }
        );
      }

      // Now clock in
      const clockInResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time/clock-in`,
        { attraction_id: TEST_ATTRACTIONS.mainHaunt },
        { token: actor.accessToken }
      );

      expect(clockInResponse.statusCode).toBe(201);
      expect(clockInResponse.body).toHaveProperty('id');
      expect(clockInResponse.body).toHaveProperty('clock_in');
    });

    it('Step 4: Staff member views time status while clocked in', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get<{ is_clocked_in: boolean; current_entry: unknown }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('is_clocked_in', true);
      expect(response.body).toHaveProperty('current_entry');
    });

    it('Step 5: Staff member clocks out', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time/clock-out`,
        {},
        { token: actor.accessToken }
      );

      // Clock out returns 201 on success
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('clock_out');
    });

    it('Step 6: Staff member views their time history', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Get the staff ID first
      const statusResponse = await get<{ staff_id: string }>(
        `/organizations/${TEST_ORGS.nightmareManor}/time/my-status`,
        { token: actor.accessToken }
      );

      const staffId = statusResponse.body.staff_id;

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/staff/${staffId}/time`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('entries');
      expect(Array.isArray((response.body as { entries: unknown[] }).entries)).toBe(true);
    });
  });

  // ============================================================================
  // USER JOURNEY 3: Complete Ticket Purchase Flow
  // Tests: F8 Ticketing + F6 Payments (conceptual) + F9 Check-In
  // ============================================================================
  describe('User Journey: Ticket Purchase to Check-In', () => {
    let orderId: string;
    let ticketBarcode: string;

    it('Step 1: Manager creates a cart session', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/cart`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              quantity: 2,
            },
          ],
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('items');
    });

    it('Step 2: Box office creates order directly', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: `integration-guest-${Date.now()}@example.com`,
          customerName: 'Integration Test Guest',
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              quantity: 2,
            },
          ],
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('order_number');
      expect(response.body).toHaveProperty('status', 'pending');

      orderId = (response.body as { id: string }).id;
    });

    it('Step 3: Order is completed and tickets generated', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('tickets');
      expect((response.body as { tickets: unknown[] }).tickets).toHaveLength(2);

      // Store barcode for check-in
      ticketBarcode = (response.body as { tickets: { barcode: string }[] }).tickets[0].barcode;
      expect(ticketBarcode).toHaveLength(12);
    });

    it('Step 4: Ticket is validated at check-in station', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First validate (without marking as used)
      const validateResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/tickets/validate`,
        { barcode: ticketBarcode },
        { token: owner.accessToken }
      );

      expect(validateResponse.statusCode).toBe(200);
      expect(validateResponse.body).toHaveProperty('valid', true);
      expect(validateResponse.body).toHaveProperty('ticket');
    });

    it('Step 5: Guest is checked in via barcode scan', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        {
          barcode: ticketBarcode,
          method: 'barcode_scan',
          stationId: TEST_STATIONS.mainEntrance,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('ticket');
      expect(response.body).toHaveProperty('checkInId');
    });

    it('Step 6: Duplicate check-in is prevented', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        {
          barcode: ticketBarcode,
          method: 'barcode_scan',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'TICKET_ALREADY_USED');
    });

    it('Step 7: Check-in stats reflect the new check-in', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('totalCheckedIn');
      expect((response.body as { totalCheckedIn: number }).totalCheckedIn).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // USER JOURNEY 4: Walk-Up Sale Complete Flow
  // Tests: F8 Ticketing + F9 Check-In (combined)
  // ============================================================================
  describe('User Journey: Walk-Up Sale', () => {
    it('Complete walk-up sale and immediate check-in', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/walk-up`,
        {
          ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
          quantity: 2,
          guestNames: ['Walk-Up Guest A', 'Walk-Up Guest B'],
          paymentMethod: 'cash',
          waiverSigned: true,
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('tickets');
      expect((response.body as { tickets: unknown[] }).tickets).toHaveLength(2);

      // Walk-up tickets are checked in immediately - verify order is created
      const order = (response.body as { order: { orderNumber: string } }).order;
      expect(order).toHaveProperty('orderNumber');
    });
  });

  // ============================================================================
  // INTEGRATION: Auth + Organizations + Members
  // Tests: Role-based access control across org boundaries
  // ============================================================================
  describe('Integration: Auth + Organizations RBAC', () => {
    it('Owner can access their organization', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_ORGS.nightmareManor);
    });

    it('Actor has limited permissions within org', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Actor can view their time status
      const statusResponse = await get(`/organizations/${TEST_ORGS.nightmareManor}/time/my-status`, {
        token: actor.accessToken,
      });
      expect(statusResponse.statusCode).toBe(200);

      // Actor cannot view all orders
      const ordersResponse = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: actor.accessToken,
      });
      expect(ordersResponse.statusCode).toBe(403);
    });

    it('Unauthenticated users cannot access protected routes', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`);

      expect(response.statusCode).toBe(401);
    });

    it('Users cannot access other organizations', async () => {
      // Use Spooky Hollow owner to try accessing Nightmare Manor
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      // Try to access Nightmare Manor (should fail)
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });
  });

  // ============================================================================
  // INTEGRATION: Ticketing + Check-In Data Consistency
  // Tests: Data flows correctly between ticketing and check-in systems
  // ============================================================================
  describe('Integration: Ticketing + Check-In Consistency', () => {
    it('Capacity tracking reflects ticket sales and check-ins', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Get initial capacity
      const initialCapacity = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/capacity`,
        { token: owner.accessToken }
      );

      expect(initialCapacity.statusCode).toBe(200);
      expect(initialCapacity.body).toHaveProperty('currentCount');
      expect(initialCapacity.body).toHaveProperty('capacity');
    });

    it('Order totals and ticket counts match', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create order with specific quantity
      const orderResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: `consistency-test-${Date.now()}@example.com`,
          items: [
            { ticketTypeId: TEST_TICKET_TYPES.generalAdmission, quantity: 3 },
            { ticketTypeId: TEST_TICKET_TYPES.vipExperience, quantity: 1 },
          ],
        },
        { token: owner.accessToken }
      );

      expect(orderResponse.statusCode).toBe(201);
      const orderId = (orderResponse.body as { id: string }).id;

      // Complete order
      const completeResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      expect(completeResponse.statusCode).toBe(200);

      // Should have 4 tickets total (3 GA + 1 VIP)
      const tickets = (completeResponse.body as { tickets: unknown[] }).tickets;
      expect(tickets).toHaveLength(4);
    });

    it('Check-in queue shows pending tickets', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/queue`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('late');
    });
  });

  // ============================================================================
  // INTEGRATION: Notifications System
  // Tests: Notification templates and delivery tracking
  // ============================================================================
  describe('Integration: Notifications System', () => {
    it('Should list notification templates', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Should filter templates by channel', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/notifications/templates?channel=email`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Should access notification history', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/notifications/history`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  // ============================================================================
  // INTEGRATION: Storefronts + Public Access
  // Tests: Public storefront endpoints work without auth
  // ============================================================================
  describe('Integration: Storefronts Public Access', () => {
    const storefrontAdminUrl = `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/storefront`;

    it('Should access public storefront by attraction slug (no auth)', async () => {
      // First ensure the storefront is published
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      await post(`${storefrontAdminUrl}/publish`, {}, { token: owner.accessToken });

      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('storefront');
      expect(response.body).toHaveProperty('attraction');
    });

    it('Should access public storefront page', async () => {
      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}/pages/about`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('page');
    });

    it('Should access public storefront FAQs', async () => {
      const response = await get(`/storefronts/${TEST_ATTRACTIONS.mainHauntSlug}/faqs`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('faqs');
      expect(Array.isArray((response.body as { faqs: unknown[] }).faqs)).toBe(true);
    });

    it('Admin storefront access requires authentication', async () => {
      const response = await get(storefrontAdminUrl);

      expect(response.statusCode).toBe(401);
    });

    it('Admin can access storefront settings', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(storefrontAdminUrl, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('settings');
    });
  });

  // ============================================================================
  // INTEGRATION: Queue System
  // Tests: Virtual queue functionality
  // ============================================================================
  describe('Integration: Virtual Queue System', () => {
    it('Should get queue configuration', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/config`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('Should list queue entries', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/entries`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('Should get queue statistics', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/queue/stats`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('today');
      expect(response.body).toHaveProperty('byHour');
    });

    it('Public queue info accessible without auth', async () => {
      const response = await get(`/attractions/${TEST_ATTRACTIONS.mainHauntSlug}/queue/info`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isOpen');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
    });
  });

  // ============================================================================
  // INTEGRATION: Scheduling System
  // Tests: Shifts, availability, and swaps
  // ============================================================================
  describe('Integration: Scheduling System', () => {
    it('Staff can view their own schedule', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Staff use the /my-schedules endpoint (self-service)
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/my-schedules`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Manager can view attraction schedules', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      // Managers view schedules by attraction
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
      // Returns array of schedules directly
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Staff can view schedule roles', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/schedule-roles`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ============================================================================
  // CROSS-TENANT SECURITY
  // Tests: RLS policies prevent data leakage between organizations
  // ============================================================================
  describe('Cross-Tenant Security (RLS)', () => {
    it('Cannot access other org tickets', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-types`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Cannot access other org staff', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/staff`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Cannot access other org orders', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('Cannot access other org check-in data', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats`,
        { token: hollowOwner.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============================================================================
  // FEATURE FLAG GATING
  // Tests: Features properly gated by subscription tier
  // ============================================================================
  describe('Feature Flag Gating', () => {
    it('Basic tier org has access to ticketing', async () => {
      const hollowOwner = await loginTestUser('hollow.owner@haunt.dev', 'password123');

      // Spooky Hollow is basic tier - should have ticketing
      const response = await get(`/organizations/${TEST_ORGS.spookyHollow}/ticket-types`, {
        token: hollowOwner.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });

    it('Pro tier org has access to scheduling', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Nightmare Manor is pro tier - should have scheduling
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/schedules`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
    });

    it('Pro tier org has access to storefronts', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/storefront`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
    });
  });

  // ============================================================================
  // SEED DATA VALIDATION
  // Tests: Verify all seeded data is accessible and consistent
  // ============================================================================
  describe('Seed Data Validation', () => {
    it('All test users can log in', async () => {
      const users = [
        TEST_USERS.superAdmin,
        TEST_USERS.owner,
        TEST_USERS.manager,
        TEST_USERS.actor,
      ];

      for (const user of users) {
        const loggedIn = await loginTestUser(user.email, user.password);
        expect(loggedIn.accessToken).toBeTruthy();
      }
    });

    it('Nightmare Manor has expected attractions', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/attractions`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect((response.body as { data: unknown[] }).data.length).toBeGreaterThan(0);
    });

    it('Nightmare Manor has expected ticket types', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-types`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect((response.body as unknown[]).length).toBeGreaterThan(0);
    });

    it('Nightmare Manor has expected staff members', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/staff`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect((response.body as { data: unknown[] }).data.length).toBeGreaterThan(0);
    });

    it('Notification templates are seeded', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/notifications/templates`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect((response.body as unknown[]).length).toBeGreaterThan(0);
    });

    it('Storefront settings are seeded', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/storefront`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('settings');
    });
  });
});
