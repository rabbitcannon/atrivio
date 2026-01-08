import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  loginTestUser,
  TEST_ORGS,
  TEST_USERS,
} from '../helpers/index.js';
import { del, get, patch, post } from '../helpers/request.js';

// Test IDs from seed data (supabase/seed.sql)
const TEST_CATEGORIES = {
  costumes: '90000000-0000-0000-0000-000000000001',
  props: '90000000-0000-0000-0000-000000000002',
  characterCostumes: '90000000-0000-0000-0000-000000000010', // Sub-category of costumes
};

const TEST_ITEMS = {
  vampireLord: '91000000-0000-0000-0000-000000000001',
  phantomBride: '91000000-0000-0000-0000-000000000002',
  bloodySword: '91000000-0000-0000-0000-000000000008',
  fogMachine: '91000000-0000-0000-0000-000000000017',
  emergencyFlashlight: '91000000-0000-0000-0000-000000000023', // Safety item with qty 20, min 15 = 5 available
};

const TEST_CHECKOUTS = {
  activeVampireLord: '92000000-0000-0000-0000-000000000001',
  activeDemonMask: '92000000-0000-0000-0000-000000000002',
  returnedButler: '92000000-0000-0000-0000-000000000005',
};

// Staff profile IDs from seed (membership IDs)
const TEST_STAFF_PROFILES = {
  actor1: 'd0000000-0000-0000-0000-000000000003', // Jake Morrison
  actor2: 'd0000000-0000-0000-0000-000000000004', // Emily Rodriguez
};

describe('Inventory (F10)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ============== Summary ==============

  describe('GET /organizations/:orgId/inventory/summary', () => {
    it('should get inventory summary as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/summary`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('totalItems');
      expect(response.body).toHaveProperty('totalQuantity');
      expect(response.body).toHaveProperty('lowStockCount');
      expect(response.body).toHaveProperty('checkedOutCount');
    });

    it('should work with org slug', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/nightmare-manor/inventory/summary`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('totalItems');
    });

    it('should reject actors from viewing summary', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/summary`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(403);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/summary`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /organizations/:orgId/inventory/low-stock', () => {
    it('should get low stock items', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/low-stock`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  // ============== Inventory Types ==============

  describe('GET /organizations/:orgId/inventory/types', () => {
    it('should list inventory types', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/types`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('types');
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(response.body.types.length).toBeGreaterThan(0);
    });

    it('should allow actors to view types', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/types`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('types');
    });
  });

  describe('POST /organizations/:orgId/inventory/types', () => {
    it('should create custom type as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      const uniqueKey = `test_type_${Date.now()}`;

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/types`,
        {
          key: uniqueKey,
          name: 'Test Type',
          description: 'A test inventory type',
          category: 'other',
          icon: 'package',
          color: '#FF5733',
          isConsumable: false,
          requiresCheckout: true,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Type');
      expect(response.body).toHaveProperty('requires_checkout', true);
    });

    it('should reject actors from creating types', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/types`,
        {
          key: 'actor_type',
          name: 'Actor Type',
          category: 'other',
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Categories ==============

  describe('GET /organizations/:orgId/inventory/categories', () => {
    it('should list categories hierarchically', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('flat');
      expect(Array.isArray(response.body.categories)).toBe(true);
    });

    it('should allow actors to view categories', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /organizations/:orgId/inventory/categories/:categoryId', () => {
    it('should get category details', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories/${TEST_CATEGORIES.costumes}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_CATEGORIES.costumes);
      expect(response.body).toHaveProperty('name', 'Costumes');
    });

    it('should return 404 for non-existent category', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories/00000000-0000-0000-0000-000000000000`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /organizations/:orgId/inventory/categories', () => {
    it('should create category as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories`,
        {
          name: 'Test Category',
          description: 'A test category',
          icon: 'folder',
          color: '#3498DB',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Category');
    });

    it('should create sub-category with parent', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories`,
        {
          name: 'Sub Category',
          parentId: TEST_CATEGORIES.costumes,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('parent_id', TEST_CATEGORIES.costumes);
    });

    it('should reject actors from creating categories', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories`,
        { name: 'Actor Category' },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /organizations/:orgId/inventory/categories/:categoryId', () => {
    it('should update category as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create a category to update
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories`,
        { name: 'Update Test Category' },
        { token: owner.accessToken }
      );

      const categoryId = createResponse.body.id;

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories/${categoryId}`,
        {
          name: 'Updated Category Name',
          color: '#9B59B6',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Category Name');
    });

    it('should reject setting self as parent', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories/${TEST_CATEGORIES.costumes}`,
        { parentId: TEST_CATEGORIES.costumes },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 'INVALID_PARENT');
    });
  });

  describe('DELETE /organizations/:orgId/inventory/categories/:categoryId', () => {
    it('should delete empty category as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create a category to delete
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories`,
        { name: 'Delete Test Category' },
        { token: owner.accessToken }
      );

      const categoryId = createResponse.body.id;

      const response = await del(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories/${categoryId}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject deleting category with items', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Use characterCostumes which has actual items
      const response = await del(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories/${TEST_CATEGORIES.characterCostumes}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 'CATEGORY_HAS_ITEMS');
    });

    it('should reject managers from deleting categories', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await del(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/categories/${TEST_CATEGORIES.props}`,
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Items ==============

  describe('GET /organizations/:orgId/inventory/items', () => {
    it('should list items as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/items`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should filter items by category', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Use characterCostumes sub-category which has actual items
      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items?categoryId=${TEST_CATEGORIES.characterCostumes}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should search items by name', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items?search=gothic`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should allow actors to view items', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/items`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /organizations/:orgId/inventory/items/:itemId', () => {
    it('should get item details', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items/${TEST_ITEMS.vampireLord}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_ITEMS.vampireLord);
      expect(response.body).toHaveProperty('name', 'Victorian Vampire Lord');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent item', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items/00000000-0000-0000-0000-000000000000`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /organizations/:orgId/inventory/items', () => {
    it('should create item as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First get a type ID
      const typesResponse = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/types`,
        { token: owner.accessToken }
      );
      const typeId = typesResponse.body.types[0].id;

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items`,
        {
          name: 'Test Item',
          typeId,
          categoryId: TEST_CATEGORIES.props,
          quantity: 5,
          minQuantity: 2,
          location: 'Test Storage',
          condition: 'good',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Item');
      expect(response.body).toHaveProperty('quantity', 5);
    });

    it('should reject actors from creating items', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      // Get a type ID
      const typesResponse = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/types`,
        { token: actor.accessToken }
      );
      const typeId = typesResponse.body.types[0].id;

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items`,
        {
          name: 'Actor Item',
          typeId,
          quantity: 1,
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /organizations/:orgId/inventory/items/:itemId', () => {
    it('should update item as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items/${TEST_ITEMS.bloodySword}`,
        {
          name: 'Updated Chainsaw Prop',
          location: 'Updated Storage',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Chainsaw Prop');
    });

    it('should update as manager', async () => {
      const manager = await loginTestUser(TEST_USERS.manager.email, TEST_USERS.manager.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items/${TEST_ITEMS.phantomBride}`,
        { notes: 'Updated by manager' },
        { token: manager.accessToken }
      );

      expect(response.statusCode).toBe(200);
    });

    it('should reject actors from updating items', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items/${TEST_ITEMS.vampireLord}`,
        { name: 'Hacked Name' },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/inventory/items/:itemId/adjust', () => {
    it('should adjust quantity as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items/${TEST_ITEMS.vampireLord}/adjust`,
        {
          quantity: 5,
          type: 'purchase',
          reason: 'Test purchase',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('previousQuantity');
      expect(response.body).toHaveProperty('newQuantity');
      expect(response.body).toHaveProperty('transaction');
    });

    it('should reject negative resulting quantity', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/items/${TEST_ITEMS.vampireLord}/adjust`,
        {
          quantity: -1000,
          type: 'adjustment',
          reason: 'Test negative',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_QUANTITY');
    });
  });

  // ============== Transactions ==============

  describe('GET /organizations/:orgId/inventory/transactions', () => {
    it('should list transactions as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/transactions`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });

    it('should filter transactions by item', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/transactions?itemId=${TEST_ITEMS.vampireLord}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
    });

    it('should reject actors from viewing transactions', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/transactions`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  // ============== Checkouts ==============

  describe('GET /organizations/:orgId/inventory/checkouts', () => {
    it('should list checkouts as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts`, {
        token: owner.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('checkouts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.checkouts)).toBe(true);
    });

    it('should filter active checkouts', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts?activeOnly=true`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      // All returned checkouts should have no returned_at
      for (const checkout of response.body.checkouts) {
        expect(checkout.returned_at).toBeNull();
      }
    });

    it('should allow actors to view checkouts', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(`/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts`, {
        token: actor.accessToken,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /organizations/:orgId/inventory/checkouts/overdue', () => {
    it('should get overdue checkouts', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts/overdue`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('checkouts');
      expect(Array.isArray(response.body.checkouts)).toBe(true);
    });
  });

  describe('GET /organizations/:orgId/inventory/checkouts/:checkoutId', () => {
    it('should get checkout details', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts/${TEST_CHECKOUTS.activeVampireLord}`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', TEST_CHECKOUTS.activeVampireLord);
      expect(response.body).toHaveProperty('item');
      expect(response.body).toHaveProperty('staff');
    });
  });

  describe('POST /organizations/:orgId/inventory/checkouts', () => {
    it('should create checkout as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts`,
        {
          itemId: TEST_ITEMS.emergencyFlashlight, // Use item with available quantity
          staffId: TEST_STAFF_PROFILES.actor2,
          quantity: 1,
          conditionOut: 'good',
          notes: 'Test checkout',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('item');
      expect(response.body).toHaveProperty('staff');
    });

    it('should reject checkout with insufficient quantity', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts`,
        {
          itemId: TEST_ITEMS.vampireLord,
          staffId: TEST_STAFF_PROFILES.actor1,
          quantity: 1000,
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_QUANTITY');
    });

    it('should reject actors from creating checkouts', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts`,
        {
          itemId: TEST_ITEMS.vampireLord,
          staffId: TEST_STAFF_PROFILES.actor1,
          quantity: 1,
        },
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /organizations/:orgId/inventory/checkouts/:checkoutId/return', () => {
    it('should return checkout as owner', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // First create a checkout
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts`,
        {
          itemId: TEST_ITEMS.bloodySword,
          staffId: TEST_STAFF_PROFILES.actor1,
          quantity: 1,
          conditionOut: 'good',
        },
        { token: owner.accessToken }
      );

      const checkoutId = createResponse.body.id;

      // Return it
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts/${checkoutId}/return`,
        {
          conditionIn: 'good',
          notes: 'Returned in good condition',
        },
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('returned_at');
      expect(response.body.returned_at).not.toBeNull();
    });

    it('should reject double return', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Create and return a checkout
      const createResponse = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts`,
        {
          itemId: TEST_ITEMS.bloodySword,
          staffId: TEST_STAFF_PROFILES.actor2,
          quantity: 1,
        },
        { token: owner.accessToken }
      );

      const checkoutId = createResponse.body.id;

      // First return
      await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts/${checkoutId}/return`,
        {},
        { token: owner.accessToken }
      );

      // Second return should fail
      const response = await post(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/checkouts/${checkoutId}/return`,
        {},
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 'ALREADY_RETURNED');
    });
  });

  describe('GET /organizations/:orgId/inventory/staff/:staffId/checkouts', () => {
    it('should get staff checkouts', async () => {
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/staff/${TEST_STAFF_PROFILES.actor1}/checkouts`,
        { token: owner.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('checkouts');
      expect(Array.isArray(response.body.checkouts)).toBe(true);
    });

    it('should allow actors to view their own checkouts', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get(
        `/organizations/${TEST_ORGS.nightmareManor}/inventory/staff/${TEST_STAFF_PROFILES.actor1}/checkouts`,
        { token: actor.accessToken }
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
