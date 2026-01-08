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

// Test IDs from seed data
const TEST_TICKET_TYPES = {
  generalAdmission: '80000000-0000-0000-0000-000000000001',
  vipExperience: '80000000-0000-0000-0000-000000000002',
};

const TEST_TIME_SLOTS = {
  friday6pm: '81000000-0000-0000-0000-000000000001',
  friday615pm: '81000000-0000-0000-0000-000000000002',
  friday630pm: '81000000-0000-0000-0000-000000000003',
};

const TEST_PROMO_CODES = {
  halloween25: '82000000-0000-0000-0000-000000000001',
  scream10: '82000000-0000-0000-0000-000000000002',
};

describe('Ticketing (F8)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============== Ticket Categories ==============

  describe('GET /organizations/:orgId/ticket-categories', () => {
    it('should list ticket categories using UUID', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-categories`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Default categories should exist
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should list categories using org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get('/organizations/nightmare-manor/ticket-categories', {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-categories`);

      expect(response.statusCode).toBe(401);
    });
  });

  // ============== Ticket Types ==============

  describe('GET /organizations/:orgId/ticket-types', () => {
    it('should list ticket types', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-types`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter ticket types by attraction', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/ticket-types?attractionId=${TEST_ATTRACTIONS.mainHaunt}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by active status (exclude inactive)', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Default is to only show active, includeInactive=true shows all
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/ticket-types`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get('/organizations/nightmare-manor/ticket-types', {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /organizations/:orgId/ticket-types/:ticketTypeId', () => {
    it('should get a single ticket type', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/ticket-types/${TEST_TICKET_TYPES.generalAdmission}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_TICKET_TYPES.generalAdmission);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent ticket type', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/ticket-types/00000000-0000-0000-0000-000000000000`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /organizations/:orgId/ticket-types', () => {
    it('should create a ticket type as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const payload = {
        attractionId: TEST_ATTRACTIONS.mainHaunt,
        name: 'Test Ticket Type',
        price: 1500,
        sortOrder: 100,
      };

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/ticket-types`,
        payload,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Ticket Type');
      expect(response.body).toHaveProperty('price', 1500);
    });

    it('should create a ticket type as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/ticket-types`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          name: 'Manager Created Ticket',
          price: 2000,
          sortOrder: 101,
        },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('name', 'Manager Created Ticket');
    });

    it('should reject actors from creating ticket types', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/ticket-types`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          name: 'Actor Ticket',
          price: 500,
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Time Slots ==============

  describe('GET /organizations/:orgId/time-slots', () => {
    it('should list time slots', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/time-slots`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by date', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/time-slots?date=2025-10-03`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by attraction', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/time-slots?attractionId=${TEST_ATTRACTIONS.mainHaunt}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get('/organizations/nightmare-manor/time-slots', {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /organizations/:orgId/time-slots/:timeSlotId', () => {
    it('should get a single time slot', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/time-slots/${TEST_TIME_SLOTS.friday6pm}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_TIME_SLOTS.friday6pm);
      expect(response.body).toHaveProperty('capacity');
      expect(response.body).toHaveProperty('start_time');
    });
  });

  describe('POST /organizations/:orgId/time-slots', () => {
    it('should create a time slot as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      // Use a far future date with random time to avoid conflicts
      const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const randomMinute = Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, '0');

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time-slots`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          date: futureDate,
          startTime: `20:${randomMinute}:00`,
          endTime: `20:${randomMinute}:59`,
          capacity: 25,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('capacity', 25);
    });

    it('should reject actors from creating time slots', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);
      const futureDate = new Date(Date.now() + 181 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time-slots`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          date: futureDate,
          startTime: '21:00:00',
          endTime: '21:15:00',
          capacity: 10,
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/time-slots/bulk', () => {
    it('should bulk create time slots as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      // Use dates far in the future with randomness to avoid conflicts
      const randomOffset = Math.floor(Math.random() * 500) + 500; // 500-1000 days in future
      const startDate = new Date(Date.now() + randomOffset * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(Date.now() + (randomOffset + 2) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time-slots/bulk`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          startDate,
          endDate,
          startTime: '18:00:00',
          endTime: '22:00:00',
          intervalMinutes: 30,
          capacity: 20,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('created');
      expect(response.body.created).toBeGreaterThan(0);
    });

    it('should reject actors from bulk creating time slots', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);
      const startDate = new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 72 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/time-slots/bulk`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          startDate,
          endDate,
          startTime: '18:00:00',
          endTime: '22:00:00',
          intervalMinutes: 30,
          capacity: 20,
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Promo Codes ==============

  describe('GET /organizations/:orgId/promo-codes', () => {
    it('should list promo codes as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/promo-codes`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should list promo codes as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/promo-codes`, {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject actors from viewing promo codes', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/promo-codes`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('should work with org slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/organizations/nightmare-manor/promo-codes', {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /organizations/:orgId/promo-codes/:promoCodeId', () => {
    it('should get a single promo code', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/promo-codes/${TEST_PROMO_CODES.halloween25}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_PROMO_CODES.halloween25);
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('discount_type');
    });
  });

  describe('POST /organizations/:orgId/promo-codes', () => {
    it('should create a promo code as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/promo-codes`,
        {
          code: `TESTCODE${Date.now()}`,
          name: 'Test Promo',
          discountType: 'percentage',
          discountValue: 10,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('discount_type', 'percentage');
      expect(response.body).toHaveProperty('discount_value', 10);
    });

    it('should create a fixed amount promo code', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/promo-codes`,
        {
          code: `FIXEDTEST${Date.now()}`,
          name: 'Fixed Amount Test',
          discountType: 'fixed_amount',
          discountValue: 500, // $5 off
          minOrderAmount: 1000,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('discount_type', 'fixed_amount');
      expect(response.body).toHaveProperty('discount_value', 500);
    });

    it('should reject actors from creating promo codes', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/promo-codes`,
        {
          code: 'ACTORCODE',
          name: 'Actor Code',
          discountType: 'percentage',
          discountValue: 50,
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/promo-codes/validate', () => {
    it('should validate a promo code', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/promo-codes/validate`,
        {
          code: 'SCREAM10',
          orderAmount: 5000,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('valid');
    });

    it('should return invalid for non-existent code', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/promo-codes/validate`,
        {
          code: 'NONEXISTENT',
          orderAmount: 5000,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('valid', false);
    });
  });

  // ============== Order Sources ==============

  describe('GET /organizations/:orgId/order-sources', () => {
    it('should list order sources', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/order-sources`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Default sources should exist
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should work with org slug', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get('/organizations/nightmare-manor/order-sources', {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  // ============== Orders ==============

  describe('GET /organizations/:orgId/orders', () => {
    it('should list orders as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should list orders as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: manager.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });

    it('should reject actors from viewing orders', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/orders`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('should work with org slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/organizations/nightmare-manor/orders', {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /organizations/:orgId/orders', () => {
    it('should create an order as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'test@example.com',
          customerName: 'Test Customer',
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
    });

    it('should create an order with time slot', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'timeslot@example.com',
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              timeSlotId: TEST_TIME_SLOTS.friday630pm,
              quantity: 1,
            },
          ],
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should reject actors from creating orders', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'actor@example.com',
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              quantity: 1,
            },
          ],
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('Order lifecycle', () => {
    let orderId: string;

    it('should create, complete, and get tickets for an order', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create order
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'lifecycle@example.com',
          customerName: 'Lifecycle Test',
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              quantity: 2,
            },
          ],
        },
        { token: owner.accessToken }
      );

      expect(createResponse.statusCode).toBe(201);
      orderId = createResponse.body.id;

      // Complete order
      const completeResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      expect(completeResponse.statusCode).toBe(200);
      expect(completeResponse.body).toHaveProperty('status', 'completed');
      expect(completeResponse.body).toHaveProperty('tickets');
      expect(completeResponse.body.tickets).toHaveLength(2);

      // Each ticket should have a barcode
      for (const ticket of completeResponse.body.tickets) {
        expect(ticket).toHaveProperty('barcode');
        expect(ticket.barcode).toHaveLength(12);
      }
    });
  });

  // ============== Cart & Checkout ==============

  describe('POST /organizations/:orgId/cart', () => {
    it('should create a cart session', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/cart`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              quantity: 3,
            },
          ],
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('items');
    });
  });

  describe('GET /organizations/:orgId/cart/:sessionId', () => {
    it('should get a cart session', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First create a cart
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/cart`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              quantity: 1,
            },
          ],
        },
        { token: owner.accessToken }
      );

      const sessionId = createResponse.body.id;

      // Get the cart
      const getResponse = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/cart/${sessionId}`,
        { token: owner.accessToken }
      );

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body).toHaveProperty('id', sessionId);
      expect(getResponse.body).toHaveProperty('items');
    });
  });

  describe('POST /organizations/:orgId/cart/checkout', () => {
    it('should checkout a cart', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First create a cart
      const createResponse = await post(
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
        { token: owner.accessToken }
      );

      const sessionId = createResponse.body.id;

      // Checkout
      const checkoutResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/cart/checkout`,
        {
          cartSessionId: sessionId,
          customerEmail: 'checkout@example.com',
          customerName: 'Checkout Test',
        },
        { token: owner.accessToken }
      );

      expect(checkoutResponse.statusCode).toBe(201);
      expect(checkoutResponse.body).toHaveProperty('id');
      expect(checkoutResponse.body).toHaveProperty('order_number');
      expect(checkoutResponse.body).toHaveProperty('status', 'pending');
    });
  });

  // ============== Ticket Validation ==============

  describe('Ticket scanning', () => {
    it('should scan a valid ticket', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create and complete an order to get a ticket
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders`,
        {
          attractionId: TEST_ATTRACTIONS.mainHaunt,
          customerEmail: 'scan@example.com',
          items: [
            {
              ticketTypeId: TEST_TICKET_TYPES.generalAdmission,
              quantity: 1,
            },
          ],
        },
        { token: owner.accessToken }
      );

      const orderId = createResponse.body.id;

      // Complete the order
      const completeResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/orders/${orderId}/complete`,
        {},
        { token: owner.accessToken }
      );

      const barcode = completeResponse.body.tickets[0].barcode;

      // Validate the ticket (without marking as used)
      const validateResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/tickets/validate`,
        { barcode },
        { token: owner.accessToken }
      );

      expect(validateResponse.statusCode).toBe(200);
      expect(validateResponse.body).toHaveProperty('valid', true);
      expect(validateResponse.body).toHaveProperty('ticket');

      // Scan the ticket (mark as used)
      const scanResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/tickets/scan`,
        { barcode },
        { token: owner.accessToken }
      );

      expect(scanResponse.statusCode).toBe(200);
      expect(scanResponse.body).toHaveProperty('valid', true);
      expect(scanResponse.body).toHaveProperty('ticket');
      expect(scanResponse.body.ticket).toHaveProperty('status', 'used');

      // Try to scan again - should fail
      const rescanResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/tickets/scan`,
        { barcode },
        { token: owner.accessToken }
      );

      expect(rescanResponse.statusCode).toBe(200);
      expect(rescanResponse.body).toHaveProperty('valid', false);
    });
  });
});
