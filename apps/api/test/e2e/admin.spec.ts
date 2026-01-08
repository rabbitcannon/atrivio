import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  createTestUser,
  deleteTestUser,
  loginTestUser,
  TEST_USERS,
} from '../helpers/index.js';
import { get, patch } from '../helpers/request.js';

describe('Admin Access Control (E2E)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('Super Admin Access', () => {
    it('should allow super admin to access admin dashboard', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await get('/admin/dashboard', { token: admin.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('stats');
    });

    it('should allow super admin to list all users', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await get<{ data: unknown[]; meta: { total: number } }>('/admin/users', {
        token: admin.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it('should allow super admin to list all organizations', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await get<{ data: unknown[]; meta: { total: number } }>(
        '/admin/organizations',
        {
          token: admin.accessToken,
        }
      );

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it('should allow super admin to access system health', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await get('/admin/health', { token: admin.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
    });

    it('should allow super admin to view platform settings', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await get<{ settings: Record<string, unknown> }>('/admin/settings', {
        token: admin.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('settings');
      expect(typeof response.body.settings).toBe('object');
    });

    it('should allow super admin to view revenue', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await get('/admin/revenue', { token: admin.accessToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('periods');
    });
  });

  describe('Non-Admin Access Denied', () => {
    it('should deny regular user access to admin dashboard', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/admin/dashboard', { token: user.accessToken });

      expect(response.statusCode).toBe(403);
    });

    it('should deny regular user access to admin users list', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/admin/users', { token: user.accessToken });

      expect(response.statusCode).toBe(403);
    });

    it('should deny regular user access to admin organizations list', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get('/admin/organizations', { token: user.accessToken });

      expect(response.statusCode).toBe(403);
    });

    it('should deny org admin access to platform admin', async () => {
      // Org admins are NOT platform admins
      const orgAdmin = await loginTestUser(TEST_USERS.orgAdmin.email, TEST_USERS.orgAdmin.password);

      const response = await get('/admin/dashboard', { token: orgAdmin.accessToken });

      expect(response.statusCode).toBe(403);
    });

    it('should deny actor access to admin routes', async () => {
      const actor = await loginTestUser(TEST_USERS.actor.email, TEST_USERS.actor.password);

      const response = await get('/admin/dashboard', { token: actor.accessToken });

      expect(response.statusCode).toBe(403);
    });

    it('should deny newly created user access to admin', async () => {
      const testEmail = `new-user-${Date.now()}@example.com`;
      const newUser = await createTestUser(testEmail, 'TestPass123!');

      try {
        const response = await get('/admin/dashboard', { token: newUser.accessToken });

        expect(response.statusCode).toBe(403);
      } finally {
        await deleteTestUser(newUser.id);
      }
    });
  });

  describe('Unauthenticated Access Denied', () => {
    it('should deny unauthenticated access to admin dashboard', async () => {
      const response = await get('/admin/dashboard');

      expect(response.statusCode).toBe(401);
    });

    it('should deny access with invalid token to admin routes', async () => {
      const response = await get('/admin/dashboard', { token: 'invalid-token' });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Admin User Management', () => {
    it('should allow super admin to view user details', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );
      const owner = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await get<{ id: string; email: string }>(`/admin/users/${owner.id}`, {
        token: admin.accessToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(owner.id);
      expect(response.body.email).toBe(TEST_USERS.owner.email);
    });

    it('should prevent super admin from removing their own admin status', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await patch(
        `/admin/users/${admin.id}`,
        { is_super_admin: false },
        { token: admin.accessToken }
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe('Admin Organization Management', () => {
    it('should allow super admin to view any organization details', async () => {
      const admin = await loginTestUser(
        TEST_USERS.superAdmin.email,
        TEST_USERS.superAdmin.password
      );

      const response = await get<{ id: string; name: string }>(
        '/admin/organizations/b0000000-0000-0000-0000-000000000001',
        { token: admin.accessToken }
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('Nightmare Manor');
    });
  });
});
