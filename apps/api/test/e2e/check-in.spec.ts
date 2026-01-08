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

// Test IDs from seed data
const TEST_STATIONS = {
  mainEntrance: 'e1000000-0000-0000-0000-000000000001',
  vipGate: 'e1000000-0000-0000-0000-000000000002',
  boxOffice: 'e1000000-0000-0000-0000-000000000003',
  mobileScanner: 'e1000000-0000-0000-0000-000000000004',
};

const TEST_TICKET_TYPES = {
  generalAdmission: '80000000-0000-0000-0000-000000000001',
  vipExperience: '80000000-0000-0000-0000-000000000002',
};

describe('Check-In (F9)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============== Check-In Stations ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/check-in/stations', () => {
    it('should list check-in stations as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('stations');
      expect(Array.isArray(response.body.stations)).toBe(true);
      expect(response.body.stations.length).toBeGreaterThan(0);
    });

    it('should list stations as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('stations');
    });

    it('should work with org slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/nightmare-manor/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('stations');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`
      );

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /organizations/:orgId/attractions/:attractionId/check-in/stations/:stationId', () => {
    it('should get a single station', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations/${TEST_STATIONS.mainEntrance}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_STATIONS.mainEntrance);
      expect(response.body).toHaveProperty('name', 'Main Entrance');
      expect(response.body).toHaveProperty('isActive', true);
      expect(response.body).toHaveProperty('todayCount');
    });

    it('should return 404 for non-existent station', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations/00000000-0000-0000-0000-000000000000`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /organizations/:orgId/attractions/:attractionId/check-in/stations', () => {
    it('should create a station as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        {
          name: 'Test Station',
          location: 'Test Location',
          deviceId: 'TEST-001',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Station');
      expect(response.body).toHaveProperty('isActive', true);
    });

    it('should create a station as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        {
          name: 'Manager Station',
          location: 'Side Gate',
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('name', 'Manager Station');
    });

    it('should reject actors from creating stations', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        {
          name: 'Actor Station',
          location: 'Unauthorized',
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /organizations/:orgId/attractions/:attractionId/check-in/stations/:stationId', () => {
    it('should update a station as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First create a station
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        { name: 'Update Test Station' },
        { token: owner.accessToken }
      );

      const stationId = createResponse.body.id;

      // Update it
      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations/${stationId}`,
        {
          name: 'Updated Station Name',
          isActive: false,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Station Name');
      expect(response.body).toHaveProperty('isActive', false);
    });

    it('should reject actors from updating stations', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations/${TEST_STATIONS.mainEntrance}`,
        { name: 'Hacked Name' },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /organizations/:orgId/attractions/:attractionId/check-in/stations/:stationId', () => {
    it('should delete a station as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create a station to delete
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations`,
        { name: 'Delete Test Station' },
        { token: owner.accessToken }
      );

      const stationId = createResponse.body.id;

      // Delete it
      const response = await del(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations/${stationId}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify it's gone
      const getResponse = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations/${stationId}`,
        { token: owner.accessToken }
      );

      expect(getResponse.statusCode).toBe(404);
    });

    it('should reject managers from deleting stations', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await del(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stations/${TEST_STATIONS.vipGate}`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Capacity ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/check-in/capacity', () => {
    it('should get current capacity', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/capacity`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('currentCount');
      expect(response.body).toHaveProperty('capacity');
      expect(response.body).toHaveProperty('percentage');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('estimatedWaitMinutes');
      expect(response.body).toHaveProperty('checkedInLastHour');
      expect(response.body).toHaveProperty('byTimeSlot');
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(
        `/organizations/nightmare-manor/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/capacity`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('currentCount');
    });
  });

  // ============== Stats ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/check-in/stats', () => {
    it('should get check-in stats for today', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('totalCheckedIn');
      expect(response.body).toHaveProperty('totalExpected');
      expect(response.body).toHaveProperty('checkInRate');
      expect(response.body).toHaveProperty('byHour');
      expect(response.body).toHaveProperty('byStation');
      expect(response.body).toHaveProperty('byMethod');
    });

    it('should get stats for a specific date', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats?date=2025-10-03`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('date', '2025-10-03');
    });

    it('should reject actors from viewing stats', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/stats`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Queue ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/check-in/queue', () => {
    it('should get check-in queue', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/queue`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('late');
      expect(Array.isArray(response.body.pending)).toBe(true);
      expect(Array.isArray(response.body.late)).toBe(true);
    });

    it('should filter queue by status', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/queue?status=pending`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('pending');
      expect(response.body.late).toHaveLength(0);
    });
  });

  // ============== Lookup ==============

  describe('POST /organizations/:orgId/attractions/:attractionId/check-in/lookup', () => {
    it('should lookup tickets by email', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/lookup`,
        {
          query: 'john@example.com',
          type: 'email',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    it('should lookup by order number', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/lookup`,
        {
          query: 'TER',
          type: 'order_number',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('orders');
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/nightmare-manor/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/lookup`,
        {
          query: 'test',
          type: 'name',
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
    });
  });

  // ============== Scan Check-In ==============

  describe('POST /organizations/:orgId/attractions/:attractionId/check-in/scan', () => {
    it('should check in a valid ticket by barcode', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First create an order and complete it to get a ticket
      const orderResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'checkin-test@example.com',
          items: [{ ticketTypeId: TEST_TICKET_TYPES.generalAdmission, quantity: 1 }],
        },
        { token: owner.accessToken }
      );

      const orderId = orderResponse.body.id;

      // Complete the order
      const completeResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      const barcode = completeResponse.body.tickets[0].barcode;

      // Now scan the ticket
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        {
          barcode,
          method: 'barcode_scan',
          stationId: TEST_STATIONS.mainEntrance,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('ticket');
      expect(response.body).toHaveProperty('checkInId');
      expect(response.body.ticket).toHaveProperty('ticketNumber');
    });

    it('should return error for non-existent barcode', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        {
          barcode: 'NONEXISTENT123',
          method: 'qr_scan',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'TICKET_NOT_FOUND');
    });

    it('should reject double check-in', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create and complete an order
      const orderResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'double-checkin@example.com',
          items: [{ ticketTypeId: TEST_TICKET_TYPES.generalAdmission, quantity: 1 }],
        },
        { token: owner.accessToken }
      );

      const orderId = orderResponse.body.id;

      const completeResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      const barcode = completeResponse.body.tickets[0].barcode;

      // First check-in
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        { barcode, method: 'barcode_scan' },
        { token: owner.accessToken }
      );

      // Second check-in should fail
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/scan`,
        { barcode, method: 'barcode_scan' },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'TICKET_ALREADY_USED');
    });
  });

  // ============== Walk-Up Sales ==============

  describe('POST /organizations/:orgId/attractions/:attractionId/check-in/walk-up', () => {
    it('should create walk-up sale and check in immediately', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/walk-up`,
        {
          ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
          quantity: 2,
          guestNames: ['Walk-up Guest 1', 'Walk-up Guest 2'],
          paymentMethod: 'cash',
          waiverSigned: true,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('tickets');
      expect(response.body.tickets).toHaveLength(2);
      expect(response.body.order).toHaveProperty('orderNumber');
    });

    it('should create walk-up sale as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/walk-up`,
        {
          ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
          quantity: 1,
          paymentMethod: 'card',
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject actors from creating walk-up sales', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/walk-up`,
        {
          ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
          quantity: 1,
          paymentMethod: 'cash',
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });

    it('should reject invalid ticket type', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/walk-up`,
        {
          ticketTypeId: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
          paymentMethod: 'cash',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  // ============== Waiver ==============

  describe('POST /organizations/:orgId/attractions/:attractionId/check-in/waiver', () => {
    it('should record a waiver signature', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create and complete an order to get a ticket
      const orderResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'waiver-test@example.com',
          items: [{ ticketTypeId: TEST_TICKET_TYPES.generalAdmission, quantity: 1 }],
        },
        { token: owner.accessToken }
      );

      const orderId = orderResponse.body.id;

      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      // Get the ticket ID
      const orderDetails = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}`,
        { token: owner.accessToken }
      );

      const ticketId = orderDetails.body.tickets[0].id;

      // Record waiver
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/waiver`,
        {
          ticketId,
          guestName: 'Waiver Test Guest',
          guestEmail: 'waiver-test@example.com',
          guestDob: '1990-01-15',
          waiverVersion: '2024-v1',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('waiverId');
    });

    it('should record minor waiver with guardian', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create order for minor waiver test
      const orderResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'minor-waiver@example.com',
          items: [{ ticketTypeId: TEST_TICKET_TYPES.generalAdmission, quantity: 1 }],
        },
        { token: owner.accessToken }
      );

      const orderId = orderResponse.body.id;

      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      const orderDetails = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}`,
        { token: owner.accessToken }
      );

      const ticketId = orderDetails.body.tickets[0].id;

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in/waiver`,
        {
          ticketId,
          guestName: 'Minor Guest',
          guestDob: '2012-06-15',
          isMinor: true,
          guardianName: 'Parent Guardian',
          guardianEmail: 'parent@example.com',
          guardianPhone: '555-0123',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============== List Check-Ins ==============

  describe('GET /organizations/:orgId/attractions/:attractionId/check-in', () => {
    it('should list check-ins as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('checkIns');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.checkIns)).toBe(true);
    });

    it('should paginate check-ins', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in?page=1&limit=5`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 5);
    });

    it('should filter by station', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in?stationId=${TEST_STATIONS.mainEntrance}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('checkIns');
    });

    it('should reject actors from listing check-ins', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/attractions/${TEST_ATTRACTIONS.mainHaunt}/check-in`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });
});
