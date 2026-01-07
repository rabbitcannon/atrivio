import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL'] || 'http://127.0.0.1:54321';
const supabaseServiceKey =
  process.env['SUPABASE_SERVICE_ROLE_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabaseAnonKey =
  process.env['SUPABASE_ANON_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Admin client for database operations
export const adminClient: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Regular client for user auth
export const anonClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface TestUser {
  id: string;
  email: string;
  accessToken: string;
}

/**
 * Get an access token for an existing seeded test user
 */
export async function loginTestUser(email: string, password: string): Promise<TestUser> {
  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(`Failed to login test user ${email}: ${error?.message}`);
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    accessToken: data.session.access_token,
  };
}

/**
 * Create a new test user with a unique email
 */
export async function createTestUser(
  email: string,
  password: string,
  metadata?: { first_name?: string; last_name?: string }
): Promise<TestUser> {
  // Use admin client to create user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata || { first_name: 'Test', last_name: 'User' },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create test user: ${authError?.message}`);
  }

  // Login to get token
  const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError || !loginData.session) {
    throw new Error(`Failed to login new test user: ${loginError?.message}`);
  }

  return {
    id: authData.user.id,
    email: authData.user.email!,
    accessToken: loginData.session.access_token,
  };
}

/**
 * Delete a test user and their data
 */
export async function deleteTestUser(userId: string): Promise<void> {
  // Delete from profiles first (auth.users will cascade)
  await adminClient.from('profiles').delete().eq('id', userId);

  // Delete from auth
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
  }
}

/**
 * Get seeded test users
 * All test users use password: password123
 */
export const TEST_USERS = {
  // Super admin (platform level)
  superAdmin: {
    email: 'admin@haunt.dev',
    password: 'password123',
  },
  // Org owner (Nightmare Manor)
  owner: {
    email: 'owner@haunt.dev',
    password: 'password123',
  },
  // Org admin/manager (manager role in Nightmare Manor)
  orgAdmin: {
    email: 'manager@haunt.dev',
    password: 'password123',
  },
  // Org manager (same as orgAdmin, alias for clarity)
  manager: {
    email: 'manager@haunt.dev',
    password: 'password123',
  },
  // Actor (limited permissions)
  actor: {
    email: 'actor1@haunt.dev',
    password: 'password123',
  },
};

/**
 * Get seeded organization IDs
 */
export const TEST_ORGS = {
  nightmareManor: 'b0000000-0000-0000-0000-000000000001',
};

/**
 * Get seeded attraction IDs and slugs
 */
export const TEST_ATTRACTIONS = {
  mainHaunt: 'c0000000-0000-0000-0000-000000000001',
  mainHauntSlug: 'haunted-mansion',
  terrorTrail: 'c0000000-0000-0000-0000-000000000002',
  terrorTrailSlug: 'terror-trail',
};
