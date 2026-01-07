import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeTestApp,
  createTestApp,
  deleteTestUser,
  loginTestUser,
  TEST_USERS,
} from '../helpers/index.js';
import { get, post } from '../helpers/request.js';

describe('Auth Flow (E2E)', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials and return tokens', async () => {
      const response = await post<{
        user: { id: string; email: string };
        session: { access_token: string; refresh_token: string };
      }>('/auth/login', {
        email: TEST_USERS.owner.email,
        password: TEST_USERS.owner.password,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('access_token');
      expect(response.body.session).toHaveProperty('refresh_token');
      expect(response.body.user.email).toBe(TEST_USERS.owner.email);
    });

    it('should reject invalid password', async () => {
      const response = await post('/auth/login', {
        email: TEST_USERS.owner.email,
        password: 'wrongpassword',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await post('/auth/login', {
        email: 'nonexistent@example.com',
        password: 'somepassword',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/register', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    let createdUserId: string | null = null;

    afterAll(async () => {
      // Cleanup: delete test user if created
      if (createdUserId) {
        await deleteTestUser(createdUserId);
      }
    });

    it('should register a new user', async () => {
      const response = await post('/auth/register', {
        email: testEmail,
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect((response.body as { user: { email: string; id: string } }).user.email).toBe(testEmail);

      createdUserId = (response.body as { user: { id: string } }).user.id;
    });

    it('should reject duplicate email registration', async () => {
      const response = await post('/auth/register', {
        email: TEST_USERS.owner.email, // Already exists
        password: 'TestPassword123!',
        first_name: 'Duplicate',
        last_name: 'User',
      });

      expect(response.statusCode).toBe(409); // Conflict
    });

    it('should reject invalid email format', async () => {
      const response = await post('/auth/register', {
        email: 'not-an-email',
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      // Try to access organizations (protected route)
      const response = await get('/organizations', { token: user.accessToken });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray((response.body as { data: unknown[] }).data)).toBe(true);
    });

    it('should reject request without token', async () => {
      const response = await get('/organizations');

      expect(response.statusCode).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await get('/organizations', {
        token: 'invalid-token-here',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await get('/organizations', {
        headers: { authorization: 'InvalidFormat token123' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const user = await loginTestUser(TEST_USERS.owner.email, TEST_USERS.owner.password);

      const response = await post('/auth/logout', {}, { token: user.accessToken });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to get a refresh token
      const loginResponse = await post<{
        user: { id: string; email: string };
        session: { access_token: string; refresh_token: string };
      }>('/auth/login', {
        email: TEST_USERS.owner.email,
        password: TEST_USERS.owner.password,
      });

      expect(loginResponse.statusCode).toBe(200);
      const refreshToken = loginResponse.body.session.refresh_token;

      // Now refresh
      const response = await post<{
        session: { access_token: string; refresh_token: string };
      }>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('access_token');
      expect(response.body.session).toHaveProperty('refresh_token');
    });

    it('should reject invalid refresh token', async () => {
      const response = await post('/auth/refresh', {
        refresh_token: 'invalid-refresh-token',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
