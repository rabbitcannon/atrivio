import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  loginTestUser,
  createTestUser,
  deleteTestUser,
  adminClient,
  TEST_USERS,
  TEST_ORGS,
} from '../helpers/index.js';
import { get, post, patch, del } from '../helpers/request.js';

describe('Organizations & Membership (E2E)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /organizations', () => {
    it('should list organizations user is a member of', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get<{ data: Array<{ id: string; name: string }> }>(
        '/organizations',
        { token: user.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Owner should see Nightmare Manor
      const org = response.body.data.find((o) => o.id === TEST_ORGS.nightmareManor);
      expect(org).toBeDefined();
      expect(org?.name).toBe('Nightmare Manor');
    });

    it('should return empty array for user with no org memberships', async () => {
      // Create a fresh user with no memberships
      const testEmail = `no-org-${Date.now()}@example.com`;
      const newUser = await createTestUser(testEmail, 'TestPass123!');

      try {
        const response = await get<{ data: unknown[] }>('/organizations', {
          token: newUser.accessToken,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual([]);
      } finally {
        await deleteTestUser(newUser.id);
      }
    });
  });

  describe('GET /organizations/:orgId', () => {
    it('should get organization details for member', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get<{ id: string; name: string; slug: string }>(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        { token: user.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(TEST_ORGS.nightmareManor);
      expect(response.body.name).toBe('Nightmare Manor');
      expect(response.body.slug).toBe('nightmare-manor');
    });

    it('should deny access to non-member', async () => {
      // Create a fresh user with no memberships
      const testEmail = `non-member-${Date.now()}@example.com`;
      const newUser = await createTestUser(testEmail, 'TestPass123!');

      try {
        const response = await get(`/organizations/${TEST_ORGS.nightmareManor}`, {
          token: newUser.accessToken,
        });

        expect(response.statusCode).toBe(403);
      } finally {
        await deleteTestUser(newUser.id);
      }
    });

    it('should return 404 for non-existent org', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/organizations/00000000-0000-0000-0000-000000000000', {
        token: user.accessToken,
      });

      // Could be 404 or 403 depending on implementation
      expect([403, 404]).toContain(response.statusCode);
    });
  });

  describe('POST /organizations', () => {
    let createdOrgId: string | null = null;

    beforeAll(async () => {
      // Cleanup any orphaned test organizations from previous runs
      // Get test orgs (slugs starting with 'test-org-')
      const { data: testOrgs } = await adminClient
        .from('organizations')
        .select('id')
        .like('slug', 'test-org-%');

      if (testOrgs && testOrgs.length > 0) {
        const testOrgIds = testOrgs.map(o => o.id);

        // First, clear is_owner flag to bypass the trigger that prevents owner deletion
        await adminClient
          .from('org_memberships')
          .update({ is_owner: false })
          .in('org_id', testOrgIds);

        // Now delete the test organizations (CASCADE will handle memberships)
        await adminClient
          .from('organizations')
          .delete()
          .in('id', testOrgIds);
      }
    });

    afterAll(async () => {
      // Cleanup: delete test org if created
      if (createdOrgId) {
        // Clear is_owner flag first to bypass the trigger
        await adminClient
          .from('org_memberships')
          .update({ is_owner: false })
          .eq('org_id', createdOrgId);

        await adminClient.from('organizations').delete().eq('id', createdOrgId);
      }
    });

    it('should create a new organization', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);
      const uniqueSlug = `test-org-${Date.now()}`;

      const response = await post<{ id: string; name: string; slug: string }>(
        '/organizations',
        {
          name: 'Test Organization',
          slug: uniqueSlug,
        },
        { token: user.accessToken }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe('Test Organization');
      expect(response.body.slug).toBe(uniqueSlug);

      createdOrgId = response.body.id;

      // Verify user is owner of new org
      const memberships = await adminClient
        .from('org_memberships')
        .select('role')
        .eq('org_id', createdOrgId)
        .eq('user_id', user.id)
        .single();

      expect(memberships.data?.role).toBe('owner');
    });

    it('should reject duplicate slug', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post(
        '/organizations',
        {
          name: 'Duplicate Test',
          slug: 'nightmare-manor', // Already exists
        },
        { token: user.accessToken }
      );

      // Could be 400 or 409 depending on how the error is handled
      expect([400, 409]).toContain(response.statusCode);
    });
  });

  describe('PATCH /organizations/:orgId', () => {
    it('should allow owner to update organization', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await patch<{ name: string }>(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        { name: 'Nightmare Manor Updated' },
        { token: user.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('Nightmare Manor Updated');

      // Restore original name
      await patch(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        { name: 'Nightmare Manor' },
        { token: user.accessToken }
      );
    });

    it('should deny update from non-admin member', async () => {
      const user = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await patch(
        `/organizations/${TEST_ORGS.nightmareManor}`,
        { name: 'Hacked Name' },
        { token: user.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('RLS - Data Isolation', () => {
    it('should not leak data from other organizations', async () => {
      // Create two separate users with their own orgs
      const user1Email = `user1-${Date.now()}@example.com`;
      const user2Email = `user2-${Date.now()}@example.com`;

      const user1 = await createTestUser(user1Email, 'TestPass123!');
      const user2 = await createTestUser(user2Email, 'TestPass123!');

      let org1Id: string | null = null;
      let org2Id: string | null = null;

      try {
        // User1 creates an org
        const org1Response = await post<{ id: string }>(
          '/organizations',
          { name: 'User1 Org', slug: `user1-org-${Date.now()}` },
          { token: user1.accessToken }
        );
        org1Id = org1Response.body.id;

        // User2 creates an org
        const org2Response = await post<{ id: string }>(
          '/organizations',
          { name: 'User2 Org', slug: `user2-org-${Date.now()}` },
          { token: user2.accessToken }
        );
        org2Id = org2Response.body.id;

        // User1 should NOT see User2's org
        const user1Orgs = await get<{ data: Array<{ id: string }> }>('/organizations', {
          token: user1.accessToken,
        });
        const hasUser2Org = user1Orgs.body.data.some((o) => o.id === org2Id);
        expect(hasUser2Org).toBe(false);

        // User2 should NOT see User1's org
        const user2Orgs = await get<{ data: Array<{ id: string }> }>('/organizations', {
          token: user2.accessToken,
        });
        const hasUser1Org = user2Orgs.body.data.some((o) => o.id === org1Id);
        expect(hasUser1Org).toBe(false);

        // User1 should NOT be able to access User2's org directly
        const accessAttempt = await get(`/organizations/${org2Id}`, {
          token: user1.accessToken,
        });
        expect(accessAttempt.statusCode).toBe(403);
      } finally {
        // Cleanup
        if (org1Id) await adminClient.from('organizations').delete().eq('id', org1Id);
        if (org2Id) await adminClient.from('organizations').delete().eq('id', org2Id);
        await deleteTestUser(user1.id);
        await deleteTestUser(user2.id);
      }
    });
  });
});
