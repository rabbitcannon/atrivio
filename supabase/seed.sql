-- ============================================================================
-- HAUNT PLATFORM - COMPREHENSIVE DEMO SEED DATA
-- ============================================================================
-- This file contains demo seed data for all organizations and feature modules.
-- 
-- Organizations (4):
--   - Nightmare Manor (Pro tier)      - b0000000-0000-0000-0000-000000000001
--   - Spooky Hollow (Basic tier)      - b0000000-0000-0000-0000-000000000002  
--   - Terror Collective (Enterprise)  - b0000000-0000-0000-0000-000000000003
--   - Newhouse Haunts (Onboarding)    - b0000000-0000-0000-0000-000000000004
--
-- Users: 26 across all organizations
-- Password for ALL test users: "password123"
--
-- Feature Tiers:
--   Basic: time_tracking, ticketing, checkin, notifications
--   Pro: + scheduling, inventory, analytics_pro, storefronts
--   Enterprise: + virtual_queue, sms_notifications, custom_domains
--
-- ============================================================================


-- ============================================================================
-- 01-AUTH-USERS.SQL - Comprehensive User Accounts
-- ============================================================================
-- Password for ALL test users: "password123"
-- Uses pgcrypto's crypt() function to properly hash passwords

-- ============================================================================
-- PLATFORM ADMINS
-- ============================================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES
  -- Super Admin (platform level)
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Super", "last_name": "Admin"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Platform Support Admin
  (
    'a0000000-0000-0000-0000-000000000099',
    '00000000-0000-0000-0000-000000000000',
    'support@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Support", "last_name": "Admin"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NIGHTMARE MANOR USERS (Pro Tier - Org 2)
-- ============================================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES
  -- Owner
  (
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'owner@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Marcus", "last_name": "Holloway"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Manager
  (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'manager@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Sarah", "last_name": "Chen"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Actor 1
  (
    'a0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'actor1@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jake", "last_name": "Morrison"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Actor 2
  (
    'a0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'actor2@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Emily", "last_name": "Rodriguez"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Actor 3
  (
    'a0000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'actor3@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Mike", "last_name": "Thompson"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Box Office
  (
    'a0000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'boxoffice@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Lisa", "last_name": "Park"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- HR Manager
  (
    'a0000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'hr@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Rachel", "last_name": "Kim"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Finance
  (
    'a0000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'finance@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "David", "last_name": "Miller"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Scanner
  (
    'a0000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'scanner@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Tom", "last_name": "Garcia"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SPOOKY HOLLOW USERS (Basic Tier - Org 1)
-- ============================================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES
  -- Owner (runs everything)
  (
    'a1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'hollow.owner@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Ben", "last_name": "Crawford"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Part-time Actor 1
  (
    'a1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'hollow.actor1@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jenny", "last_name": "Adams"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Weekend Actor
  (
    'a1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'hollow.actor2@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Chris", "last_name": "Baker"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Box Office
  (
    'a1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'hollow.boxoffice@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Amy", "last_name": "Nelson"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TERROR COLLECTIVE USERS (Enterprise Tier - Org 3)
-- ============================================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES
  -- CEO/Owner
  (
    'a3000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'ceo@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Victoria", "last_name": "Sterling"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- COO
  (
    'a3000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'coo@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Marcus", "last_name": "Webb"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Venue 1 Manager
  (
    'a3000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'venue1.manager@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Derek", "last_name": "Stone"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Venue 2 Manager
  (
    'a3000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'venue2.manager@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Nina", "last_name": "Reyes"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Marketing Director
  (
    'a3000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'marketing@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Samantha", "last_name": "Fox"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- IT Admin
  (
    'a3000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'it@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Alex", "last_name": "Chen"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Venue 1 Actors
  (
    'a3000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'v1.actor1@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jordan", "last_name": "Blake"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  (
    'a3000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'v1.actor2@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Casey", "last_name": "Morgan"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  -- Venue 2 Actors
  (
    'a3000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000000',
    'v2.actor1@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Riley", "last_name": "Hayes"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  ),
  (
    'a3000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000000',
    'v2.actor2@terror.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Taylor", "last_name": "Scott"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NEW HAUNT USER (Onboarding - Org 4)
-- ============================================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES
  (
    'a4000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'newowner@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jamie", "last_name": "Newhouse"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- AUTH IDENTITIES (required for Supabase Auth)
-- ============================================================================

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
VALUES
  -- Platform admins
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '{"sub": "a0000000-0000-0000-0000-000000000001", "email": "admin@haunt.dev"}', 'email', 'admin@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000099', 'a0000000-0000-0000-0000-000000000099', '{"sub": "a0000000-0000-0000-0000-000000000099", "email": "support@haunt.dev"}', 'email', 'support@haunt.dev', NOW(), NOW()),

  -- Nightmare Manor
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '{"sub": "a0000000-0000-0000-0000-000000000002", "email": "owner@haunt.dev"}', 'email', 'owner@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '{"sub": "a0000000-0000-0000-0000-000000000003", "email": "manager@haunt.dev"}', 'email', 'manager@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', '{"sub": "a0000000-0000-0000-0000-000000000004", "email": "actor1@haunt.dev"}', 'email', 'actor1@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', '{"sub": "a0000000-0000-0000-0000-000000000005", "email": "actor2@haunt.dev"}', 'email', 'actor2@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', '{"sub": "a0000000-0000-0000-0000-000000000006", "email": "actor3@haunt.dev"}', 'email', 'actor3@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', '{"sub": "a0000000-0000-0000-0000-000000000007", "email": "boxoffice@haunt.dev"}', 'email', 'boxoffice@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', '{"sub": "a0000000-0000-0000-0000-000000000008", "email": "hr@haunt.dev"}', 'email', 'hr@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000009', '{"sub": "a0000000-0000-0000-0000-000000000009", "email": "finance@haunt.dev"}', 'email', 'finance@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', '{"sub": "a0000000-0000-0000-0000-000000000010", "email": "scanner@haunt.dev"}', 'email', 'scanner@haunt.dev', NOW(), NOW()),

  -- Spooky Hollow
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '{"sub": "a1000000-0000-0000-0000-000000000001", "email": "hollow.owner@haunt.dev"}', 'email', 'hollow.owner@haunt.dev', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', '{"sub": "a1000000-0000-0000-0000-000000000002", "email": "hollow.actor1@haunt.dev"}', 'email', 'hollow.actor1@haunt.dev', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', '{"sub": "a1000000-0000-0000-0000-000000000003", "email": "hollow.actor2@haunt.dev"}', 'email', 'hollow.actor2@haunt.dev', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', '{"sub": "a1000000-0000-0000-0000-000000000004", "email": "hollow.boxoffice@haunt.dev"}', 'email', 'hollow.boxoffice@haunt.dev', NOW(), NOW()),

  -- Terror Collective
  ('a3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', '{"sub": "a3000000-0000-0000-0000-000000000001", "email": "ceo@terror.dev"}', 'email', 'ceo@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000002', '{"sub": "a3000000-0000-0000-0000-000000000002", "email": "coo@terror.dev"}', 'email', 'coo@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000003', '{"sub": "a3000000-0000-0000-0000-000000000003", "email": "venue1.manager@terror.dev"}', 'email', 'venue1.manager@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000004', 'a3000000-0000-0000-0000-000000000004', '{"sub": "a3000000-0000-0000-0000-000000000004", "email": "venue2.manager@terror.dev"}', 'email', 'venue2.manager@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000005', 'a3000000-0000-0000-0000-000000000005', '{"sub": "a3000000-0000-0000-0000-000000000005", "email": "marketing@terror.dev"}', 'email', 'marketing@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000006', 'a3000000-0000-0000-0000-000000000006', '{"sub": "a3000000-0000-0000-0000-000000000006", "email": "it@terror.dev"}', 'email', 'it@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000010', 'a3000000-0000-0000-0000-000000000010', '{"sub": "a3000000-0000-0000-0000-000000000010", "email": "v1.actor1@terror.dev"}', 'email', 'v1.actor1@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000011', 'a3000000-0000-0000-0000-000000000011', '{"sub": "a3000000-0000-0000-0000-000000000011", "email": "v1.actor2@terror.dev"}', 'email', 'v1.actor2@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000020', 'a3000000-0000-0000-0000-000000000020', '{"sub": "a3000000-0000-0000-0000-000000000020", "email": "v2.actor1@terror.dev"}', 'email', 'v2.actor1@terror.dev', NOW(), NOW()),
  ('a3000000-0000-0000-0000-000000000021', 'a3000000-0000-0000-0000-000000000021', '{"sub": "a3000000-0000-0000-0000-000000000021", "email": "v2.actor2@terror.dev"}', 'email', 'v2.actor2@terror.dev', NOW(), NOW()),

  -- New Haunt
  ('a4000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000001', '{"sub": "a4000000-0000-0000-0000-000000000001", "email": "newowner@haunt.dev"}', 'email', 'newowner@haunt.dev', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PROFILES (public.profiles)
-- ============================================================================

INSERT INTO public.profiles (id, email, first_name, last_name, display_name, phone, is_super_admin)
VALUES
  -- Platform admins
  ('a0000000-0000-0000-0000-000000000001', 'admin@haunt.dev', 'Super', 'Admin', 'Super Admin', NULL, TRUE),
  ('a0000000-0000-0000-0000-000000000099', 'support@haunt.dev', 'Support', 'Admin', 'Support Admin', NULL, TRUE),

  -- Nightmare Manor
  ('a0000000-0000-0000-0000-000000000002', 'owner@haunt.dev', 'Marcus', 'Holloway', 'Marcus Holloway', '555-0100', FALSE),
  ('a0000000-0000-0000-0000-000000000003', 'manager@haunt.dev', 'Sarah', 'Chen', 'Sarah Chen', '555-0101', FALSE),
  ('a0000000-0000-0000-0000-000000000004', 'actor1@haunt.dev', 'Jake', 'Morrison', 'Jake Morrison', '555-0102', FALSE),
  ('a0000000-0000-0000-0000-000000000005', 'actor2@haunt.dev', 'Emily', 'Rodriguez', 'Emily Rodriguez', '555-0103', FALSE),
  ('a0000000-0000-0000-0000-000000000006', 'actor3@haunt.dev', 'Mike', 'Thompson', 'Mike Thompson', '555-0104', FALSE),
  ('a0000000-0000-0000-0000-000000000007', 'boxoffice@haunt.dev', 'Lisa', 'Park', 'Lisa Park', '555-0105', FALSE),
  ('a0000000-0000-0000-0000-000000000008', 'hr@haunt.dev', 'Rachel', 'Kim', 'Rachel Kim', '555-0106', FALSE),
  ('a0000000-0000-0000-0000-000000000009', 'finance@haunt.dev', 'David', 'Miller', 'David Miller', '555-0107', FALSE),
  ('a0000000-0000-0000-0000-000000000010', 'scanner@haunt.dev', 'Tom', 'Garcia', 'Tom Garcia', '555-0108', FALSE),

  -- Spooky Hollow
  ('a1000000-0000-0000-0000-000000000001', 'hollow.owner@haunt.dev', 'Ben', 'Crawford', 'Ben Crawford', '555-1001', FALSE),
  ('a1000000-0000-0000-0000-000000000002', 'hollow.actor1@haunt.dev', 'Jenny', 'Adams', 'Jenny Adams', '555-1002', FALSE),
  ('a1000000-0000-0000-0000-000000000003', 'hollow.actor2@haunt.dev', 'Chris', 'Baker', 'Chris Baker', '555-1003', FALSE),
  ('a1000000-0000-0000-0000-000000000004', 'hollow.boxoffice@haunt.dev', 'Amy', 'Nelson', 'Amy Nelson', '555-1004', FALSE),

  -- Terror Collective
  ('a3000000-0000-0000-0000-000000000001', 'ceo@terror.dev', 'Victoria', 'Sterling', 'Victoria Sterling', '555-3001', FALSE),
  ('a3000000-0000-0000-0000-000000000002', 'coo@terror.dev', 'Marcus', 'Webb', 'Marcus Webb', '555-3002', FALSE),
  ('a3000000-0000-0000-0000-000000000003', 'venue1.manager@terror.dev', 'Derek', 'Stone', 'Derek Stone', '555-3003', FALSE),
  ('a3000000-0000-0000-0000-000000000004', 'venue2.manager@terror.dev', 'Nina', 'Reyes', 'Nina Reyes', '555-3004', FALSE),
  ('a3000000-0000-0000-0000-000000000005', 'marketing@terror.dev', 'Samantha', 'Fox', 'Samantha Fox', '555-3005', FALSE),
  ('a3000000-0000-0000-0000-000000000006', 'it@terror.dev', 'Alex', 'Chen', 'Alex Chen', '555-3006', FALSE),
  ('a3000000-0000-0000-0000-000000000010', 'v1.actor1@terror.dev', 'Jordan', 'Blake', 'Jordan Blake', '555-3010', FALSE),
  ('a3000000-0000-0000-0000-000000000011', 'v1.actor2@terror.dev', 'Casey', 'Morgan', 'Casey Morgan', '555-3011', FALSE),
  ('a3000000-0000-0000-0000-000000000020', 'v2.actor1@terror.dev', 'Riley', 'Hayes', 'Riley Hayes', '555-3020', FALSE),
  ('a3000000-0000-0000-0000-000000000021', 'v2.actor2@terror.dev', 'Taylor', 'Scott', 'Taylor Scott', '555-3021', FALSE),

  -- New Haunt
  ('a4000000-0000-0000-0000-000000000001', 'newowner@haunt.dev', 'Jamie', 'Newhouse', 'Jamie Newhouse', '555-4001', FALSE)
ON CONFLICT (id) DO UPDATE SET
  is_super_admin = EXCLUDED.is_super_admin,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name;

-- ============================================================================
-- SUMMARY: 26 user accounts
-- ============================================================================
-- Platform: 2 (admin, support)
-- Nightmare Manor (Pro): 9 (owner, manager, 3 actors, boxoffice, hr, finance, scanner)
-- Spooky Hollow (Basic): 4 (owner, 2 actors, boxoffice)
-- Terror Collective (Enterprise): 10 (ceo, coo, 2 venue managers, marketing, IT, 4 actors)
-- New Haunt (Onboarding): 1 (owner)


-- ============================================================================
-- 02-ORGANIZATIONS.SQL - Organizations & Memberships
-- ============================================================================
-- 4 Organizations at different subscription tiers:
-- - Nightmare Manor (Pro) - Full operations, multiple attractions
-- - Spooky Hollow (Basic) - Small operation, limited features
-- - Terror Collective (Enterprise) - Multi-venue chain
-- - New Haunt (Onboarding) - Fresh org, minimal data
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

INSERT INTO public.organizations (id, name, slug, email, phone, website, address_line1, city, state, postal_code, status)
VALUES
  -- Nightmare Manor (Pro Tier) - Primary demo organization
  (
    'b0000000-0000-0000-0000-000000000001',
    'Nightmare Manor',
    'nightmare-manor',
    'info@nightmaremanor.com',
    '555-SCARE',
    'https://nightmaremanor.com',
    '1313 Mockingbird Lane',
    'Salem',
    'MA',
    '01970',
    'active'
  ),
  -- Spooky Hollow (Basic Tier) - Small family-run haunt
  (
    'b0000000-0000-0000-0000-000000000002',
    'Spooky Hollow',
    'spooky-hollow',
    'info@spookyhollow.com',
    '555-SPOOK',
    'https://spookyhollow.com',
    '666 Pumpkin Lane',
    'Sleepy Hollow',
    'NY',
    '10591',
    'active'
  ),
  -- Terror Collective (Enterprise Tier) - Multi-venue chain
  (
    'b0000000-0000-0000-0000-000000000003',
    'Terror Collective',
    'terror-collective',
    'corporate@terrorcollective.com',
    '555-TERROR',
    'https://terrorcollective.com',
    '999 Corporate Plaza',
    'Los Angeles',
    'CA',
    '90028',
    'active'
  ),
  -- New Haunt (Onboarding) - Newly created, minimal data
  (
    'b0000000-0000-0000-0000-000000000004',
    'Newhouse Haunts',
    'newhouse-haunts',
    'jamie@newhousehaunts.com',
    '555-4001',
    NULL,
    '123 Startup Way',
    'Austin',
    'TX',
    '78701',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ORG MEMBERSHIPS - Nightmare Manor (Pro)
-- ============================================================================

INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES
  -- Owner (Marcus Holloway)
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'owner', TRUE, 'active', NOW()),
  -- Manager (Sarah Chen)
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'manager', FALSE, 'active', NOW()),
  -- Actor 1 (Jake Morrison)
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'actor', FALSE, 'active', NOW()),
  -- Actor 2 (Emily Rodriguez)
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'actor', FALSE, 'active', NOW()),
  -- Actor 3 (Mike Thompson)
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'actor', FALSE, 'active', NOW()),
  -- Box Office (Lisa Park)
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'box_office', FALSE, 'active', NOW()),
  -- HR (Rachel Kim)
  ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'hr', FALSE, 'active', NOW()),
  -- Finance (David Miller)
  ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', 'finance', FALSE, 'active', NOW()),
  -- Scanner (Tom Garcia)
  ('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'scanner', FALSE, 'active', NOW())
ON CONFLICT (org_id, user_id) DO NOTHING;

-- ============================================================================
-- ORG MEMBERSHIPS - Spooky Hollow (Basic)
-- ============================================================================

INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES
  -- Owner (Ben Crawford) - runs everything
  ('d1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'owner', TRUE, 'active', NOW()),
  -- Part-time Actor 1 (Jenny Adams)
  ('d1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'actor', FALSE, 'active', NOW()),
  -- Weekend Actor (Chris Baker)
  ('d1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'actor', FALSE, 'active', NOW()),
  -- Box Office (Amy Nelson)
  ('d1000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'box_office', FALSE, 'active', NOW())
ON CONFLICT (org_id, user_id) DO NOTHING;

-- ============================================================================
-- ORG MEMBERSHIPS - Terror Collective (Enterprise)
-- ============================================================================

INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES
  -- CEO/Owner (Victoria Sterling)
  ('d3000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000001', 'owner', TRUE, 'active', NOW()),
  -- COO (Marcus Webb) - Admin role
  ('d3000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000002', 'admin', FALSE, 'active', NOW()),
  -- Venue 1 Manager (Derek Stone)
  ('d3000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000003', 'manager', FALSE, 'active', NOW()),
  -- Venue 2 Manager (Nina Reyes)
  ('d3000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000004', 'manager', FALSE, 'active', NOW()),
  -- Marketing Director (Samantha Fox) - Admin for marketing access
  ('d3000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000005', 'admin', FALSE, 'active', NOW()),
  -- IT Admin (Alex Chen) - Admin role
  ('d3000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000006', 'admin', FALSE, 'active', NOW()),
  -- Venue 1 Actors
  ('d3000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000010', 'actor', FALSE, 'active', NOW()),
  ('d3000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000011', 'actor', FALSE, 'active', NOW()),
  -- Venue 2 Actors
  ('d3000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000020', 'actor', FALSE, 'active', NOW()),
  ('d3000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000021', 'actor', FALSE, 'active', NOW())
ON CONFLICT (org_id, user_id) DO NOTHING;

-- ============================================================================
-- ORG MEMBERSHIPS - New Haunt (Onboarding)
-- ============================================================================

INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES
  -- Owner (Jamie Newhouse) - just signed up
  ('d4000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'a4000000-0000-0000-0000-000000000001', 'owner', TRUE, 'active', NOW())
ON CONFLICT (org_id, user_id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Organizations: 4
--   - Nightmare Manor (Pro): 9 members
--   - Spooky Hollow (Basic): 4 members
--   - Terror Collective (Enterprise): 10 members
--   - Newhouse Haunts (Onboarding): 1 member
-- Total memberships: 24
-- ============================================================================


-- ============================================================================
-- 03-ATTRACTIONS.SQL - Attractions, Zones, and Seasons
-- ============================================================================
-- Attraction distribution by organization:
-- - Nightmare Manor (Pro): 3 attractions
-- - Spooky Hollow (Basic): 1 attraction
-- - Terror Collective (Enterprise): 6 attractions (2 venues x 3 each)
-- - New Haunt (Onboarding): 1 attraction (in setup)
-- ============================================================================

-- ============================================================================
-- NIGHTMARE MANOR ATTRACTIONS (Pro Tier)
-- ============================================================================

-- The Haunted Mansion (Primary attraction)
INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status, address_line1, city, state, postal_code)
SELECT
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'The Haunted Mansion',
  'haunted-mansion',
  'A terrifying journey through a Victorian mansion filled with restless spirits, sinister secrets, and spine-chilling surprises around every corner.',
  id, 150, 12, 4, 25, 'active',
  '1313 Mockingbird Lane', 'Salem', 'MA', '01970'
FROM public.attraction_types WHERE key = 'haunted_house'
ON CONFLICT (id) DO NOTHING;

-- Terror Trail (Outdoor trail)
INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status)
SELECT
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'Terror Trail',
  'terror-trail',
  'A half-mile outdoor trail through dark woods where creatures lurk behind every tree. Not for the faint of heart.',
  id, 75, 14, 5, 35, 'active'
FROM public.attraction_types WHERE key = 'haunted_trail'
ON CONFLICT (id) DO NOTHING;

-- Escape the Asylum (Escape room)
INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status)
SELECT
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  'Escape the Asylum',
  'escape-asylum',
  'Can you escape the abandoned asylum before the patients find you? A 60-minute immersive escape experience.',
  id, 10, 16, 3, 60, 'draft'
FROM public.attraction_types WHERE key = 'escape_room'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NIGHTMARE MANOR ZONES
-- ============================================================================

-- Zones for The Haunted Mansion
INSERT INTO public.zones (id, attraction_id, name, description, capacity, sort_order, color)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Entry Hall', 'Victorian foyer with moving portraits', 20, 1, '#6B21A8'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Grand Staircase', 'Creaking stairs with ghostly apparitions', 15, 2, '#7C3AED'),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Library', 'Books fly and shelves move on their own', 12, 3, '#8B5CF6'),
  ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Dining Room', 'Eternal dinner party of the damned', 18, 4, '#A78BFA'),
  ('e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Master Bedroom', 'Where the lady of the house still waits', 10, 5, '#C4B5FD'),
  ('e0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Attic', 'Forgotten memories and restless souls', 8, 6, '#DDD6FE'),
  ('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'Basement', 'The final descent into darkness', 15, 7, '#4C1D95')
ON CONFLICT (id) DO NOTHING;

-- Zones for Terror Trail
INSERT INTO public.zones (id, attraction_id, name, description, capacity, sort_order, color)
VALUES
  ('e0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'Trail Entrance', 'The point of no return', 10, 1, '#14532D'),
  ('e0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000002', 'Dead Woods', 'Where the trees have eyes', 8, 2, '#166534'),
  ('e0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', 'Clown Alley', 'Abandoned circus camp', 12, 3, '#15803D'),
  ('e0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 'The Swamp', 'Something lurks beneath', 6, 4, '#16A34A'),
  ('e0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'Final Stretch', 'Sprint to safety... if you can', 10, 5, '#22C55E')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NIGHTMARE MANOR SEASONS
-- ============================================================================

INSERT INTO public.seasons (id, attraction_id, name, year, start_date, end_date, status)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Halloween Season', 2024, '2024-09-27', '2024-11-02', 'completed'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Halloween Season', 2025, '2025-09-26', '2025-11-01', 'active'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Halloween Season', 2024, '2024-10-01', '2024-10-31', 'completed'),
  ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Halloween Season', 2025, '2025-10-01', '2025-10-31', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SPOOKY HOLLOW ATTRACTIONS (Basic Tier)
-- ============================================================================

-- The Hollow - Single haunted attraction
INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status, address_line1, city, state, postal_code)
SELECT
  'c1000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'The Hollow',
  'the-hollow',
  'A classic haunted hayride and walk-through experience. Family-friendly scares for all ages.',
  id, 50, 8, 2, 20, 'active',
  '666 Pumpkin Lane', 'Sleepy Hollow', 'NY', '10591'
FROM public.attraction_types WHERE key = 'haunted_house'
ON CONFLICT (id) DO NOTHING;

-- Zones for The Hollow
INSERT INTO public.zones (id, attraction_id, name, description, capacity, sort_order, color)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Pumpkin Patch', 'Where the scarecrows watch', 15, 1, '#F97316'),
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Cornfield', 'Lost in the stalks', 10, 2, '#FBBF24'),
  ('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Old Barn', 'What lurks in the shadows', 12, 3, '#EF4444')
ON CONFLICT (id) DO NOTHING;

-- Seasons for Spooky Hollow
INSERT INTO public.seasons (id, attraction_id, name, year, start_date, end_date, status)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Fall Season', 2024, '2024-10-01', '2024-10-31', 'completed'),
  ('f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Fall Season', 2025, '2025-10-01', '2025-10-31', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TERROR COLLECTIVE ATTRACTIONS (Enterprise Tier)
-- ============================================================================

-- Venue 1: Dread Factory (Industrial horror complex)
INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status, address_line1, city, state, postal_code)
SELECT
  'c3000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000003',
  'Dread Factory',
  'dread-factory',
  'An abandoned industrial complex where the machines have awakened. High-intensity scares and immersive theatrical experiences.',
  id, 200, 16, 5, 30, 'active',
  '500 Industrial Way', 'Los Angeles', 'CA', '90028'
FROM public.attraction_types WHERE key = 'haunted_house'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status)
SELECT
  'c3000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'The Dark Experiment',
  'dark-experiment',
  'You are the subject. A psychological thriller escape experience where nothing is as it seems.',
  id, 8, 18, 5, 60, 'active'
FROM public.attraction_types WHERE key = 'escape_room'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status)
SELECT
  'c3000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000003',
  'Void Maze',
  'void-maze',
  'Complete darkness. No light. No escape. Find your way through the void or be consumed by it.',
  id, 30, 14, 4, 15, 'active'
FROM public.attraction_types WHERE key = 'corn_maze'
ON CONFLICT (id) DO NOTHING;

-- Venue 2: Nightmare Kingdom (Fantasy horror theme park)
INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status, address_line1, city, state, postal_code)
SELECT
  'c3000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000003',
  'Nightmare Kingdom',
  'nightmare-kingdom',
  'A twisted fairy tale kingdom where every story ends in terror. Walk through lands of corrupted magic.',
  id, 250, 12, 4, 40, 'active',
  '1000 Kingdom Drive', 'Anaheim', 'CA', '92802'
FROM public.attraction_types WHERE key = 'haunted_house'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status)
SELECT
  'c3000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000003',
  'Cursed Forest',
  'cursed-forest',
  'The enchanted forest has been corrupted. Venture through if you dare.',
  id, 100, 10, 3, 25, 'active'
FROM public.attraction_types WHERE key = 'haunted_trail'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status)
SELECT
  'c3000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000003',
  'Dragon''s Lair Escape',
  'dragons-lair',
  'The dragon sleeps. Can your team steal the treasure and escape before it wakes?',
  id, 6, 12, 3, 45, 'active'
FROM public.attraction_types WHERE key = 'escape_room'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TERROR COLLECTIVE ZONES
-- ============================================================================

-- Zones for Dread Factory
INSERT INTO public.zones (id, attraction_id, name, description, capacity, sort_order, color)
VALUES
  ('e3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'Loading Dock', 'Where the screams begin', 25, 1, '#374151'),
  ('e3000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'Assembly Line', 'The machines never stop', 30, 2, '#4B5563'),
  ('e3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'Processing', 'You are next', 20, 3, '#6B7280'),
  ('e3000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000001', 'Incinerator', 'Feel the heat', 15, 4, '#EF4444')
ON CONFLICT (id) DO NOTHING;

-- Zones for Nightmare Kingdom
INSERT INTO public.zones (id, attraction_id, name, description, capacity, sort_order, color)
VALUES
  ('e3000000-0000-0000-0000-000000000010', 'c3000000-0000-0000-0000-000000000004', 'Castle Gates', 'Welcome to the kingdom', 40, 1, '#4F46E5'),
  ('e3000000-0000-0000-0000-000000000011', 'c3000000-0000-0000-0000-000000000004', 'Twisted Village', 'Where fairy tales go wrong', 35, 2, '#7C3AED'),
  ('e3000000-0000-0000-0000-000000000012', 'c3000000-0000-0000-0000-000000000004', 'Dark Tower', 'The princess is not what you expect', 25, 3, '#9333EA'),
  ('e3000000-0000-0000-0000-000000000013', 'c3000000-0000-0000-0000-000000000004', 'Dragon Keep', 'The beast awaits', 20, 4, '#DC2626')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TERROR COLLECTIVE SEASONS
-- ============================================================================

INSERT INTO public.seasons (id, attraction_id, name, year, start_date, end_date, status)
VALUES
  -- Dread Factory (year-round with seasons)
  ('f3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'Halloween 2024', 2024, '2024-09-15', '2024-11-02', 'completed'),
  ('f3000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'Halloween 2025', 2025, '2025-09-15', '2025-11-02', 'active'),
  -- Nightmare Kingdom
  ('f3000000-0000-0000-0000-000000000010', 'c3000000-0000-0000-0000-000000000004', 'Halloween 2024', 2024, '2024-09-20', '2024-11-03', 'completed'),
  ('f3000000-0000-0000-0000-000000000011', 'c3000000-0000-0000-0000-000000000004', 'Halloween 2025', 2025, '2025-09-20', '2025-11-03', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NEW HAUNT ATTRACTION (Onboarding)
-- ============================================================================

-- First attraction in setup/draft mode
INSERT INTO public.attractions (id, org_id, name, slug, description, type_id, capacity, min_age, intensity_level, duration_minutes, status, address_line1, city, state, postal_code)
SELECT
  'c4000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000004',
  'The First Fear',
  'first-fear',
  'Coming soon! Our debut haunted experience.',
  id, 40, 12, 3, 20, 'draft',
  '123 Startup Way', 'Austin', 'TX', '78701'
FROM public.attraction_types WHERE key = 'haunted_house'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Attractions: 11
--   - Nightmare Manor: 3 (Haunted Mansion, Terror Trail, Escape Asylum)
--   - Spooky Hollow: 1 (The Hollow)
--   - Terror Collective: 6 (Dread Factory venue: 3, Nightmare Kingdom venue: 3)
--   - Newhouse Haunts: 1 (First Fear - draft)
-- Total Zones: 18
-- Total Seasons: 10
-- ============================================================================


-- ============================================================================
-- 04-STAFF.SQL - Staff Profiles, Skills, Certifications, and Time Entries
-- ============================================================================
-- Staff profiles link to org_memberships via the membership ID
-- Only staff-role members (actors, box_office, scanner, etc.) need staff profiles
-- ============================================================================

-- ============================================================================
-- NIGHTMARE MANOR STAFF PROFILES (Pro Tier)
-- ============================================================================

INSERT INTO public.staff_profiles (id, org_id, employee_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, hire_date, hourly_rate, employment_type, status, shirt_size)
VALUES
  -- Manager (Sarah Chen) - d0000000-0000-0000-0000-000000000002
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'NM-MGR-001', 'David Chen', '555-0201', 'spouse', '2022-08-15', 2500, 'full_time', 'active', 'M'),
  -- Actor 1 (Jake Morrison) - d0000000-0000-0000-0000-000000000003
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'NM-ACT-001', 'Mary Morrison', '555-0202', 'mother', '2023-09-01', 1800, 'seasonal', 'active', 'L'),
  -- Actor 2 (Emily Rodriguez) - d0000000-0000-0000-0000-000000000004
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'NM-ACT-002', 'Carlos Rodriguez', '555-0203', 'father', '2023-09-01', 1800, 'seasonal', 'active', 'S'),
  -- Actor 3 (Mike Thompson) - d0000000-0000-0000-0000-000000000005
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'NM-ACT-003', 'Susan Thompson', '555-0204', 'mother', '2024-09-15', 1600, 'seasonal', 'active', 'XL'),
  -- Box Office (Lisa Park) - d0000000-0000-0000-0000-000000000006
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'NM-BOX-001', 'James Park', '555-0205', 'spouse', '2023-08-01', 1500, 'part_time', 'active', 'M'),
  -- HR (Rachel Kim) - d0000000-0000-0000-0000-000000000007
  ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'NM-HR-001', 'John Kim', '555-0206', 'brother', '2023-01-15', 2200, 'full_time', 'active', 'S'),
  -- Finance (David Miller) - d0000000-0000-0000-0000-000000000008
  ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'NM-FIN-001', 'Susan Miller', '555-0207', 'spouse', '2022-05-01', 2800, 'full_time', 'active', 'L'),
  -- Scanner (Tom Garcia) - d0000000-0000-0000-0000-000000000009
  ('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'NM-SCN-001', 'Maria Garcia', '555-0208', 'spouse', '2024-09-01', 1400, 'seasonal', 'active', 'M')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NIGHTMARE MANOR STAFF ATTRACTION ASSIGNMENTS
-- ============================================================================

INSERT INTO public.staff_attraction_assignments (id, staff_id, attraction_id, is_primary)
VALUES
  -- Manager assigned to both attractions
  ('cc000000-0000-0000-0001-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', TRUE),
  ('cc000000-0000-0000-0001-000000000002', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', FALSE),
  -- Actors assigned to attractions
  ('cc000000-0000-0000-0001-000000000003', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', TRUE),
  ('cc000000-0000-0000-0001-000000000004', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', TRUE),
  ('cc000000-0000-0000-0001-000000000005', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', TRUE),
  -- Box office at main attraction
  ('cc000000-0000-0000-0001-000000000006', 'd0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', TRUE),
  -- Scanner at main attraction
  ('cc000000-0000-0000-0001-000000000009', 'd0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NIGHTMARE MANOR STAFF SKILLS
-- ============================================================================

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level, notes)
SELECT
  'dd000000-0000-0000-0001-000000000001',
  'd0000000-0000-0000-0000-000000000003',
  id, 5, 'Lead scare actor with 5 years experience'
FROM public.skill_types WHERE key = 'acting' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level)
SELECT
  'dd000000-0000-0000-0001-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  id, 4
FROM public.skill_types WHERE key = 'sfx_makeup' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level)
SELECT
  'dd000000-0000-0000-0001-000000000003',
  'd0000000-0000-0000-0000-000000000004',
  id, 4
FROM public.skill_types WHERE key = 'acting' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level, notes)
SELECT
  'dd000000-0000-0000-0001-000000000004',
  'd0000000-0000-0000-0000-000000000004',
  id, 5, 'Certified makeup artist'
FROM public.skill_types WHERE key = 'makeup' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level)
SELECT
  'dd000000-0000-0000-0001-000000000005',
  'd0000000-0000-0000-0000-000000000005',
  id, 3
FROM public.skill_types WHERE key = 'acting' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level)
SELECT
  'dd000000-0000-0000-0001-000000000006',
  'd0000000-0000-0000-0000-000000000006',
  id, 5
FROM public.skill_types WHERE key = 'cash_handling' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level)
SELECT
  'dd000000-0000-0000-0001-000000000007',
  'd0000000-0000-0000-0000-000000000006',
  id, 4
FROM public.skill_types WHERE key = 'customer_service' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NIGHTMARE MANOR CERTIFICATIONS
-- ============================================================================

INSERT INTO public.staff_certifications (id, staff_id, cert_type_id, issued_at, expires_at, certificate_number)
SELECT
  'ee000000-0000-0000-0001-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  id, '2024-03-15', '2026-03-15', 'RC-2024-12345'
FROM public.certification_types WHERE key = 'first_aid' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_certifications (id, staff_id, cert_type_id, issued_at, expires_at, certificate_number)
SELECT
  'ee000000-0000-0000-0001-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  id, '2024-03-15', '2026-03-15', 'RC-2024-12346'
FROM public.certification_types WHERE key = 'cpr' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_certifications (id, staff_id, cert_type_id, issued_at, expires_at)
SELECT
  'ee000000-0000-0000-0001-000000000003',
  'd0000000-0000-0000-0000-000000000003',
  id, '2024-09-01', '2025-09-01'
FROM public.certification_types WHERE key = 'background_check' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NIGHTMARE MANOR TIME ENTRIES (Recent Activity)
-- ============================================================================

INSERT INTO public.staff_time_entries (id, staff_id, org_id, attraction_id, clock_in, clock_out, break_minutes, status)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days' + INTERVAL '18 hours', NOW() - INTERVAL '2 days' + INTERVAL '23 hours', 30, 'approved'),
  ('aa000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days' + INTERVAL '18 hours', NOW() - INTERVAL '2 days' + INTERVAL '23 hours', 30, 'approved'),
  ('aa000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day' + INTERVAL '18 hours', NOW() - INTERVAL '1 day' + INTERVAL '23 hours', 30, 'pending'),
  ('aa000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day' + INTERVAL '19 hours', NOW() - INTERVAL '1 day' + INTERVAL '24 hours', 15, 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SPOOKY HOLLOW STAFF PROFILES (Basic Tier)
-- ============================================================================

INSERT INTO public.staff_profiles (id, org_id, employee_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, hire_date, hourly_rate, employment_type, status, shirt_size)
VALUES
  -- Part-time Actor 1 (Jenny Adams) - d1000000-0000-0000-0000-000000000002
  ('d1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'SH-ACT-001', 'Robert Adams', '555-1201', 'father', '2024-09-01', 1200, 'seasonal', 'active', 'S'),
  -- Weekend Actor (Chris Baker) - d1000000-0000-0000-0000-000000000003
  ('d1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'SH-ACT-002', 'Linda Baker', '555-1202', 'mother', '2024-09-15', 1200, 'seasonal', 'active', 'M'),
  -- Box Office (Amy Nelson) - d1000000-0000-0000-0000-000000000004
  ('d1000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'SH-BOX-001', 'Tom Nelson', '555-1203', 'spouse', '2024-09-01', 1100, 'seasonal', 'active', 'M')
ON CONFLICT (id) DO NOTHING;

-- Spooky Hollow staff attraction assignments
INSERT INTO public.staff_attraction_assignments (id, staff_id, attraction_id, is_primary)
VALUES
  ('cc100000-0000-0000-0001-000000000001', 'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', TRUE),
  ('cc100000-0000-0000-0001-000000000002', 'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', TRUE),
  ('cc100000-0000-0000-0001-000000000003', 'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TERROR COLLECTIVE STAFF PROFILES (Enterprise Tier)
-- ============================================================================

INSERT INTO public.staff_profiles (id, org_id, employee_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, hire_date, hourly_rate, employment_type, status, shirt_size)
VALUES
  -- Venue 1 Manager (Derek Stone) - d3000000-0000-0000-0000-000000000003
  ('d3000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'TC-V1-MGR', 'Lisa Stone', '555-3201', 'spouse', '2020-03-01', 3500, 'full_time', 'active', 'L'),
  -- Venue 2 Manager (Nina Reyes) - d3000000-0000-0000-0000-000000000004
  ('d3000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'TC-V2-MGR', 'Carlos Reyes', '555-3202', 'brother', '2021-06-15', 3500, 'full_time', 'active', 'M'),
  -- Venue 1 Actor 1 (Jordan Blake) - d3000000-0000-0000-0000-000000000010
  ('d3000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'TC-V1-ACT01', 'Michael Blake', '555-3210', 'father', '2023-08-01', 2000, 'seasonal', 'active', 'M'),
  -- Venue 1 Actor 2 (Casey Morgan) - d3000000-0000-0000-0000-000000000011
  ('d3000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', 'TC-V1-ACT02', 'Sarah Morgan', '555-3211', 'mother', '2023-08-01', 2000, 'seasonal', 'active', 'S'),
  -- Venue 2 Actor 1 (Riley Hayes) - d3000000-0000-0000-0000-000000000020
  ('d3000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000003', 'TC-V2-ACT01', 'James Hayes', '555-3220', 'father', '2022-09-01', 2200, 'seasonal', 'active', 'L'),
  -- Venue 2 Actor 2 (Taylor Scott) - d3000000-0000-0000-0000-000000000021
  ('d3000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000003', 'TC-V2-ACT02', 'Emma Scott', '555-3221', 'sister', '2023-09-01', 2000, 'seasonal', 'active', 'M')
ON CONFLICT (id) DO NOTHING;

-- Terror Collective staff attraction assignments
INSERT INTO public.staff_attraction_assignments (id, staff_id, attraction_id, is_primary)
VALUES
  -- Venue 1 Manager manages all venue 1 attractions
  ('cc300000-0000-0000-0001-000000000001', 'd3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', TRUE),
  ('cc300000-0000-0000-0001-000000000002', 'd3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000002', FALSE),
  ('cc300000-0000-0000-0001-000000000003', 'd3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', FALSE),
  -- Venue 2 Manager manages all venue 2 attractions
  ('cc300000-0000-0000-0001-000000000010', 'd3000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004', TRUE),
  ('cc300000-0000-0000-0001-000000000011', 'd3000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000005', FALSE),
  ('cc300000-0000-0000-0001-000000000012', 'd3000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000006', FALSE),
  -- Venue 1 Actors
  ('cc300000-0000-0000-0001-000000000020', 'd3000000-0000-0000-0000-000000000010', 'c3000000-0000-0000-0000-000000000001', TRUE),
  ('cc300000-0000-0000-0001-000000000021', 'd3000000-0000-0000-0000-000000000011', 'c3000000-0000-0000-0000-000000000001', TRUE),
  -- Venue 2 Actors
  ('cc300000-0000-0000-0001-000000000030', 'd3000000-0000-0000-0000-000000000020', 'c3000000-0000-0000-0000-000000000004', TRUE),
  ('cc300000-0000-0000-0001-000000000031', 'd3000000-0000-0000-0000-000000000021', 'c3000000-0000-0000-0000-000000000004', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Terror Collective staff skills
INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level, notes)
SELECT
  'dd300000-0000-0000-0001-000000000001',
  'd3000000-0000-0000-0000-000000000010',
  id, 5, 'Professional stunt performer'
FROM public.skill_types WHERE key = 'acting' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_skills (id, staff_id, skill_type_id, level)
SELECT
  'dd300000-0000-0000-0001-000000000002',
  'd3000000-0000-0000-0000-000000000020',
  id, 4
FROM public.skill_types WHERE key = 'acting' AND org_id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Staff Profiles: 17
--   - Nightmare Manor: 8 (manager, 3 actors, box office, hr, finance, scanner)
--   - Spooky Hollow: 3 (2 actors, box office)
--   - Terror Collective: 6 (2 managers, 4 actors)
--   - Newhouse Haunts: 0 (owner only, no staff yet)
-- Attraction Assignments: 20
-- Staff Skills: 9
-- Certifications: 3
-- Time Entries: 4
-- ============================================================================


-- ============================================================================
-- 05-FEATURE-FLAGS.SQL - Tier-Based Feature Flag Configuration
-- ============================================================================
-- Feature flags control access to platform features by subscription tier:
-- - Basic: Core features (ticketing, checkin, time_tracking, notifications)
-- - Pro: Advanced features (scheduling, inventory, analytics_pro)
-- - Enterprise: Premium features (virtual_queue, sms_notifications, custom_domains)
--
-- Organization Tiers:
-- - Spooky Hollow: Basic tier
-- - Nightmare Manor: Pro tier
-- - Terror Collective: Enterprise tier
-- - Newhouse Haunts: Onboarding (Basic tier trial)
-- ============================================================================

-- ============================================================================
-- CORE FEATURE FLAGS
-- ============================================================================

-- Module flags with tier-based access
INSERT INTO public.feature_flags (id, key, name, description, enabled, rollout_percentage, org_ids, user_ids, metadata)
VALUES
  -- ============================================================================
  -- BASIC TIER (All orgs get these)
  -- ============================================================================

  -- Time Tracking (F7a) - Basic tier
  ('1f000000-0000-0000-0000-00000000000e', 'time_tracking', 'Time Tracking Module',
   'Staff time clock with clock in/out, time entries, and approval workflows (F7a)',
   TRUE, 100, '{}', '{}',
   '{"tier": "basic", "feature": "F7a", "module": true}'),

  -- Ticketing (F8) - Basic tier
  ('1f000000-0000-0000-0000-000000000006', 'ticketing', 'Ticketing Module',
   'Core ticketing functionality including ticket types, orders, and promo codes (F8)',
   TRUE, 100, '{}', '{}',
   '{"tier": "basic", "feature": "F8", "module": true}'),

  -- Check-In (F9) - Basic tier
  ('1f000000-0000-0000-0000-000000000007', 'checkin', 'Check-In Module',
   'Guest check-in with barcode scanning, capacity tracking, and waivers (F9)',
   TRUE, 100, '{}', '{}',
   '{"tier": "basic", "feature": "F9", "module": true}'),

  -- Notifications (F12) - Basic tier (in-app only)
  -- NOTE: This may be created by F12 migration, use ON CONFLICT
  ('1f000000-0000-0000-0000-00000000000c', 'notifications', 'Notifications Module',
   'Multi-channel notification system with in-app, email, and SMS delivery (F12)',
   TRUE, 100, '{}', '{}',
   '{"tier": "basic", "feature": "F12", "module": true}'),

  -- ============================================================================
  -- PRO TIER (Pro and Enterprise orgs)
  -- ============================================================================

  -- Scheduling (F7b) - Pro tier
  -- Enabled for: Nightmare Manor, Terror Collective
  ('1f000000-0000-0000-0000-000000000008', 'scheduling', 'Scheduling Module',
   'Staff scheduling with availability, shift templates, and swap requests (F7)',
   TRUE, 100,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F7b", "module": true}'),

  -- Inventory (F10) - Pro tier
  -- Enabled for: Nightmare Manor, Terror Collective
  ('1f000000-0000-0000-0000-000000000009', 'inventory', 'Inventory Module',
   'Inventory tracking with categories, checkouts, and low stock alerts (F10)',
   TRUE, 100,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F10", "module": true}'),

  -- Analytics Pro (F13) - Pro tier
  -- Enabled for: Nightmare Manor, Terror Collective
  ('1f000000-0000-0000-0000-00000000000a', 'analytics_pro', 'Analytics Pro',
   'Advanced analytics with custom reports, exports, and forecasting (F13)',
   TRUE, 100,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F13", "module": true}'),

  -- Storefronts (F14) - Pro tier
  -- NOTE: This may be created by F14 migration, use ON CONFLICT
  ('1f000000-0000-0000-0000-00000000000f', 'storefronts', 'Storefronts Module',
   'Public-facing storefront for ticket sales with customizable themes (F14)',
   TRUE, 100,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F14", "module": true}'),

  -- ============================================================================
  -- ENTERPRISE TIER (Enterprise orgs only)
  -- ============================================================================

  -- Virtual Queue (F11) - Enterprise tier
  -- Enabled for: Terror Collective + Nightmare Manor (for testing)
  ('1f000000-0000-0000-0000-00000000000b', 'virtual_queue', 'Virtual Queue',
   'Real-time virtual queue with position tracking and notifications (F11)',
   TRUE, 100,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "enterprise", "feature": "F11", "module": true}'),

  -- SMS Notifications - Enterprise tier
  -- Enabled for: Terror Collective only (has SMS gateway configured)
  ('1f000000-0000-0000-0000-000000000010', 'sms_notifications', 'SMS Notifications',
   'SMS delivery for queue alerts, shift reminders, and guest communications (F11/F12)',
   TRUE, 100,
   ARRAY['b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "enterprise", "feature": "F11,F12", "has_usage_cost": true}'),

  -- Custom Domains - Enterprise tier
  -- Enabled for: Terror Collective only
  ('1f000000-0000-0000-0000-00000000000d', 'custom_domains', 'Custom Domains',
   'Custom domain support for public storefronts with SSL provisioning (F14)',
   TRUE, 100,
   ARRAY['b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "enterprise", "feature": "F14", "has_infra_cost": true}'),

  -- ============================================================================
  -- EXPERIMENTAL/BETA FLAGS
  -- ============================================================================

  -- Virtual Queue V2 (beta)
  ('1f000000-0000-0000-0000-000000000001', 'virtual_queue_v2', 'Virtual Queue V2',
   'New virtual queue system with SMS notifications and improved UX',
   FALSE, 25, '{}', '{}',
   '{"release_date": "2025-Q1", "ticket": "HAUNT-1234"}'),

  -- Streamlined Checkout (A/B test)
  ('1f000000-0000-0000-0000-000000000002', 'new_checkout_flow', 'Streamlined Checkout',
   'One-page checkout experience with Apple Pay support',
   TRUE, 0, '{}', '{}',
   '{"a_b_test": true}'),

  -- Staff Mobile App (beta for Nightmare Manor)
  ('1f000000-0000-0000-0000-000000000003', 'staff_mobile_app', 'Staff Mobile App',
   'Mobile app for staff to clock in/out and view schedules',
   FALSE, 0,
   ARRAY['b0000000-0000-0000-0000-000000000001']::UUID[],
   '{}',
   '{"beta_org": true}'),

  -- Advanced Analytics Dashboard
  ('1f000000-0000-0000-0000-000000000004', 'advanced_analytics', 'Advanced Analytics Dashboard',
   'Enhanced analytics with real-time metrics and forecasting',
   FALSE, 50, '{}', '{}',
   '{"premium_feature": true}'),

  -- AI Scheduling (experimental, single user)
  ('1f000000-0000-0000-0000-000000000005', 'ai_scheduling', 'AI-Powered Scheduling',
   'Machine learning powered staff scheduling optimization',
   FALSE, 0, '{}',
   ARRAY['a0000000-0000-0000-0000-000000000002']::UUID[],
   '{"experimental": true}')

ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  org_ids = EXCLUDED.org_ids,
  user_ids = EXCLUDED.user_ids,
  metadata = EXCLUDED.metadata;


-- ============================================================================
-- SUMMARY - Feature Access by Organization
-- ============================================================================
--
-- Spooky Hollow (Basic):
--   ✅ time_tracking, ticketing, checkin, notifications
--   ❌ scheduling, inventory, analytics_pro, storefronts
--   ❌ virtual_queue, sms_notifications, custom_domains
--
-- Nightmare Manor (Pro):
--   ✅ time_tracking, ticketing, checkin, notifications
--   ✅ scheduling, inventory, analytics_pro, storefronts
--   ✅ virtual_queue (testing only)
--   ❌ sms_notifications, custom_domains
--
-- Terror Collective (Enterprise):
--   ✅ time_tracking, ticketing, checkin, notifications
--   ✅ scheduling, inventory, analytics_pro, storefronts
--   ✅ virtual_queue, sms_notifications, custom_domains
--
-- Newhouse Haunts (Onboarding/Basic Trial):
--   ✅ time_tracking, ticketing, checkin, notifications
--   ❌ scheduling, inventory, analytics_pro, storefronts
--   ❌ virtual_queue, sms_notifications, custom_domains
--
-- ============================================================================


-- ============================================================================
-- F6: STRIPE CONNECT DATA
-- ============================================================================

-- Stripe accounts for organizations (using valid hex UUIDs: 6s = stripe accounts)
-- NOTE: No seeded Stripe account - organizations must complete Stripe onboarding
-- to connect a real Stripe account. Transactions come from real Stripe webhooks.

-- NOTE: No seeded payouts - payouts come from real Stripe webhooks

-- NOTE: No seeded transactions - transactions come from real Stripe webhooks
-- NOTE: No seeded webhooks - webhook records come from real Stripe events

-- ============================================================================
-- F7B: SCHEDULING SEED DATA
-- ============================================================================

-- Get role IDs and create scheduling seed data
DO $$
DECLARE
  v_org_id UUID := 'b0000000-0000-0000-0000-000000000001';
  v_attraction_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_actor_role_id UUID;
  v_scare_actor_role_id UUID;
  v_security_role_id UUID;
  v_makeup_role_id UUID;
  v_manager_role_id UUID;
BEGIN
  -- Get system role IDs
  SELECT id INTO v_actor_role_id FROM schedule_roles WHERE key = 'actor' AND org_id IS NULL;
  SELECT id INTO v_scare_actor_role_id FROM schedule_roles WHERE key = 'scare_actor' AND org_id IS NULL;
  SELECT id INTO v_security_role_id FROM schedule_roles WHERE key = 'security' AND org_id IS NULL;
  SELECT id INTO v_makeup_role_id FROM schedule_roles WHERE key = 'makeup_artist' AND org_id IS NULL;
  SELECT id INTO v_manager_role_id FROM schedule_roles WHERE key = 'manager' AND org_id IS NULL;

  -- Skip if scheduling tables don't exist (F7b migration not run yet)
  IF v_actor_role_id IS NULL THEN
    RAISE NOTICE 'Skipping F7b seed data - schedule_roles table not populated';
    RETURN;
  END IF;

  -- Create schedule periods for Halloween 2025
  INSERT INTO schedule_periods (id, org_id, attraction_id, name, start_date, end_date, status)
  VALUES
    ('70000000-0000-0000-0000-000000000001', v_org_id, v_attraction_id, 'Halloween 2025 - Week 1', '2025-09-26', '2025-10-02', 'draft'),
    ('70000000-0000-0000-0000-000000000002', v_org_id, v_attraction_id, 'Halloween 2025 - Week 2', '2025-10-03', '2025-10-09', 'draft')
  ON CONFLICT (id) DO NOTHING;

  -- Create shift templates for Haunted Mansion
  INSERT INTO shift_templates (id, org_id, attraction_id, name, day_of_week, start_time, end_time, role_id, min_staff, max_staff, color)
  VALUES
    -- Friday shifts
    ('71000000-0000-0000-0000-000000000001', v_org_id, v_attraction_id, 'Friday Night Scare', 5, '18:00', '23:00', v_scare_actor_role_id, 4, 6, '#DC2626'),
    ('71000000-0000-0000-0000-000000000002', v_org_id, v_attraction_id, 'Friday Night Actor', 5, '18:00', '23:00', v_actor_role_id, 2, 4, '#9333EA'),
    ('71000000-0000-0000-0000-000000000003', v_org_id, v_attraction_id, 'Friday Makeup', 5, '16:00', '22:00', v_makeup_role_id, 1, 2, '#EC4899'),
    ('71000000-0000-0000-0000-000000000004', v_org_id, v_attraction_id, 'Friday Security', 5, '17:00', '24:00', v_security_role_id, 2, 3, '#1F2937'),
    -- Saturday shifts
    ('71000000-0000-0000-0000-000000000005', v_org_id, v_attraction_id, 'Saturday Night Scare', 6, '17:00', '24:00', v_scare_actor_role_id, 6, 8, '#DC2626'),
    ('71000000-0000-0000-0000-000000000006', v_org_id, v_attraction_id, 'Saturday Night Actor', 6, '17:00', '24:00', v_actor_role_id, 3, 5, '#9333EA'),
    ('71000000-0000-0000-0000-000000000007', v_org_id, v_attraction_id, 'Saturday Makeup', 6, '15:00', '23:00', v_makeup_role_id, 2, 3, '#EC4899'),
    ('71000000-0000-0000-0000-000000000008', v_org_id, v_attraction_id, 'Saturday Security', 6, '16:00', '01:00', v_security_role_id, 3, 4, '#1F2937'),
    -- Sunday shifts (shorter hours)
    ('71000000-0000-0000-0000-000000000009', v_org_id, v_attraction_id, 'Sunday Evening Scare', 0, '18:00', '22:00', v_scare_actor_role_id, 3, 5, '#DC2626'),
    ('71000000-0000-0000-0000-000000000010', v_org_id, v_attraction_id, 'Sunday Security', 0, '17:00', '23:00', v_security_role_id, 2, 2, '#1F2937')
  ON CONFLICT (id) DO NOTHING;

  -- Create staff availability records
  INSERT INTO staff_availability (id, staff_id, org_id, day_of_week, start_time, end_time, availability_type, recurring, effective_from, effective_until)
  VALUES
    -- Jake Morrison (actor1) - Available Fri/Sat nights
    ('72000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', v_org_id, 5, '17:00', '24:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    ('72000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', v_org_id, 6, '16:00', '01:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    ('72000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', v_org_id, 0, '17:00', '23:00', 'preferred', TRUE, '2025-09-01', '2025-11-15'),
    -- Emily Rodriguez (actor2) - Available all weekend
    ('72000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', v_org_id, 5, '15:00', '24:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    ('72000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', v_org_id, 6, '15:00', '02:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    ('72000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000004', v_org_id, 0, '15:00', '23:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    -- Mike Thompson (actor3) - Available weekends but prefers Saturday
    ('72000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000005', v_org_id, 5, '18:00', '23:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    ('72000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000005', v_org_id, 6, '17:00', '01:00', 'preferred', TRUE, '2025-09-01', '2025-11-15'),
    -- Sarah Chen (manager) - Available for management shifts
    ('72000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000002', v_org_id, 5, '16:00', '24:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    ('72000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000002', v_org_id, 6, '15:00', '01:00', 'available', TRUE, '2025-09-01', '2025-11-15'),
    ('72000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000002', v_org_id, 0, '16:00', '23:00', 'available', TRUE, '2025-09-01', '2025-11-15')
  ON CONFLICT (id) DO NOTHING;

  -- Mike's time-off request for Oct 18
  INSERT INTO staff_availability (id, staff_id, org_id, date, availability_type, reason, recurring)
  VALUES
    ('72000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000005', v_org_id, '2025-10-18', 'time_off_pending', 'Family event', FALSE)
  ON CONFLICT (id) DO NOTHING;

  -- Create sample schedules for demo week
  INSERT INTO schedules (id, org_id, attraction_id, staff_id, date, start_time, end_time, role_id, status, created_by, notes)
  VALUES
    -- Friday Sep 26, 2025
    ('73000000-0000-0000-0000-000000000001', v_org_id, v_attraction_id, 'd0000000-0000-0000-0000-000000000003', '2025-09-26', '18:00', '23:00', v_scare_actor_role_id, 'scheduled', 'a0000000-0000-0000-0000-000000000003', 'Main hall scare'),
    ('73000000-0000-0000-0000-000000000002', v_org_id, v_attraction_id, 'd0000000-0000-0000-0000-000000000004', '2025-09-26', '18:00', '23:00', v_actor_role_id, 'scheduled', 'a0000000-0000-0000-0000-000000000003', 'Library scene'),
    ('73000000-0000-0000-0000-000000000003', v_org_id, v_attraction_id, 'd0000000-0000-0000-0000-000000000004', '2025-09-26', '16:00', '18:00', v_makeup_role_id, 'scheduled', 'a0000000-0000-0000-0000-000000000003', 'Pre-show makeup'),
    -- Saturday Sep 27, 2025
    ('73000000-0000-0000-0000-000000000004', v_org_id, v_attraction_id, 'd0000000-0000-0000-0000-000000000003', '2025-09-27', '17:00', '24:00', v_scare_actor_role_id, 'scheduled', 'a0000000-0000-0000-0000-000000000003', 'Basement scare - lead'),
    ('73000000-0000-0000-0000-000000000005', v_org_id, v_attraction_id, 'd0000000-0000-0000-0000-000000000004', '2025-09-27', '17:00', '24:00', v_scare_actor_role_id, 'scheduled', 'a0000000-0000-0000-0000-000000000003', 'Attic scare'),
    ('73000000-0000-0000-0000-000000000006', v_org_id, v_attraction_id, 'd0000000-0000-0000-0000-000000000005', '2025-09-27', '17:00', '24:00', v_actor_role_id, 'scheduled', 'a0000000-0000-0000-0000-000000000003', 'Dining room scene'),
    ('73000000-0000-0000-0000-000000000007', v_org_id, v_attraction_id, 'd0000000-0000-0000-0000-000000000002', '2025-09-27', '16:00', '01:00', v_manager_role_id, 'scheduled', 'a0000000-0000-0000-0000-000000000003', 'Floor manager'),
    -- Unassigned shifts (need coverage)
    ('73000000-0000-0000-0000-000000000008', v_org_id, v_attraction_id, NULL, '2025-09-26', '18:00', '23:00', v_security_role_id, 'draft', 'a0000000-0000-0000-0000-000000000003', 'Front gate security - NEED COVERAGE'),
    ('73000000-0000-0000-0000-000000000009', v_org_id, v_attraction_id, NULL, '2025-09-27', '17:00', '24:00', v_security_role_id, 'draft', 'a0000000-0000-0000-0000-000000000003', 'Parking lot security - NEED COVERAGE'),
    ('73000000-0000-0000-0000-000000000010', v_org_id, v_attraction_id, NULL, '2025-09-27', '17:00', '24:00', v_scare_actor_role_id, 'draft', 'a0000000-0000-0000-0000-000000000003', 'Entry hall scare - NEED COVERAGE')
  ON CONFLICT (id) DO NOTHING;

  -- Create sample shift swap request
  INSERT INTO shift_swaps (id, org_id, schedule_id, requested_by, swap_type, reason, status, expires_at)
  VALUES
    -- Jake wants to drop his Friday shift
    ('74000000-0000-0000-0000-000000000001', v_org_id, '73000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'drop', 'Family event - need coverage', 'pending', '2025-09-24 23:59:59')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'F7b scheduling seed data created successfully';
END $$;

-- ============================================================================
-- F7B SEED SUMMARY
-- ============================================================================
-- Schedule Periods: 2 (Halloween 2025 Week 1 & 2)
-- Shift Templates: 10 (Fri/Sat/Sun shifts for various roles)
-- Staff Availability: 12 records (Jake, Emily, Mike, Sarah)
-- Schedules: 10 (7 assigned, 3 unassigned needing coverage)
-- Shift Swaps: 1 (pending drop request)

-- ============================================================================
-- F8: TICKETING SEED DATA
-- ============================================================================

-- Get category IDs and create ticketing seed data
DO $$
DECLARE
  v_org_id UUID := 'b0000000-0000-0000-0000-000000000001';
  v_mansion_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_trail_id UUID := 'c0000000-0000-0000-0000-000000000002';
  v_season_id UUID := 'f0000000-0000-0000-0000-000000000002'; -- Halloween 2025
  v_general_cat_id UUID;
  v_vip_cat_id UUID;
  v_fast_pass_cat_id UUID;
  v_combo_cat_id UUID;
  v_group_cat_id UUID;
  v_online_source_id UUID;
  v_box_office_source_id UUID;
BEGIN
  -- Get system category IDs
  SELECT id INTO v_general_cat_id FROM ticket_categories WHERE key = 'general' AND org_id IS NULL;
  SELECT id INTO v_vip_cat_id FROM ticket_categories WHERE key = 'vip' AND org_id IS NULL;
  SELECT id INTO v_fast_pass_cat_id FROM ticket_categories WHERE key = 'fast_pass' AND org_id IS NULL;
  SELECT id INTO v_combo_cat_id FROM ticket_categories WHERE key = 'combo' AND org_id IS NULL;
  SELECT id INTO v_group_cat_id FROM ticket_categories WHERE key = 'group' AND org_id IS NULL;

  -- Get order source IDs
  SELECT id INTO v_online_source_id FROM order_sources WHERE key = 'online' AND org_id IS NULL;
  SELECT id INTO v_box_office_source_id FROM order_sources WHERE key = 'box_office' AND org_id IS NULL;

  -- Skip if ticketing tables don't exist (F8 migration not run yet)
  IF v_general_cat_id IS NULL THEN
    RAISE NOTICE 'Skipping F8 seed data - ticket_categories table not populated';
    RETURN;
  END IF;

  -- ============================================================================
  -- TICKET TYPES
  -- ============================================================================

  -- Haunted Mansion Tickets
  INSERT INTO ticket_types (id, org_id, attraction_id, season_id, name, description, price, compare_price, category_id, max_per_order, includes, restrictions, sort_order, is_active, available_from, available_until)
  VALUES
    ('80000000-0000-0000-0000-000000000001', v_org_id, v_mansion_id, v_season_id,
     'General Admission', 'Standard entry to The Haunted Mansion. Includes full walkthrough experience.',
     2500, NULL, v_general_cat_id, 10,
     ARRAY['Full mansion walkthrough', '25-minute experience', 'Photo opportunity at exit'],
     '{"min_age": 12}'::JSONB, 1, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59'),

    ('80000000-0000-0000-0000-000000000002', v_org_id, v_mansion_id, v_season_id,
     'VIP Experience', 'Premium Haunted Mansion experience with exclusive access and perks.',
     4500, 5500, v_vip_cat_id, 6,
     ARRAY['Skip-the-line entry', 'Exclusive VIP lounge access', 'Souvenir photo included', 'Behind-the-scenes tour', 'Meet the actors'],
     '{"min_age": 14}'::JSONB, 2, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59'),

    ('80000000-0000-0000-0000-000000000003', v_org_id, v_mansion_id, v_season_id,
     'Fast Pass', 'Express entry with minimal wait time.',
     3500, NULL, v_fast_pass_cat_id, 8,
     ARRAY['Priority queue access', 'Reduced wait time', 'Dedicated fast lane entry'],
     '{"min_age": 12}'::JSONB, 3, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59'),

    ('80000000-0000-0000-0000-000000000004', v_org_id, v_mansion_id, v_season_id,
     'Group Ticket (10+)', 'Discounted rate for groups of 10 or more.',
     2000, 2500, v_group_cat_id, 50,
     ARRAY['Discounted group rate', 'Group photo', 'Dedicated entrance time'],
     '{"min_age": 12, "min_quantity": 10}'::JSONB, 4, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59'),

  -- Terror Trail Tickets
    ('80000000-0000-0000-0000-000000000005', v_org_id, v_trail_id, v_season_id,
     'Trail General Admission', 'Experience the half-mile Terror Trail through dark woods.',
     3000, NULL, v_general_cat_id, 10,
     ARRAY['Half-mile outdoor trail', '35-minute experience', 'Flashlight prohibited'],
     '{"min_age": 14}'::JSONB, 1, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59'),

    ('80000000-0000-0000-0000-000000000006', v_org_id, v_trail_id, v_season_id,
     'Trail VIP', 'Premium Terror Trail with guide and exclusive scares.',
     5500, NULL, v_vip_cat_id, 4,
     ARRAY['Personal guide', 'Extra scare interactions', 'Night vision goggles provided', 'Hot cocoa at finish'],
     '{"min_age": 16}'::JSONB, 2, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59'),

  -- Combo Tickets
    ('80000000-0000-0000-0000-000000000007', v_org_id, v_mansion_id, v_season_id,
     'Nightmare Combo', 'Both Haunted Mansion AND Terror Trail in one night.',
     5000, 5500, v_combo_cat_id, 8,
     ARRAY['Haunted Mansion entry', 'Terror Trail entry', 'Valid same night only', 'Commemorative lanyard'],
     '{"min_age": 14}'::JSONB, 5, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59'),

    ('80000000-0000-0000-0000-000000000008', v_org_id, v_mansion_id, v_season_id,
     'Ultimate Nightmare VIP', 'The complete Nightmare Manor VIP experience.',
     8500, 10000, v_vip_cat_id, 4,
     ARRAY['VIP access to both attractions', 'Reserved parking', 'Dinner at Cryptkeeper Cafe', 'Exclusive merchandise', 'Professional photo package'],
     '{"min_age": 16}'::JSONB, 6, TRUE,
     '2026-01-01 00:00:00', '2026-12-31 23:59:59')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- TIME SLOTS (2 weeks of slots starting Oct 1, 2025)
  -- ============================================================================

  -- Haunted Mansion time slots (every 15 mins from 6pm-10pm on Fri/Sat/Sun)
  INSERT INTO time_slots (id, org_id, attraction_id, date, start_time, end_time, capacity, sold_count, status, price_modifier)
  VALUES
    -- Friday Oct 3, 2025
    ('81000000-0000-0000-0000-000000000001', v_org_id, v_mansion_id, '2025-10-03', '18:00', '18:15', 20, 18, 'limited', 0),
    ('81000000-0000-0000-0000-000000000002', v_org_id, v_mansion_id, '2025-10-03', '18:15', '18:30', 20, 20, 'sold_out', 0),
    ('81000000-0000-0000-0000-000000000003', v_org_id, v_mansion_id, '2025-10-03', '18:30', '18:45', 20, 12, 'available', 0),
    ('81000000-0000-0000-0000-000000000004', v_org_id, v_mansion_id, '2025-10-03', '18:45', '19:00', 20, 8, 'available', 0),
    ('81000000-0000-0000-0000-000000000005', v_org_id, v_mansion_id, '2025-10-03', '19:00', '19:15', 20, 15, 'available', 0),
    ('81000000-0000-0000-0000-000000000006', v_org_id, v_mansion_id, '2025-10-03', '19:15', '19:30', 20, 5, 'available', 0),
    ('81000000-0000-0000-0000-000000000007', v_org_id, v_mansion_id, '2025-10-03', '19:30', '19:45', 20, 2, 'available', 500),
    ('81000000-0000-0000-0000-000000000008', v_org_id, v_mansion_id, '2025-10-03', '19:45', '20:00', 20, 0, 'available', 500),
    -- Saturday Oct 4, 2025 (busier - price modifier on peak times)
    ('81000000-0000-0000-0000-000000000009', v_org_id, v_mansion_id, '2025-10-04', '17:00', '17:15', 25, 25, 'sold_out', 0),
    ('81000000-0000-0000-0000-000000000010', v_org_id, v_mansion_id, '2025-10-04', '17:15', '17:30', 25, 25, 'sold_out', 0),
    ('81000000-0000-0000-0000-000000000011', v_org_id, v_mansion_id, '2025-10-04', '17:30', '17:45', 25, 22, 'limited', 0),
    ('81000000-0000-0000-0000-000000000012', v_org_id, v_mansion_id, '2025-10-04', '17:45', '18:00', 25, 20, 'limited', 0),
    ('81000000-0000-0000-0000-000000000013', v_org_id, v_mansion_id, '2025-10-04', '18:00', '18:15', 25, 18, 'available', 500),
    ('81000000-0000-0000-0000-000000000014', v_org_id, v_mansion_id, '2025-10-04', '18:15', '18:30', 25, 15, 'available', 500),
    ('81000000-0000-0000-0000-000000000015', v_org_id, v_mansion_id, '2025-10-04', '19:00', '19:15', 25, 10, 'available', 1000),
    ('81000000-0000-0000-0000-000000000016', v_org_id, v_mansion_id, '2025-10-04', '19:15', '19:30', 25, 8, 'available', 1000),
    -- Sunday Oct 5, 2025
    ('81000000-0000-0000-0000-000000000017', v_org_id, v_mansion_id, '2025-10-05', '18:00', '18:15', 20, 5, 'available', 0),
    ('81000000-0000-0000-0000-000000000018', v_org_id, v_mansion_id, '2025-10-05', '18:15', '18:30', 20, 3, 'available', 0),
    ('81000000-0000-0000-0000-000000000019', v_org_id, v_mansion_id, '2025-10-05', '18:30', '18:45', 20, 0, 'available', 0),
    ('81000000-0000-0000-0000-000000000020', v_org_id, v_mansion_id, '2025-10-05', '18:45', '19:00', 20, 0, 'available', 0),

    -- Terror Trail time slots (30-min intervals from 7pm-10pm on Fri/Sat/Sun)
    -- Friday Oct 3, 2025
    ('81000000-0000-0000-0000-000000000101', v_org_id, v_trail_id, '2025-10-03', '19:00', '19:30', 15, 10, 'available', 0),
    ('81000000-0000-0000-0000-000000000102', v_org_id, v_trail_id, '2025-10-03', '19:30', '20:00', 15, 8, 'available', 0),
    ('81000000-0000-0000-0000-000000000103', v_org_id, v_trail_id, '2025-10-03', '20:00', '20:30', 15, 5, 'available', 0),
    ('81000000-0000-0000-0000-000000000104', v_org_id, v_trail_id, '2025-10-03', '20:30', '21:00', 15, 3, 'available', 500),
    ('81000000-0000-0000-0000-000000000105', v_org_id, v_trail_id, '2025-10-03', '21:00', '21:30', 15, 0, 'available', 500),
    ('81000000-0000-0000-0000-000000000106', v_org_id, v_trail_id, '2025-10-03', '21:30', '22:00', 15, 0, 'available', 500),
    -- Saturday Oct 4, 2025 (busier)
    ('81000000-0000-0000-0000-000000000107', v_org_id, v_trail_id, '2025-10-04', '19:00', '19:30', 20, 20, 'sold_out', 0),
    ('81000000-0000-0000-0000-000000000108', v_org_id, v_trail_id, '2025-10-04', '19:30', '20:00', 20, 18, 'limited', 0),
    ('81000000-0000-0000-0000-000000000109', v_org_id, v_trail_id, '2025-10-04', '20:00', '20:30', 20, 15, 'available', 500),
    ('81000000-0000-0000-0000-000000000110', v_org_id, v_trail_id, '2025-10-04', '20:30', '21:00', 20, 10, 'available', 500),
    ('81000000-0000-0000-0000-000000000111', v_org_id, v_trail_id, '2025-10-04', '21:00', '21:30', 20, 5, 'available', 1000),
    ('81000000-0000-0000-0000-000000000112', v_org_id, v_trail_id, '2025-10-04', '21:30', '22:00', 20, 0, 'available', 1000),
    -- Sunday Oct 5, 2025
    ('81000000-0000-0000-0000-000000000113', v_org_id, v_trail_id, '2025-10-05', '19:00', '19:30', 15, 5, 'available', 0),
    ('81000000-0000-0000-0000-000000000114', v_org_id, v_trail_id, '2025-10-05', '19:30', '20:00', 15, 3, 'available', 0),
    ('81000000-0000-0000-0000-000000000115', v_org_id, v_trail_id, '2025-10-05', '20:00', '20:30', 15, 0, 'available', 0),
    ('81000000-0000-0000-0000-000000000116', v_org_id, v_trail_id, '2025-10-05', '20:30', '21:00', 15, 0, 'available', 0)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- PROMO CODES
  -- ============================================================================

  INSERT INTO promo_codes (id, org_id, attraction_id, code, name, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, usage_count, per_customer_limit, valid_from, valid_until, is_active, created_by)
  VALUES
    -- Active codes
    ('82000000-0000-0000-0000-000000000001', v_org_id, NULL, 'HALLOWEEN25', 'Halloween 2025 Early Bird', '25% off for early bird purchases', 'percentage', 25, 2500, 2500, 500, 127, 1, '2025-09-01 00:00:00', '2025-09-30 23:59:59', TRUE, 'a0000000-0000-0000-0000-000000000002'),

    ('82000000-0000-0000-0000-000000000002', v_org_id, NULL, 'SCREAM10', 'Scream Season', '$10 off any order over $50', 'fixed_amount', 1000, 5000, NULL, NULL, 45, 2, '2025-10-01 00:00:00', '2025-10-31 23:59:59', TRUE, 'a0000000-0000-0000-0000-000000000002'),

    ('82000000-0000-0000-0000-000000000003', v_org_id, v_mansion_id, 'MANSIONVIP', 'Mansion VIP Discount', '15% off VIP mansion tickets', 'percentage', 15, NULL, 1500, 100, 12, 1, '2025-10-01 00:00:00', '2025-10-31 23:59:59', TRUE, 'a0000000-0000-0000-0000-000000000003'),

    ('82000000-0000-0000-0000-000000000004', v_org_id, NULL, 'GROUPSCARE', 'Group Discount', '$5 off per ticket for groups of 5+', 'fixed_amount', 500, 12500, NULL, NULL, 8, 1, '2025-09-15 00:00:00', '2025-11-01 23:59:59', TRUE, 'a0000000-0000-0000-0000-000000000002'),

    -- Expired code
    ('82000000-0000-0000-0000-000000000005', v_org_id, NULL, 'SUMMER20', 'Summer Flash Sale', '20% off - expired', 'percentage', 20, NULL, NULL, 200, 200, 1, '2025-06-01 00:00:00', '2025-08-31 23:59:59', FALSE, 'a0000000-0000-0000-0000-000000000002')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- SAMPLE ORDERS
  -- ============================================================================

  INSERT INTO orders (id, org_id, attraction_id, order_number, customer_email, customer_name, customer_phone, subtotal, discount_amount, tax_amount, total, status, promo_code_id, source_id, completed_at, created_at)
  VALUES
    -- Completed online order with promo
    ('83000000-0000-0000-0000-000000000001', v_org_id, v_mansion_id,
     'NIG-00000001', 'guest1@example.com', 'John Smith', '555-1001',
     5000, 1250, 234, 3984, 'completed',
     '82000000-0000-0000-0000-000000000001', v_online_source_id,
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

    -- Completed box office order
    ('83000000-0000-0000-0000-000000000002', v_org_id, v_mansion_id,
     'NIG-00000002', 'guest2@example.com', 'Sarah Johnson', '555-1002',
     7500, 0, 469, 7969, 'completed',
     NULL, v_box_office_source_id,
     NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

    -- Pending order (in cart)
    ('83000000-0000-0000-0000-000000000003', v_org_id, v_mansion_id,
     'NIG-00000003', 'guest3@example.com', 'Mike Wilson', NULL,
     5000, 0, 313, 5313, 'pending',
     NULL, v_online_source_id,
     NULL, NOW() - INTERVAL '30 minutes'),

    -- Completed VIP order
    ('83000000-0000-0000-0000-000000000004', v_org_id, v_mansion_id,
     'NIG-00000004', 'vipguest@example.com', 'Emily Davis', '555-1004',
     9000, 1350, 478, 8128, 'completed',
     '82000000-0000-0000-0000-000000000003', v_online_source_id,
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

    -- Refunded order
    ('83000000-0000-0000-0000-000000000005', v_org_id, v_mansion_id,
     'NIG-00000005', 'refund@example.com', 'Tom Brown', '555-1005',
     5000, 0, 313, 5313, 'refunded',
     NULL, v_online_source_id,
     NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- ORDER ITEMS
  -- ============================================================================

  INSERT INTO order_items (id, order_id, ticket_type_id, time_slot_id, quantity, unit_price, total_price)
  VALUES
    -- Order 1: 2 GA tickets
    ('84000000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', 2, 2500, 5000),

    -- Order 2: 3 GA tickets
    ('84000000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000009', 3, 2500, 7500),

    -- Order 3: 2 GA tickets (pending)
    ('84000000-0000-0000-0000-000000000003', '83000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000017', 2, 2500, 5000),

    -- Order 4: 2 VIP tickets
    ('84000000-0000-0000-0000-000000000004', '83000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000015', 2, 4500, 9000),

    -- Order 5: 2 GA tickets (refunded)
    ('84000000-0000-0000-0000-000000000005', '83000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000002', 2, 2500, 5000)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- TICKETS
  -- ============================================================================

  INSERT INTO tickets (id, org_id, order_id, order_item_id, ticket_type_id, time_slot_id, ticket_number, barcode, guest_name, status, checked_in_at, checked_in_by)
  VALUES
    -- Order 1 tickets (2 GA - both used)
    ('85000000-0000-0000-0000-000000000001', v_org_id, '83000000-0000-0000-0000-000000000001', '84000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001',
     'TNIG-0000001', 'A1B2C3D4E5F6A1B2C3D4E5F6', 'John Smith', 'used', NOW() - INTERVAL '4 days', 'a0000000-0000-0000-0000-000000000007'),
    ('85000000-0000-0000-0000-000000000002', v_org_id, '83000000-0000-0000-0000-000000000001', '84000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001',
     'TNIG-0000002', 'B2C3D4E5F6A1B2C3D4E5F6A1', 'Jane Smith', 'used', NOW() - INTERVAL '4 days', 'a0000000-0000-0000-0000-000000000007'),

    -- Order 2 tickets (3 GA - valid, not yet used)
    ('85000000-0000-0000-0000-000000000003', v_org_id, '83000000-0000-0000-0000-000000000002', '84000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000009',
     'TNIG-0000003', 'C3D4E5F6A1B2C3D4E5F6A1B2', 'Sarah Johnson', 'valid', NULL, NULL),
    ('85000000-0000-0000-0000-000000000004', v_org_id, '83000000-0000-0000-0000-000000000002', '84000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000009',
     'TNIG-0000004', 'D4E5F6A1B2C3D4E5F6A1B2C3', 'Guest 2', 'valid', NULL, NULL),
    ('85000000-0000-0000-0000-000000000005', v_org_id, '83000000-0000-0000-0000-000000000002', '84000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000009',
     'TNIG-0000005', 'E5F6A1B2C3D4E5F6A1B2C3D4', 'Guest 3', 'valid', NULL, NULL),

    -- Order 4 tickets (2 VIP - valid)
    ('85000000-0000-0000-0000-000000000006', v_org_id, '83000000-0000-0000-0000-000000000004', '84000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000015',
     'TNIG-0000006', 'F6A1B2C3D4E5F6A1B2C3D4E5', 'Emily Davis', 'valid', NULL, NULL),
    ('85000000-0000-0000-0000-000000000007', v_org_id, '83000000-0000-0000-0000-000000000004', '84000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000015',
     'TNIG-0000007', 'A1B2C3D4E5F6G7H8I9J0K1L2', 'Guest VIP', 'valid', NULL, NULL),

    -- Order 5 tickets (2 GA - voided due to refund)
    ('85000000-0000-0000-0000-000000000008', v_org_id, '83000000-0000-0000-0000-000000000005', '84000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000002',
     'TNIG-0000008', 'VOID1234567890VOID123456', 'Tom Brown', 'voided', NULL, NULL),
    ('85000000-0000-0000-0000-000000000009', v_org_id, '83000000-0000-0000-0000-000000000005', '84000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000002',
     'TNIG-0000009', 'VOID0987654321VOID098765', 'Guest Refund', 'voided', NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'F8 ticketing seed data created successfully';
END $$;

-- ============================================================================
-- F8 SEED SUMMARY
-- ============================================================================
-- Ticket Types: 8 (GA, VIP, Fast Pass, Group, Trail GA/VIP, Combos)
-- Time Slots: 20 (Oct 3-5, 2025 - mix of available/limited/sold_out)
-- Promo Codes: 5 (4 active, 1 expired)
-- Orders: 5 (3 completed, 1 pending, 1 refunded)
-- Order Items: 5
-- Tickets: 9 (2 used, 5 valid, 2 voided)

-- ============================================================================
-- F9: CHECK-IN SEED DATA
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID := 'b0000000-0000-0000-0000-000000000001';
  v_attraction_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_owner_id UUID := 'a0000000-0000-0000-0000-000000000002';
  v_scanner_id UUID := 'a0000000-0000-0000-0000-000000000007';
BEGIN
  -- ============================================================================
  -- CHECK-IN STATIONS
  -- ============================================================================

  INSERT INTO check_in_stations (id, org_id, attraction_id, name, location, device_id, is_active)
  VALUES
    ('e1000000-0000-0000-0000-000000000001', v_org_id, v_attraction_id, 'Main Entrance', 'Front Gate', 'IPAD-001', TRUE),
    ('e1000000-0000-0000-0000-000000000002', v_org_id, v_attraction_id, 'VIP Gate', 'Side Entrance', 'IPAD-002', TRUE),
    ('e1000000-0000-0000-0000-000000000003', v_org_id, v_attraction_id, 'Box Office', 'Ticket Booth', 'POS-001', TRUE),
    ('e1000000-0000-0000-0000-000000000004', v_org_id, v_attraction_id, 'Mobile Scanner', 'Roaming', NULL, TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- CHECK-INS (using existing tickets from F8)
  -- ============================================================================

  -- Only insert check-ins for tickets that exist (85000000-... series from F8)
  INSERT INTO check_ins (id, org_id, attraction_id, ticket_id, station_id, checked_in_by, check_in_time, check_in_method, guest_count, waiver_signed)
  VALUES
    -- Check-in for Order 1 tickets (already marked as used in F8 seed)
    ('e2000000-0000-0000-0000-000000000001', v_org_id, v_attraction_id, '85000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', v_scanner_id, NOW() - INTERVAL '4 days', 'qr_scan', 1, TRUE),
    ('e2000000-0000-0000-0000-000000000002', v_org_id, v_attraction_id, '85000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', v_scanner_id, NOW() - INTERVAL '4 days', 'barcode_scan', 1, TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- CAPACITY SNAPSHOTS
  -- ============================================================================

  INSERT INTO capacity_snapshots (org_id, attraction_id, timestamp, current_count, capacity, wait_time_minutes)
  VALUES
    (v_org_id, v_attraction_id, NOW() - INTERVAL '3 hours', 45, 200, 0),
    (v_org_id, v_attraction_id, NOW() - INTERVAL '2 hours', 85, 200, 0),
    (v_org_id, v_attraction_id, NOW() - INTERVAL '1 hour', 125, 200, 5),
    (v_org_id, v_attraction_id, NOW(), 150, 200, 10);

  -- ============================================================================
  -- GUEST WAIVERS
  -- ============================================================================

  INSERT INTO guest_waivers (id, org_id, attraction_id, ticket_id, guest_name, guest_email, guest_dob, is_minor, guardian_name, guardian_email, waiver_type, signed_at)
  VALUES
    ('e3000000-0000-0000-0000-000000000001', v_org_id, v_attraction_id, '85000000-0000-0000-0000-000000000001', 'John Smith', 'john@example.com', '1990-05-15', FALSE, NULL, NULL, 'standard', NOW() - INTERVAL '4 days'),
    ('e3000000-0000-0000-0000-000000000002', v_org_id, v_attraction_id, '85000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com', '1988-08-22', FALSE, NULL, NULL, 'standard', NOW() - INTERVAL '4 days'),
    ('e3000000-0000-0000-0000-000000000003', v_org_id, v_attraction_id, '85000000-0000-0000-0000-000000000003', 'Sarah Johnson', 'sarah@example.com', '1995-03-10', FALSE, NULL, NULL, 'standard', NOW() - INTERVAL '1 day'),
    ('e3000000-0000-0000-0000-000000000004', v_org_id, v_attraction_id, NULL, 'Mike Johnson Jr.', 'mikejr@example.com', '2012-07-20', TRUE, 'Mike Johnson Sr.', 'mike@example.com', 'minor', NOW() - INTERVAL '1 day')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'F9 check-in seed data created successfully';
END $$;

-- ============================================================================
-- F9 SEED SUMMARY
-- ============================================================================
-- Check-In Stations: 4 (Main Entrance, VIP Gate, Box Office, Mobile Scanner)
-- Check-Ins: 2 (for used tickets from F8)
-- Capacity Snapshots: 4 (hourly snapshots)
-- Guest Waivers: 4 (3 adult, 1 minor with guardian)

-- ============================================================================
-- F10: INVENTORY SEED DATA
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID := 'b0000000-0000-0000-0000-000000000001';
  v_mansion_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_trail_id UUID := 'c0000000-0000-0000-0000-000000000002';
  v_owner_id UUID := 'a0000000-0000-0000-0000-000000000002';
  v_manager_id UUID := 'a0000000-0000-0000-0000-000000000003';
  v_actor1_id UUID := 'a0000000-0000-0000-0000-000000000004';
  v_actor2_id UUID := 'a0000000-0000-0000-0000-000000000005';
  v_actor3_id UUID := 'a0000000-0000-0000-0000-000000000006';
  v_costume_type_id UUID;
  v_prop_type_id UUID;
  v_makeup_type_id UUID;
  v_equipment_type_id UUID;
  v_lighting_type_id UUID;
  v_audio_type_id UUID;
  v_safety_type_id UUID;
  v_consumable_type_id UUID;
  v_staff1_profile_id UUID;
  v_staff2_profile_id UUID;
  v_staff3_profile_id UUID;
BEGIN
  -- Get inventory type IDs (system defaults from migration)
  SELECT id INTO v_costume_type_id FROM inventory_types WHERE key = 'costume' AND org_id IS NULL;
  SELECT id INTO v_prop_type_id FROM inventory_types WHERE key = 'prop' AND org_id IS NULL;
  SELECT id INTO v_makeup_type_id FROM inventory_types WHERE key = 'makeup' AND org_id IS NULL;
  SELECT id INTO v_equipment_type_id FROM inventory_types WHERE key = 'equipment' AND org_id IS NULL;
  SELECT id INTO v_lighting_type_id FROM inventory_types WHERE key = 'lighting' AND org_id IS NULL;
  SELECT id INTO v_audio_type_id FROM inventory_types WHERE key = 'audio' AND org_id IS NULL;
  SELECT id INTO v_safety_type_id FROM inventory_types WHERE key = 'safety' AND org_id IS NULL;
  SELECT id INTO v_consumable_type_id FROM inventory_types WHERE key = 'consumable' AND org_id IS NULL;

  -- Get staff profile IDs (join with org_memberships to find by user_id)
  SELECT sp.id INTO v_staff1_profile_id FROM staff_profiles sp
    JOIN org_memberships om ON sp.id = om.id
    WHERE om.user_id = v_actor1_id AND sp.org_id = v_org_id;
  SELECT sp.id INTO v_staff2_profile_id FROM staff_profiles sp
    JOIN org_memberships om ON sp.id = om.id
    WHERE om.user_id = v_actor2_id AND sp.org_id = v_org_id;
  SELECT sp.id INTO v_staff3_profile_id FROM staff_profiles sp
    JOIN org_memberships om ON sp.id = om.id
    WHERE om.user_id = v_actor3_id AND sp.org_id = v_org_id;

  -- Skip if inventory tables don't exist (F10 migration not run yet)
  IF v_costume_type_id IS NULL THEN
    RAISE NOTICE 'Skipping F10 seed data - inventory_types table not populated';
    RETURN;
  END IF;

  -- ============================================================================
  -- INVENTORY CATEGORIES
  -- ============================================================================

  INSERT INTO inventory_categories (id, org_id, name, description, parent_id, icon, color, sort_order)
  VALUES
    -- Top-level categories
    ('90000000-0000-0000-0000-000000000001', v_org_id, 'Costumes', 'All costumes and wardrobe items', NULL, 'shirt', '#9333EA', 1),
    ('90000000-0000-0000-0000-000000000002', v_org_id, 'Props', 'Set pieces and hand props', NULL, 'box', '#F59E0B', 2),
    ('90000000-0000-0000-0000-000000000003', v_org_id, 'Makeup & SFX', 'Makeup, prosthetics, and special effects', NULL, 'palette', '#EC4899', 3),
    ('90000000-0000-0000-0000-000000000004', v_org_id, 'Technical', 'Lighting, audio, and equipment', NULL, 'wrench', '#6B7280', 4),
    ('90000000-0000-0000-0000-000000000005', v_org_id, 'Safety', 'Safety and first aid equipment', NULL, 'shield', '#EF4444', 5),

    -- Sub-categories
    ('90000000-0000-0000-0000-000000000010', v_org_id, 'Character Costumes', 'Full character costume sets', '90000000-0000-0000-0000-000000000001', NULL, NULL, 1),
    ('90000000-0000-0000-0000-000000000011', v_org_id, 'Accessories', 'Costume accessories and additions', '90000000-0000-0000-0000-000000000001', NULL, NULL, 2),
    ('90000000-0000-0000-0000-000000000012', v_org_id, 'Masks', 'Masks and headpieces', '90000000-0000-0000-0000-000000000001', NULL, NULL, 3),

    ('90000000-0000-0000-0000-000000000020', v_org_id, 'Hand Props', 'Handheld props for actors', '90000000-0000-0000-0000-000000000002', NULL, NULL, 1),
    ('90000000-0000-0000-0000-000000000021', v_org_id, 'Set Pieces', 'Larger set decoration items', '90000000-0000-0000-0000-000000000002', NULL, NULL, 2),
    ('90000000-0000-0000-0000-000000000022', v_org_id, 'Animatronics', 'Moving props and animatronics', '90000000-0000-0000-0000-000000000002', NULL, NULL, 3)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- INVENTORY ITEMS
  -- ============================================================================

  INSERT INTO inventory_items (id, org_id, attraction_id, category_id, type_id, sku, name, description, quantity, min_quantity, max_quantity, unit, unit_cost, location, condition, notes, is_active)
  VALUES
    -- Costumes
    ('91000000-0000-0000-0000-000000000001', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000010', v_costume_type_id,
     'CST-VAMP-001', 'Victorian Vampire Lord', 'Full Victorian vampire costume with cape, vest, and accessories', 3, 2, 5, 'set', 15000, 'Costume Storage A1', 'good',
     'Popular character costume - order more before October', TRUE),

    ('91000000-0000-0000-0000-000000000002', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000010', v_costume_type_id,
     'CST-GHOST-001', 'Phantom Bride', 'White wedding dress with ghostly tattered effects', 2, 1, 3, 'set', 12000, 'Costume Storage A2', 'excellent',
     'Requires special lighting for full effect', TRUE),

    ('91000000-0000-0000-0000-000000000003', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000010', v_costume_type_id,
     'CST-BUTL-001', 'Creepy Butler', 'Formal butler attire with horror makeup kit', 4, 2, 6, 'set', 8000, 'Costume Storage A3', 'good',
     'Standard character - multiple sizes available', TRUE),

    ('91000000-0000-0000-0000-000000000004', v_org_id, v_trail_id, '90000000-0000-0000-0000-000000000010', v_costume_type_id,
     'CST-WERE-001', 'Werewolf Suit', 'Full-body werewolf costume with mechanical jaw', 2, 1, 3, 'set', 35000, 'Costume Storage B1', 'excellent',
     'Animatronic jaw requires battery pack', TRUE),

    ('91000000-0000-0000-0000-000000000005', v_org_id, v_trail_id, '90000000-0000-0000-0000-000000000010', v_costume_type_id,
     'CST-SCAR-001', 'Scarecrow Horror', 'Scarecrow costume with LED eyes', 3, 2, 4, 'set', 9500, 'Costume Storage B2', 'good',
     'LED eyes need replacement every 20 hours', TRUE),

    -- Masks
    ('91000000-0000-0000-0000-000000000006', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000012', v_costume_type_id,
     'MSK-DEMON-001', 'Demon Mask - Full Face', 'Silicone demon mask with horns', 5, 3, 8, 'each', 7500, 'Mask Cabinet 1', 'good',
     'Clean with special silicone cleaner only', TRUE),

    ('91000000-0000-0000-0000-000000000007', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000012', v_costume_type_id,
     'MSK-ZOMB-001', 'Zombie Mask Collection', 'Various zombie face masks', 8, 5, 12, 'each', 2500, 'Mask Cabinet 2', 'good',
     'Assorted designs', TRUE),

    -- Props
    ('91000000-0000-0000-0000-000000000008', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000020', v_prop_type_id,
     'PRP-CAND-001', 'Candlestick - Antique Style', 'Brass antique-style candlestick with LED candle', 12, 8, 20, 'each', 1500, 'Props Shelf A1', 'good',
     'LED batteries last 50 hours', TRUE),

    ('91000000-0000-0000-0000-000000000009', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000020', v_prop_type_id,
     'PRP-BOOK-001', 'Spellbook Prop', 'Faux leather spellbook with glowing pages', 4, 2, 6, 'each', 3500, 'Props Shelf A2', 'excellent',
     'Uses UV-reactive ink', TRUE),

    ('91000000-0000-0000-0000-000000000010', v_org_id, v_trail_id, '90000000-0000-0000-0000-000000000020', v_prop_type_id,
     'PRP-CSAW-001', 'Chainsaw Prop', 'Non-functional chainsaw with sound effects', 2, 1, 3, 'each', 8000, 'Props Locker B1', 'good',
     'Sound module requires 4 AA batteries', TRUE),

    ('91000000-0000-0000-0000-000000000011', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000021', v_prop_type_id,
     'SET-COFF-001', 'Coffin - Full Size', 'Wooden coffin prop with opening lid', 3, 2, 4, 'each', 45000, 'Set Storage Room', 'good',
     'Weighted hinges for dramatic opening', TRUE),

    ('91000000-0000-0000-0000-000000000012', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000022', v_prop_type_id,
     'ANM-HAND-001', 'Animated Grabbing Hand', 'Wall-mounted animated reaching hand', 6, 4, 10, 'each', 15000, 'Animatronics Storage', 'good',
     'Pneumatic - requires air compressor', TRUE),

    -- Makeup & SFX
    ('91000000-0000-0000-0000-000000000013', v_org_id, NULL, '90000000-0000-0000-0000-000000000003', v_makeup_type_id,
     'MKP-BLOO-001', 'Stage Blood - Gallon', 'Washable stage blood for all productions', 5, 3, 10, 'gallon', 2500, 'Makeup Room', 'new',
     'Wash-safe formula', TRUE),

    ('91000000-0000-0000-0000-000000000014', v_org_id, NULL, '90000000-0000-0000-0000-000000000003', v_makeup_type_id,
     'MKP-PROS-001', 'Prosthetic Appliance Kit', 'Zombie bite wounds and scars', 20, 15, 30, 'kit', 1800, 'Makeup Room', 'new',
     'Single-use prosthetics', TRUE),

    ('91000000-0000-0000-0000-000000000015', v_org_id, NULL, '90000000-0000-0000-0000-000000000003', v_makeup_type_id,
     'MKP-WHTE-001', 'White Face Paint', 'Professional-grade white face makeup', 8, 5, 15, 'jar', 1200, 'Makeup Room', 'new',
     'Latex-free formula', TRUE),

    ('91000000-0000-0000-0000-000000000016', v_org_id, NULL, '90000000-0000-0000-0000-000000000003', v_makeup_type_id,
     'MKP-CONT-001', 'Contact Lenses - Sclera', 'Full sclera demon eye contacts', 6, 4, 10, 'pair', 8500, 'Makeup Room Locked', 'new',
     'Requires optometrist fitting', TRUE),

    -- Technical Equipment
    ('91000000-0000-0000-0000-000000000017', v_org_id, NULL, '90000000-0000-0000-0000-000000000004', v_lighting_type_id,
     'LGT-FOG-001', 'Fog Machine - 1500W', 'High-output fog machine', 4, 2, 6, 'each', 25000, 'Tech Storage', 'good',
     'Use only approved fog fluid', TRUE),

    ('91000000-0000-0000-0000-000000000018', v_org_id, NULL, '90000000-0000-0000-0000-000000000004', v_lighting_type_id,
     'LGT-STRB-001', 'Strobe Light', 'Adjustable strobe light with DMX', 10, 6, 15, 'each', 8000, 'Tech Storage', 'good',
     'Warning: seizure risk signage required', TRUE),

    ('91000000-0000-0000-0000-000000000019', v_org_id, NULL, '90000000-0000-0000-0000-000000000004', v_audio_type_id,
     'AUD-SPKR-001', 'Outdoor Speaker', 'Weatherproof speaker for trail', 8, 4, 12, 'each', 15000, 'Tech Storage', 'excellent',
     'IP65 rated', TRUE),

    ('91000000-0000-0000-0000-000000000020', v_org_id, NULL, '90000000-0000-0000-0000-000000000004', v_equipment_type_id,
     'EQP-RADI-001', 'Two-Way Radio', 'Staff communication radios', 15, 10, 20, 'each', 5000, 'Operations Office', 'good',
     'Charge nightly', TRUE),

    -- Safety Equipment
    ('91000000-0000-0000-0000-000000000021', v_org_id, NULL, '90000000-0000-0000-0000-000000000005', v_safety_type_id,
     'SAF-FAID-001', 'First Aid Kit - Large', 'Comprehensive first aid kit', 6, 4, 8, 'kit', 7500, 'First Aid Stations', 'new',
     'Check expiration monthly', TRUE),

    ('91000000-0000-0000-0000-000000000022', v_org_id, NULL, '90000000-0000-0000-0000-000000000005', v_safety_type_id,
     'SAF-FIRE-001', 'Fire Extinguisher', 'ABC fire extinguisher', 12, 10, 15, 'each', 4500, 'Various Locations', 'excellent',
     'Annual inspection required', TRUE),

    ('91000000-0000-0000-0000-000000000023', v_org_id, NULL, '90000000-0000-0000-0000-000000000005', v_safety_type_id,
     'SAF-LITE-001', 'Emergency Flashlight', 'Rechargeable emergency flashlight', 20, 15, 25, 'each', 2000, 'Emergency Stations', 'good',
     'Test weekly', TRUE),

    -- Consumables
    ('91000000-0000-0000-0000-000000000024', v_org_id, NULL, '90000000-0000-0000-0000-000000000003', v_consumable_type_id,
     'CON-GLOV-001', 'Latex Gloves - Box', 'Disposable latex gloves for makeup', 15, 10, 25, 'box', 800, 'Makeup Room', 'new',
     '100 per box', TRUE),

    ('91000000-0000-0000-0000-000000000025', v_org_id, NULL, '90000000-0000-0000-0000-000000000003', v_consumable_type_id,
     'CON-WIPE-001', 'Makeup Remover Wipes', 'Gentle makeup removal wipes', 30, 20, 50, 'pack', 500, 'Makeup Room', 'new',
     '50 wipes per pack', TRUE),

    ('91000000-0000-0000-0000-000000000026', v_org_id, NULL, '90000000-0000-0000-0000-000000000004', v_consumable_type_id,
     'CON-BATT-001', 'AA Batteries - Pack', 'Alkaline AA batteries', 25, 20, 40, 'pack', 1000, 'Tech Storage', 'new',
     '8-pack', TRUE),

    ('91000000-0000-0000-0000-000000000027', v_org_id, NULL, '90000000-0000-0000-0000-000000000004', v_consumable_type_id,
     'CON-FOGL-001', 'Fog Fluid - 4L', 'Standard density fog fluid', 10, 8, 15, 'bottle', 2000, 'Tech Storage', 'new',
     'Do not mix with other brands', TRUE),

    -- Low stock items (for testing alerts)
    ('91000000-0000-0000-0000-000000000028', v_org_id, v_mansion_id, '90000000-0000-0000-0000-000000000010', v_costume_type_id,
     'CST-MAID-001', 'Gothic Maid Costume', 'Black and white gothic maid costume', 1, 2, 4, 'set', 6500, 'Costume Storage A4', 'fair',
     'LOW STOCK - Need to order more', TRUE),

    ('91000000-0000-0000-0000-000000000029', v_org_id, NULL, '90000000-0000-0000-0000-000000000003', v_makeup_type_id,
     'MKP-LATX-001', 'Liquid Latex', 'Professional liquid latex for prosthetics', 2, 4, 8, 'bottle', 3000, 'Makeup Room', 'new',
     'LOW STOCK - Critical for daily operations', TRUE),

    ('91000000-0000-0000-0000-000000000030', v_org_id, NULL, '90000000-0000-0000-0000-000000000004', v_lighting_type_id,
     'LGT-BLCK-001', 'Blacklight Tube', 'UV blacklight tube replacement', 3, 5, 10, 'each', 1500, 'Tech Storage', 'new',
     'LOW STOCK - Order replacements', TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- INVENTORY CHECKOUTS
  -- ============================================================================

  -- Only create checkouts if staff profiles exist
  IF v_staff1_profile_id IS NOT NULL THEN
    INSERT INTO inventory_checkouts (id, org_id, item_id, staff_id, quantity, checked_out_at, checked_out_by, due_date, condition_out, notes)
    VALUES
      -- Active checkouts
      ('92000000-0000-0000-0000-000000000001', v_org_id, '91000000-0000-0000-0000-000000000001', v_staff1_profile_id, 1,
       NOW() - INTERVAL '2 days', v_manager_id, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'good',
       'Vampire Lord costume for Jake Morrison - Mansion main character'),

      ('92000000-0000-0000-0000-000000000002', v_org_id, '91000000-0000-0000-0000-000000000006', v_staff1_profile_id, 1,
       NOW() - INTERVAL '2 days', v_manager_id, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'good',
       'Demon mask to go with vampire costume'),

      ('92000000-0000-0000-0000-000000000003', v_org_id, '91000000-0000-0000-0000-000000000002', v_staff2_profile_id, 1,
       NOW() - INTERVAL '3 days', v_manager_id, (CURRENT_DATE + INTERVAL '4 days')::DATE, 'excellent',
       'Phantom Bride costume for Emily Rodriguez'),

      ('92000000-0000-0000-0000-000000000004', v_org_id, '91000000-0000-0000-0000-000000000020', v_staff3_profile_id, 1,
       NOW() - INTERVAL '1 day', v_manager_id, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'good',
       'Radio for trail operations'),

      -- Returned checkout (to show history)
      ('92000000-0000-0000-0000-000000000005', v_org_id, '91000000-0000-0000-0000-000000000003', v_staff1_profile_id, 1,
       NOW() - INTERVAL '10 days', v_manager_id, (CURRENT_DATE - INTERVAL '3 days')::DATE, 'good',
       'Butler costume - returned after last weekend')
    ON CONFLICT (id) DO NOTHING;

    -- Update the returned checkout
    UPDATE inventory_checkouts
    SET returned_at = NOW() - INTERVAL '3 days',
        returned_by = v_manager_id,
        condition_in = 'good'
    WHERE id = '92000000-0000-0000-0000-000000000005';
  END IF;

  -- ============================================================================
  -- INVENTORY TRANSACTIONS (manual adjustments and purchases)
  -- ============================================================================

  INSERT INTO inventory_transactions (id, org_id, item_id, type, quantity, previous_qty, new_qty, reason, reference_type, performed_by)
  VALUES
    -- Initial stock purchases
    ('93000000-0000-0000-0000-000000000001', v_org_id, '91000000-0000-0000-0000-000000000013', 'purchase', 5, 0, 5,
     'Initial season stock purchase', 'manual', v_owner_id),

    ('93000000-0000-0000-0000-000000000002', v_org_id, '91000000-0000-0000-0000-000000000014', 'purchase', 20, 0, 20,
     'Prosthetic kit order for October', 'manual', v_owner_id),

    ('93000000-0000-0000-0000-000000000003', v_org_id, '91000000-0000-0000-0000-000000000026', 'purchase', 25, 0, 25,
     'Battery stock for season', 'manual', v_manager_id),

    -- Adjustments
    ('93000000-0000-0000-0000-000000000004', v_org_id, '91000000-0000-0000-0000-000000000007', 'damaged', -1, 9, 8,
     'Mask damaged during performance - discarded', 'manual', v_manager_id),

    ('93000000-0000-0000-0000-000000000005', v_org_id, '91000000-0000-0000-0000-000000000008', 'adjustment', 2, 10, 12,
     'Found 2 additional candlesticks in back storage', 'manual', v_manager_id)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'F10 inventory seed data created successfully';
END $$;

-- ============================================================================
-- F10 SEED SUMMARY
-- ============================================================================
-- Inventory Categories: 11 (5 top-level, 6 sub-categories)
-- Inventory Items: 30 (costumes, props, makeup, equipment, safety, consumables)
-- Inventory Checkouts: 5 (4 active, 1 returned)
-- Inventory Transactions: 5 (3 purchases, 2 adjustments)
-- Low Stock Items: 3 (for testing alerts)


-- ============================================================================
-- F11: VIRTUAL QUEUE
-- ============================================================================
-- Queue configs, entries, and notifications for testing virtual queue system

DO $$
DECLARE
  v_org_id UUID := 'b0000000-0000-0000-0000-000000000001';
  v_mansion_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_trail_id UUID := 'c0000000-0000-0000-0000-000000000002';
  v_mansion_queue_id UUID := 'e0000000-0000-0000-0000-000000000001';
  v_trail_queue_id UUID := 'e0000000-0000-0000-0000-000000000002';
  v_current_position INTEGER := 1;
BEGIN

  -- ============================================================================
  -- QUEUE CONFIGS
  -- ============================================================================

  INSERT INTO queue_configs (
    id, org_id, attraction_id, name, is_active, is_paused,
    capacity_per_batch, batch_interval_minutes, max_wait_minutes, max_queue_size,
    allow_rejoin, require_check_in, notification_lead_minutes, expiry_minutes,
    settings
  ) VALUES
    -- The Haunted Mansion queue
    (v_mansion_queue_id, v_org_id, v_mansion_id, 'Haunted Mansion Virtual Queue', TRUE, FALSE,
     10, 5, 120, 300, FALSE, TRUE, 10, 15,
     '{"welcome_message": "Welcome to the Haunted Mansion virtual queue!", "sms_enabled": true}'::JSONB),

    -- Terror Trail queue
    (v_trail_queue_id, v_org_id, v_trail_id, 'Terror Trail Virtual Queue', TRUE, FALSE,
     6, 8, 90, 200, FALSE, TRUE, 15, 20,
     '{"welcome_message": "You have joined the Terror Trail virtual queue.", "sms_enabled": true}'::JSONB)
  ON CONFLICT (attraction_id) DO NOTHING;

  -- ============================================================================
  -- QUEUE ENTRIES - Various statuses for demo
  -- ============================================================================

  -- Waiting entries (positions 1-15 for Haunted Mansion)
  INSERT INTO queue_entries (
    id, org_id, queue_id, confirmation_code, guest_name, guest_phone, guest_email,
    party_size, position, status, joined_at, estimated_time, notes
  ) VALUES
    ('e1000000-0000-0000-0000-000000000001', v_org_id, v_mansion_queue_id,
     'HM001A', 'Johnson Family', '+15551234001', 'johnson@email.com',
     4, 1, 'waiting', NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '5 minutes', NULL),

    ('e1000000-0000-0000-0000-000000000002', v_org_id, v_mansion_queue_id,
     'HM002B', 'Sarah Chen', '+15551234002', 'sarah.chen@email.com',
     2, 2, 'waiting', NOW() - INTERVAL '40 minutes', NOW() + INTERVAL '10 minutes', NULL),

    ('e1000000-0000-0000-0000-000000000003', v_org_id, v_mansion_queue_id,
     'HM003C', 'Smith Party', '+15551234003', 'smith@email.com',
     6, 3, 'waiting', NOW() - INTERVAL '35 minutes', NOW() + INTERVAL '15 minutes', 'Large group - may need extra time'),

    ('e1000000-0000-0000-0000-000000000004', v_org_id, v_mansion_queue_id,
     'HM004D', 'Mike Williams', '+15551234004', 'mike.w@email.com',
     1, 4, 'waiting', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '20 minutes', NULL),

    ('e1000000-0000-0000-0000-000000000005', v_org_id, v_mansion_queue_id,
     'HM005E', 'Garcia Family', '+15551234005', 'garcia@email.com',
     5, 5, 'waiting', NOW() - INTERVAL '25 minutes', NOW() + INTERVAL '25 minutes', NULL),

    ('e1000000-0000-0000-0000-000000000006', v_org_id, v_mansion_queue_id,
     'HM006F', 'Emily Davis', '+15551234006', 'emily.d@email.com',
     2, 6, 'waiting', NOW() - INTERVAL '20 minutes', NOW() + INTERVAL '30 minutes', NULL),

    ('e1000000-0000-0000-0000-000000000007', v_org_id, v_mansion_queue_id,
     'HM007G', 'Thompson Group', '+15551234007', 'thompson@email.com',
     8, 7, 'waiting', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '35 minutes', 'Birthday party group'),

    ('e1000000-0000-0000-0000-000000000008', v_org_id, v_mansion_queue_id,
     'HM008H', 'Brown Couple', '+15551234008', 'brown@email.com',
     2, 8, 'waiting', NOW() - INTERVAL '12 minutes', NOW() + INTERVAL '40 minutes', NULL),

    ('e1000000-0000-0000-0000-000000000009', v_org_id, v_mansion_queue_id,
     'HM009J', 'Wilson Family', '+15551234009', 'wilson@email.com',
     4, 9, 'waiting', NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '45 minutes', NULL),

    ('e1000000-0000-0000-0000-000000000010', v_org_id, v_mansion_queue_id,
     'HM010K', 'Taylor Party', '+15551234010', 'taylor@email.com',
     3, 10, 'waiting', NOW() - INTERVAL '8 minutes', NOW() + INTERVAL '50 minutes', NULL)
  ON CONFLICT (confirmation_code) DO NOTHING;

  -- Notified entries (about to be called)
  INSERT INTO queue_entries (
    id, org_id, queue_id, confirmation_code, guest_name, guest_phone, guest_email,
    party_size, position, status, joined_at, notified_at, estimated_time
  ) VALUES
    ('e1000000-0000-0000-0000-000000000011', v_org_id, v_mansion_queue_id,
     'HM011L', 'Anderson Family', '+15551234011', 'anderson@email.com',
     3, 0, 'notified', NOW() - INTERVAL '60 minutes', NOW() - INTERVAL '5 minutes', NOW()),

    ('e1000000-0000-0000-0000-000000000012', v_org_id, v_mansion_queue_id,
     'HM012M', 'Martinez Duo', '+15551234012', 'martinez@email.com',
     2, 0, 'notified', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '3 minutes', NOW())
  ON CONFLICT (confirmation_code) DO NOTHING;

  -- Called entries (at entrance)
  INSERT INTO queue_entries (
    id, org_id, queue_id, confirmation_code, guest_name, guest_phone, guest_email,
    party_size, position, status, joined_at, notified_at, called_at
  ) VALUES
    ('e1000000-0000-0000-0000-000000000013', v_org_id, v_mansion_queue_id,
     'HM013N', 'Lee Family', '+15551234013', 'lee@email.com',
     4, 0, 'called', NOW() - INTERVAL '70 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '2 minutes')
  ON CONFLICT (confirmation_code) DO NOTHING;

  -- Checked in entries (completed)
  INSERT INTO queue_entries (
    id, org_id, queue_id, confirmation_code, guest_name, guest_phone, guest_email,
    party_size, position, status, joined_at, notified_at, called_at, checked_in_at
  ) VALUES
    ('e1000000-0000-0000-0000-000000000014', v_org_id, v_mansion_queue_id,
     'HM014P', 'Clark Group', '+15551234014', 'clark@email.com',
     5, 0, 'checked_in', NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '20 minutes'),

    ('e1000000-0000-0000-0000-000000000015', v_org_id, v_mansion_queue_id,
     'HM015Q', 'Robinson Family', '+15551234015', 'robinson@email.com',
     4, 0, 'checked_in', NOW() - INTERVAL '100 minutes', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '30 minutes'),

    ('e1000000-0000-0000-0000-000000000016', v_org_id, v_mansion_queue_id,
     'HM016R', 'Harris Party', '+15551234016', 'harris@email.com',
     6, 0, 'checked_in', NOW() - INTERVAL '110 minutes', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '40 minutes')
  ON CONFLICT (confirmation_code) DO NOTHING;

  -- Expired entries (no-show)
  INSERT INTO queue_entries (
    id, org_id, queue_id, confirmation_code, guest_name, guest_phone, guest_email,
    party_size, position, status, joined_at, notified_at, called_at, expired_at
  ) VALUES
    ('e1000000-0000-0000-0000-000000000017', v_org_id, v_mansion_queue_id,
     'HM017S', 'Young Couple', '+15551234017', 'young@email.com',
     2, 0, 'expired', NOW() - INTERVAL '120 minutes', NOW() - INTERVAL '65 minutes', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '40 minutes'),

    ('e1000000-0000-0000-0000-000000000018', v_org_id, v_mansion_queue_id,
     'HM018T', 'King Party', '+15551234018', 'king@email.com',
     3, 0, 'no_show', NOW() - INTERVAL '130 minutes', NOW() - INTERVAL '75 minutes', NOW() - INTERVAL '65 minutes', NOW() - INTERVAL '50 minutes')
  ON CONFLICT (confirmation_code) DO NOTHING;

  -- Left queue voluntarily
  INSERT INTO queue_entries (
    id, org_id, queue_id, confirmation_code, guest_name, guest_phone, guest_email,
    party_size, position, status, joined_at, left_at, notes
  ) VALUES
    ('e1000000-0000-0000-0000-000000000019', v_org_id, v_mansion_queue_id,
     'HM019U', 'Wright Family', '+15551234019', 'wright@email.com',
     4, 0, 'left', NOW() - INTERVAL '80 minutes', NOW() - INTERVAL '50 minutes', 'Kids got tired')
  ON CONFLICT (confirmation_code) DO NOTHING;

  -- Terror Trail waiting entries
  INSERT INTO queue_entries (
    id, org_id, queue_id, confirmation_code, guest_name, guest_phone, guest_email,
    party_size, position, status, joined_at, estimated_time
  ) VALUES
    ('e1000000-0000-0000-0000-000000000020', v_org_id, v_trail_queue_id,
     'TT001A', 'Adams Group', '+15551234020', 'adams@email.com',
     4, 1, 'waiting', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '10 minutes'),

    ('e1000000-0000-0000-0000-000000000021', v_org_id, v_trail_queue_id,
     'TT002B', 'Baker Duo', '+15551234021', 'baker@email.com',
     2, 2, 'waiting', NOW() - INTERVAL '25 minutes', NOW() + INTERVAL '18 minutes'),

    ('e1000000-0000-0000-0000-000000000022', v_org_id, v_trail_queue_id,
     'TT003C', 'Cooper Family', '+15551234022', 'cooper@email.com',
     5, 3, 'waiting', NOW() - INTERVAL '20 minutes', NOW() + INTERVAL '26 minutes'),

    ('e1000000-0000-0000-0000-000000000023', v_org_id, v_trail_queue_id,
     'TT004D', 'Davies Party', '+15551234023', 'davies@email.com',
     3, 4, 'waiting', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '34 minutes'),

    ('e1000000-0000-0000-0000-000000000024', v_org_id, v_trail_queue_id,
     'TT005E', 'Evans Group', '+15551234024', 'evans@email.com',
     6, 5, 'waiting', NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '42 minutes')
  ON CONFLICT (confirmation_code) DO NOTHING;

  -- ============================================================================
  -- QUEUE NOTIFICATIONS
  -- ============================================================================

  INSERT INTO queue_notifications (
    id, org_id, entry_id, type, channel, recipient, message, sent_at, delivered_at
  ) VALUES
    -- Joined confirmations
    ('e2000000-0000-0000-0000-000000000001', v_org_id, 'e1000000-0000-0000-0000-000000000001',
     'joined', 'sms', '+15551234001',
     'Welcome! You are #1 in line for Haunted Mansion. Estimated wait: 5 mins. Check status: haunt.app/q/HM001A',
     NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'),

    ('e2000000-0000-0000-0000-000000000002', v_org_id, 'e1000000-0000-0000-0000-000000000002',
     'joined', 'sms', '+15551234002',
     'Welcome! You are #2 in line for Haunted Mansion. Estimated wait: 10 mins. Check status: haunt.app/q/HM002B',
     NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'),

    -- Almost ready notifications
    ('e2000000-0000-0000-0000-000000000003', v_org_id, 'e1000000-0000-0000-0000-000000000011',
     'almost_ready', 'sms', '+15551234011',
     'Almost time! Please head to the Haunted Mansion entrance. You will be called in ~5 minutes.',
     NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),

    -- Ready/called notifications
    ('e2000000-0000-0000-0000-000000000004', v_org_id, 'e1000000-0000-0000-0000-000000000011',
     'ready', 'sms', '+15551234011',
     'It''s your turn! Please proceed to the Haunted Mansion entrance now. Code: HM011L',
     NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),

    ('e2000000-0000-0000-0000-000000000005', v_org_id, 'e1000000-0000-0000-0000-000000000013',
     'ready', 'sms', '+15551234013',
     'It''s your turn! Please proceed to the Haunted Mansion entrance now. Code: HM013N',
     NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '2 minutes'),

    -- Expired notification
    ('e2000000-0000-0000-0000-000000000006', v_org_id, 'e1000000-0000-0000-0000-000000000017',
     'expired', 'sms', '+15551234017',
     'Your queue position has expired. Please rejoin if you''d like to visit.',
     NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'),

    -- Reminder notifications
    ('e2000000-0000-0000-0000-000000000007', v_org_id, 'e1000000-0000-0000-0000-000000000005',
     'reminder', 'sms', '+15551234005',
     'Queue update: You are #5 in line for Haunted Mansion. Estimated wait: ~25 mins.',
     NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- QUEUE STATS (hourly aggregates for today)
  -- ============================================================================

  INSERT INTO queue_stats (
    id, org_id, queue_id, date, hour,
    entries_joined, entries_served, entries_expired, entries_left, entries_no_show,
    avg_wait_minutes, max_wait_minutes, max_queue_size, total_party_size
  ) VALUES
    -- Haunted Mansion stats for today
    ('e3000000-0000-0000-0000-000000000001', v_org_id, v_mansion_queue_id, CURRENT_DATE, 18,
     25, 20, 2, 3, 0, 22.5, 35, 45, 85),

    ('e3000000-0000-0000-0000-000000000002', v_org_id, v_mansion_queue_id, CURRENT_DATE, 19,
     35, 28, 3, 2, 2, 28.3, 45, 62, 120),

    ('e3000000-0000-0000-0000-000000000003', v_org_id, v_mansion_queue_id, CURRENT_DATE, 20,
     42, 35, 4, 2, 1, 32.1, 52, 78, 145),

    ('e3000000-0000-0000-0000-000000000004', v_org_id, v_mansion_queue_id, CURRENT_DATE, 21,
     38, 40, 2, 1, 1, 25.8, 40, 55, 130),

    -- Terror Trail stats for today
    ('e3000000-0000-0000-0000-000000000005', v_org_id, v_trail_queue_id, CURRENT_DATE, 18,
     15, 12, 1, 2, 0, 18.2, 28, 25, 52),

    ('e3000000-0000-0000-0000-000000000006', v_org_id, v_trail_queue_id, CURRENT_DATE, 19,
     22, 18, 2, 1, 1, 24.5, 38, 35, 78),

    ('e3000000-0000-0000-0000-000000000007', v_org_id, v_trail_queue_id, CURRENT_DATE, 20,
     28, 25, 1, 2, 0, 22.8, 35, 42, 95),

    ('e3000000-0000-0000-0000-000000000008', v_org_id, v_trail_queue_id, CURRENT_DATE, 21,
     20, 22, 1, 1, 1, 19.5, 30, 30, 72),

    -- Yesterday stats (for comparison)
    ('e3000000-0000-0000-0000-000000000009', v_org_id, v_mansion_queue_id, CURRENT_DATE - INTERVAL '1 day', 18,
     22, 18, 2, 2, 0, 20.1, 32, 40, 75),

    ('e3000000-0000-0000-0000-000000000010', v_org_id, v_mansion_queue_id, CURRENT_DATE - INTERVAL '1 day', 19,
     30, 25, 3, 1, 1, 25.5, 42, 55, 105),

    ('e3000000-0000-0000-0000-000000000011', v_org_id, v_mansion_queue_id, CURRENT_DATE - INTERVAL '1 day', 20,
     38, 32, 3, 2, 1, 28.9, 48, 68, 135),

    ('e3000000-0000-0000-0000-000000000012', v_org_id, v_mansion_queue_id, CURRENT_DATE - INTERVAL '1 day', 21,
     32, 35, 2, 1, 0, 22.3, 38, 50, 115)
  ON CONFLICT (queue_id, date, hour) DO NOTHING;

  RAISE NOTICE 'F11 virtual queue seed data created successfully';
END $$;

-- ============================================================================
-- F11 SEED SUMMARY
-- ============================================================================
-- Queue Configs: 2 (Haunted Mansion, Terror Trail)
-- Queue Entries: 24 (waiting, notified, called, checked_in, expired, left, no_show)
-- Queue Notifications: 7 (joined, almost_ready, ready, expired, reminder)
-- Queue Stats: 12 hourly records (today + yesterday)

-- ============================================================================
-- F14: STOREFRONTS SEED DATA
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID := 'b0000000-0000-0000-0000-000000000001';          -- Nightmare Manor
  v_org2_id UUID := 'b0000000-0000-0000-0000-000000000002';         -- Spooky Hollow
  v_mansion_id UUID := 'c0000000-0000-0000-0000-000000000001';      -- Haunted Mansion
  v_trail_id UUID := 'c0000000-0000-0000-0000-000000000002';        -- Terror Trail
  v_owner_id UUID := 'a0000000-0000-0000-0000-000000000002';        -- owner@haunt.dev
  v_manager_id UUID := 'a0000000-0000-0000-0000-000000000003';      -- manager@haunt.dev
  v_about_page_id UUID := 'f1000000-0000-0000-0000-000000000001';
  v_faq_page_id UUID := 'f1000000-0000-0000-0000-000000000002';
  v_contact_page_id UUID := 'f1000000-0000-0000-0000-000000000003';
  v_rules_page_id UUID := 'f1000000-0000-0000-0000-000000000004';
BEGIN
  -- ============================================================================
  -- STOREFRONT SETTINGS
  -- ============================================================================

  -- Note: Storefronts are now per-attraction, not per-org
  -- Theme presets: dark, light, horror, vintage, neon, blood-moon, forest, carnival
  -- See @atrivio/shared/constants/themes.ts for full preset definitions
  INSERT INTO storefront_settings (
    id, org_id, attraction_id, tagline, description,
    logo_url, favicon_url, hero_image_url, hero_title, hero_subtitle,
    theme_preset, primary_color, secondary_color, accent_color, background_color, text_color,
    font_heading, font_body,
    social_facebook, social_instagram, social_twitter, social_tiktok,
    seo_title, seo_description, seo_keywords,
    show_attractions, show_calendar, show_faq, show_reviews,
    featured_attraction_ids, is_published, published_at
  ) VALUES
    -- The Haunted Mansion storefront (published) - uses 'horror' preset
    (
      'f0000000-0000-0000-0000-000000000001',
      v_org_id,
      v_mansion_id,
      'Where Nightmares Come Alive',
      'The Haunted Mansion is the premier haunted attraction in the region, featuring world-class actors, incredible set designs, and terrifying experiences that will leave you breathless.',
      'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=200',
      'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=32',
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920',
      'Face Your Fears',
      'A terrifying journey through a Victorian mansion.',
      'horror',        -- Horror theme preset
      '#b91c1c',       -- Red-700 (deeper, bloodier)
      '#18181b',       -- Zinc-900
      '#a3e635',       -- Lime-400 (toxic green)
      '#09090b',       -- Zinc-950
      '#e4e4e7',       -- Zinc-200
      'Creepster',     -- Horror heading font
      'Inter',         -- Clean body font
      'https://facebook.com/nightmaremanor',
      'https://instagram.com/nightmaremanor',
      'https://twitter.com/nightmaremanor',
      'https://tiktok.com/@nightmaremanor',
      'The Haunted Mansion - Premier Haunted Attraction',
      'Experience the most terrifying haunted mansion in the region. World-class actors and unforgettable scares await.',
      ARRAY['haunted house', 'haunted attraction', 'halloween', 'scary', 'horror', 'haunted mansion'],
      TRUE,
      TRUE,
      TRUE,
      FALSE,
      NULL,
      TRUE,
      NOW() - INTERVAL '30 days'
    ),
    -- Terror Trail storefront (published) - uses 'forest' preset
    (
      'f0000000-0000-0000-0000-000000000002',
      v_org_id,
      v_trail_id,
      'Into the Dark Woods',
      'Terror Trail is a half-mile outdoor experience through dark woods where creatures lurk behind every tree.',
      NULL,
      NULL,
      NULL,
      'Terror Trail',
      'Not for the faint of heart',
      'forest',        -- Forest theme preset for outdoor trail
      '#15803d',       -- Green-700
      '#1a2e05',       -- Dark forest green
      '#ca8a04',       -- Yellow-600 (lantern light)
      '#0f1a0a',       -- Deep forest
      '#d1fae5',       -- Emerald-100
      'Playfair Display',
      'Inter',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      TRUE,
      TRUE,
      TRUE,
      FALSE,
      NULL,
      TRUE,               -- is_published = TRUE
      NOW() - INTERVAL '15 days'  -- published_at
    ),
    -- Escape the Asylum storefront (draft) - uses 'vintage' preset
    (
      'f0000000-0000-0000-0000-000000000003',
      v_org_id,
      'c0000000-0000-0000-0000-000000000003',  -- escape-asylum attraction
      'Escape Before They Find You',
      'Can you escape the abandoned asylum before the patients find you? A 60-minute immersive escape experience.',
      NULL,
      NULL,
      NULL,
      'Escape the Asylum',
      'Time is running out',
      'vintage',       -- Vintage sepia theme for old asylum
      '#a16207',       -- Yellow-700 (old paper)
      '#1c1917',       -- Stone-900
      '#b91c1c',       -- Red-700 (danger/blood)
      '#1c1917',       -- Stone-900
      '#fef3c7',       -- Amber-100
      'Playfair Display',
      'Inter',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      TRUE,
      TRUE,
      TRUE,
      FALSE,
      NULL,
      FALSE,           -- Draft mode
      NULL
    )
  ON CONFLICT (attraction_id) DO NOTHING;

  -- ============================================================================
  -- STOREFRONT DOMAINS
  -- ============================================================================

  -- Set custom domain limit to 5 (Pro tier) for seed org to allow custom domains
  UPDATE organizations SET custom_domain_limit = 5 WHERE id = v_org_id;

  INSERT INTO storefront_domains (
    id, org_id, attraction_id, domain, domain_type, is_primary,
    verification_token, verification_method, verified_at,
    ssl_status, status
  ) VALUES
    -- Haunted Mansion subdomain (auto-verified)
    (
      'f2000000-0000-0000-0000-000000000001',
      v_org_id,
      v_mansion_id,
      'haunted-mansion.atrivio.io',
      'subdomain',
      TRUE,
      NULL,
      'dns_txt',
      NOW() - INTERVAL '30 days',
      'active',
      'active'
    ),
    -- Haunted Mansion custom domain (example - verified)
    (
      'f2000000-0000-0000-0000-000000000002',
      v_org_id,
      v_mansion_id,
      'hauntedmansion.com',
      'custom',
      FALSE,
      'verify_abc123def456',
      'dns_txt',
      NOW() - INTERVAL '25 days',
      'active',
      'active'
    ),
    -- Terror Trail subdomain (auto-verified)
    (
      'f2000000-0000-0000-0000-000000000003',
      v_org_id,
      v_trail_id,
      'terror-trail.atrivio.io',
      'subdomain',
      TRUE,
      NULL,
      'dns_txt',
      NOW() - INTERVAL '15 days',
      'active',
      'active'
    ),
    -- Escape the Asylum subdomain (auto-verified)
    (
      'f2000000-0000-0000-0000-000000000004',
      v_org_id,
      'c0000000-0000-0000-0000-000000000003',
      'escape-asylum.atrivio.io',
      'subdomain',
      TRUE,
      NULL,
      'dns_txt',
      NOW() - INTERVAL '10 days',
      'active',
      'active'
    )
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- STOREFRONT PAGES
  -- ============================================================================

  INSERT INTO storefront_pages (
    id, org_id, attraction_id, slug, title, content, content_format, page_type,
    seo_title, seo_description,
    show_in_nav, nav_order, icon, status, published_at,
    created_by, updated_by
  ) VALUES
    -- About Page
    (
      v_about_page_id,
      v_org_id,
      v_mansion_id,
      'about',
      'About Nightmare Manor',
      '# Our Story

Nightmare Manor has been terrifying visitors since 2010. What started as a small backyard haunt has grown into the region''s most acclaimed haunted attraction.

## Our Mission

We believe that fear is an art form. Our team of talented actors, designers, and technicians work year-round to create immersive experiences that blur the line between reality and nightmare.

## Awards & Recognition

- **Best Haunted Attraction** - Regional Horror Awards 2023
- **Top 10 Haunts** - HauntWorld Magazine 2022
- **Excellence in Set Design** - Halloween Industry Awards 2021

## The Team

Our cast includes over 50 professional actors, supported by a dedicated crew of makeup artists, sound engineers, and special effects technicians.

![Team Photo](https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800)

## Visit Us

Ready to face your fears? [Get tickets](/tickets) and join us for a night you''ll never forget.',
      'markdown',
      'about',
      'About Us - Nightmare Manor',
      'Learn about Nightmare Manor''s history, awards, and the team behind the scares.',
      TRUE,
      1,
      'info',
      'published',
      NOW() - INTERVAL '28 days',
      v_owner_id,
      v_manager_id
    ),
    -- FAQ Page
    (
      v_faq_page_id,
      v_org_id,
      v_mansion_id,
      'faq',
      'Frequently Asked Questions',
      '# Frequently Asked Questions

Find answers to common questions about visiting Nightmare Manor below. Can''t find what you''re looking for? [Contact us](/contact).',
      'markdown',
      'faq',
      'FAQ - Nightmare Manor',
      'Find answers to frequently asked questions about Nightmare Manor.',
      TRUE,
      2,
      'help-circle',
      'published',
      NOW() - INTERVAL '28 days',
      v_owner_id,
      NULL
    ),
    -- Contact Page
    (
      v_contact_page_id,
      v_org_id,
      v_mansion_id,
      'contact',
      'Contact Us',
      '# Contact Us

We''d love to hear from you! Whether you have questions, feedback, or want to book a private event, we''re here to help.

## General Inquiries

- **Email**: info@nightmaremanor.com
- **Phone**: (555) 123-4567

## Hours of Operation

- **Box Office**: Opens 1 hour before event start
- **Event Hours**: Check our [calendar](/calendar) for specific dates

## Location

123 Spooky Lane
Frightville, CA 90210

[Get Directions](https://maps.google.com)

## Private Events & Group Bookings

Interested in hosting a private event or booking for a large group? Contact our events team:

- **Email**: events@nightmaremanor.com
- **Phone**: (555) 123-4568

## Media & Press

For media inquiries, please contact:

- **Email**: press@nightmaremanor.com',
      'markdown',
      'contact',
      'Contact Us - Nightmare Manor',
      'Get in touch with Nightmare Manor for questions, bookings, or media inquiries.',
      TRUE,
      3,
      'mail',
      'published',
      NOW() - INTERVAL '28 days',
      v_owner_id,
      NULL
    ),
    -- Rules & Policies Page
    (
      v_rules_page_id,
      v_org_id,
      v_mansion_id,
      'rules',
      'Rules & Policies',
      '# Rules & Policies

Please review the following rules and policies before your visit to ensure a safe and enjoyable experience for everyone.

## Safety Rules

1. **No Running** - Walk at all times throughout the attraction
2. **No Touching** - Do not touch actors, props, or set pieces
3. **No Photography** - Cameras, phones, and recording devices are not permitted inside attractions
4. **Stay on the Path** - Follow the designated route at all times
5. **No Re-Entry** - Once you exit, you cannot re-enter

## Age Recommendations

- **Haunted Mansion**: Recommended for ages 13+
- **Terror Trail**: Recommended for ages 16+

*Parental discretion advised. Children under 13 must be accompanied by an adult.*

## Health Warnings

Our attractions contain:
- Strobe lights and fog effects
- Loud sounds and sudden scares
- Confined spaces and uneven terrain
- Actors in frightening costumes

*Not recommended for individuals with heart conditions, epilepsy, respiratory issues, or those who are pregnant.*

## Refund Policy

- Tickets are non-refundable but may be transferred
- In case of inclement weather, tickets will be valid for any remaining date in the season
- VIP upgrades are non-refundable

## Questions?

If you have any questions about our policies, please [contact us](/contact).',
      'markdown',
      'policies',
      'Rules & Policies - Nightmare Manor',
      'Review safety rules, age recommendations, and policies for visiting Nightmare Manor.',
      TRUE,
      4,
      'shield',
      'published',
      NOW() - INTERVAL '28 days',
      v_owner_id,
      NULL
    ),
    -- Gallery Page (draft)
    (
      'f1000000-0000-0000-0000-000000000005',
      v_org_id,
      v_mansion_id,
      'gallery',
      'Photo Gallery',
      '# Photo Gallery

Coming soon! Check back for photos from this season.',
      'markdown',
      'custom',
      'Photo Gallery - Nightmare Manor',
      'View photos from Nightmare Manor.',
      FALSE,
      5,
      'image',
      'draft',
      NULL,
      v_manager_id,
      NULL
    ),
    -- Jobs Page
    (
      'f1000000-0000-0000-0000-000000000006',
      v_org_id,
      v_mansion_id,
      'jobs',
      'Join Our Team',
      '# Join the Nightmare Manor Team

Are you passionate about horror and entertainment? We''re always looking for talented individuals to join our crew!

## Open Positions

### Scare Actors
- No experience necessary - we provide training
- Must be 16+ years old
- Available weekends September through November

### Makeup Artists
- Experience with theatrical or SFX makeup preferred
- Portfolio review required
- Part-time and full-time positions available

### Technical Crew
- Sound, lighting, and special effects positions
- Experience with live entertainment preferred

## How to Apply

Send your resume and a brief introduction to jobs@nightmaremanor.com

Or apply in person at our hiring events (dates TBA).',
      'markdown',
      'custom',
      'Careers - Join the Nightmare Manor Team',
      'Apply to work at Nightmare Manor. Scare actors, makeup artists, and technical crew positions available.',
      TRUE,
      6,
      'users',
      'published',
      NOW() - INTERVAL '20 days',
      v_owner_id,
      NULL
    )
  ON CONFLICT (attraction_id, slug) DO NOTHING;

  -- ============================================================================
  -- STOREFRONT NAVIGATION
  -- ============================================================================

  INSERT INTO storefront_navigation (
    id, org_id, label, link_type, page_id, external_url, attraction_id,
    position, sort_order, is_visible, open_in_new_tab
  ) VALUES
    -- Header Navigation
    ('f3000000-0000-0000-0000-000000000001', v_org_id, 'Home', 'home', NULL, NULL, v_mansion_id, 'header', 0, TRUE, FALSE),
    ('f3000000-0000-0000-0000-000000000002', v_org_id, 'Attractions', 'tickets', NULL, NULL, v_mansion_id, 'header', 1, TRUE, FALSE),
    ('f3000000-0000-0000-0000-000000000003', v_org_id, 'About', 'page', v_about_page_id, NULL, v_mansion_id, 'header', 2, TRUE, FALSE),
    ('f3000000-0000-0000-0000-000000000004', v_org_id, 'FAQ', 'faq', NULL, NULL, v_mansion_id, 'header', 3, TRUE, FALSE),
    ('f3000000-0000-0000-0000-000000000005', v_org_id, 'Buy Tickets', 'tickets', NULL, NULL, v_mansion_id, 'header', 4, TRUE, FALSE),

    -- Footer Navigation
    ('f3000000-0000-0000-0000-000000000006', v_org_id, 'Contact', 'page', v_contact_page_id, NULL, v_mansion_id, 'footer', 0, TRUE, FALSE),
    ('f3000000-0000-0000-0000-000000000007', v_org_id, 'Rules & Policies', 'page', v_rules_page_id, NULL, v_mansion_id, 'footer', 1, TRUE, FALSE),
    ('f3000000-0000-0000-0000-000000000008', v_org_id, 'Careers', 'page', 'f1000000-0000-0000-0000-000000000006', NULL, v_mansion_id, 'footer', 2, TRUE, FALSE),
    ('f3000000-0000-0000-0000-000000000009', v_org_id, 'Instagram', 'external', NULL, 'https://instagram.com/nightmaremanor', v_mansion_id, 'footer', 3, TRUE, TRUE),
    ('f3000000-0000-0000-0000-000000000010', v_org_id, 'Facebook', 'external', NULL, 'https://facebook.com/nightmaremanor', v_mansion_id, 'footer', 4, TRUE, TRUE)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- STOREFRONT FAQS
  -- ============================================================================

  INSERT INTO storefront_faqs (
    id, org_id, attraction_id, question, answer, category, sort_order, is_published
  ) VALUES
    -- General FAQs (for Haunted Mansion storefront)
    ('f4000000-0000-0000-0000-000000000001', v_org_id, v_mansion_id,
     'What are your hours of operation?',
     'We are open select nights from late September through early November. Box office opens 1 hour before the attraction. Check our calendar for specific dates and times.',
     'General', 1, TRUE),

    ('f4000000-0000-0000-0000-000000000002', v_org_id, v_mansion_id,
     'How long does the experience last?',
     'The Haunted Mansion takes approximately 20-25 minutes. Terror Trail takes about 15-20 minutes. Total visit time including wait is typically 1-2 hours depending on crowds.',
     'General', 2, TRUE),

    ('f4000000-0000-0000-0000-000000000003', v_org_id, v_mansion_id,
     'Is Nightmare Manor appropriate for children?',
     'We recommend ages 13+ for the Haunted Mansion and 16+ for Terror Trail. Children under 13 must be accompanied by an adult. Parental discretion is strongly advised.',
     'General', 3, TRUE),

    ('f4000000-0000-0000-0000-000000000004', v_org_id, v_mansion_id,
     'Do you have a "lights on" or less scary option?',
     'We do not offer a lights-on tour or reduced scare option. The full experience is designed to be intense and scary.',
     'General', 4, TRUE),

    -- Tickets & Pricing FAQs
    ('f4000000-0000-0000-0000-000000000005', v_org_id, v_mansion_id,
     'Can I buy tickets at the door?',
     'Yes, tickets are available at the box office if not sold out. However, we strongly recommend purchasing online in advance as we frequently sell out, especially on weekends.',
     'Tickets', 5, TRUE),

    ('f4000000-0000-0000-0000-000000000006', v_org_id, v_mansion_id,
     'What is VIP/Fast Pass?',
     'VIP tickets allow you to skip the general admission line and enter through a priority queue. This can save significant wait time on busy nights.',
     'Tickets', 6, TRUE),

    ('f4000000-0000-0000-0000-000000000007', v_org_id, v_mansion_id,
     'What is your refund policy?',
     'Tickets are non-refundable but may be transferred to another person. In case of weather cancellation, tickets are valid for any remaining date in the season.',
     'Tickets', 7, TRUE),

    -- Safety FAQs
    ('f4000000-0000-0000-0000-000000000008', v_org_id, v_mansion_id,
     'Are there strobe lights or fog effects?',
     'Yes, our attractions use strobe lights, fog machines, loud sounds, and other special effects. These may not be suitable for individuals with epilepsy, heart conditions, or respiratory issues.',
     'Safety', 8, TRUE),

    ('f4000000-0000-0000-0000-000000000009', v_org_id, v_mansion_id,
     'Is the attraction wheelchair accessible?',
     'The Haunted Mansion has limited accessibility due to stairs and narrow passages. Terror Trail is an outdoor path with uneven terrain. Please contact us in advance to discuss accommodations.',
     'Safety', 9, TRUE),

    ('f4000000-0000-0000-0000-000000000010', v_org_id, v_mansion_id,
     'Will actors touch me?',
     'Our actors will NOT touch guests. However, they may get very close, block your path momentarily, and use props near you. If you need space, simply say "I need space" and actors will back away.',
     'Safety', 10, TRUE),

    -- Attraction-Specific FAQs
    ('f4000000-0000-0000-0000-000000000011', v_org_id, v_mansion_id,
     'What is the Haunted Mansion?',
     'The Haunted Mansion is our flagship indoor attraction featuring multiple themed rooms, live actors, and state-of-the-art special effects. Navigate through the cursed Victorian manor and face the spirits within.',
     'Attractions', 11, TRUE),

    ('f4000000-0000-0000-0000-000000000012', v_org_id, v_trail_id,
     'What is Terror Trail?',
     'Terror Trail is our outdoor haunted trail experience. Wind through the dark forest, encounter creatures lurking in the shadows, and try to escape before they catch you.',
     'Attractions', 12, TRUE),

    -- Parking & Location FAQs
    ('f4000000-0000-0000-0000-000000000013', v_org_id, v_mansion_id,
     'Is parking free?',
     'Yes! Free parking is available on-site. Follow the signs from the main entrance. During peak nights, additional overflow parking is available.',
     'Location', 13, TRUE),

    ('f4000000-0000-0000-0000-000000000014', v_org_id, v_mansion_id,
     'What should I wear?',
     'Wear comfortable, closed-toe shoes suitable for walking. Terror Trail has uneven terrain. Costumes are welcome but masks may need to be removed for identification.',
     'General', 14, TRUE),

    ('f4000000-0000-0000-0000-000000000015', v_org_id, v_mansion_id,
     'Can I take photos or videos?',
     'Photography and recording are NOT permitted inside the attractions for safety reasons and to preserve the experience for others. Photo opportunities are available outside.',
     'General', 15, TRUE)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- STOREFRONT ANNOUNCEMENTS
  -- ============================================================================

  INSERT INTO storefront_announcements (
    id, org_id, attraction_id, title, content, link_url, link_text,
    type, position, is_dismissible,
    starts_at, ends_at, is_active, created_by
  ) VALUES
    -- Active banner announcement
    (
      'f5000000-0000-0000-0000-000000000001',
      v_org_id,
      v_mansion_id,
      'Opening Night October 1st!',
      'The season kicks off with our biggest opening night ever. Special performances, giveaways, and surprises await!',
      '/tickets',
      'Get Tickets',
      'promo',
      'banner',
      TRUE,
      NOW() - INTERVAL '5 days',
      NOW() + INTERVAL '30 days',
      TRUE,
      v_owner_id
    ),
    -- VIP upgrade popup
    (
      'f5000000-0000-0000-0000-000000000002',
      v_org_id,
      v_mansion_id,
      'Skip the Line with VIP!',
      'Upgrade to VIP and enjoy priority entry on even the busiest nights.',
      '/tickets?upgrade=vip',
      'Learn More',
      'info',
      'popup',
      TRUE,
      NOW() - INTERVAL '10 days',
      NOW() + INTERVAL '60 days',
      TRUE,
      v_manager_id
    ),
    -- Weather warning (inactive - example)
    (
      'f5000000-0000-0000-0000-000000000003',
      v_org_id,
      v_mansion_id,
      'Weather Advisory',
      'Tonight''s event may be affected by weather. Check your email for updates.',
      NULL,
      NULL,
      'warning',
      'banner',
      FALSE,
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '1 day',
      FALSE,
      v_owner_id
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'F14 storefront seed data created successfully';
END $$;

-- ============================================================================
-- F14 SEED SUMMARY
-- ============================================================================
-- Storefront Settings: 2 (Nightmare Manor - published, Spooky Hollow - draft)
-- Storefront Domains: 3 (2 for Nightmare Manor, 1 for Spooky Hollow)
-- Storefront Pages: 6 (About, FAQ, Contact, Rules, Gallery draft, Jobs)
-- Storefront Navigation: 10 (5 header, 5 footer)
-- Storefront FAQs: 15 (General, Tickets, Safety, Attractions, Location categories)
-- Storefront Announcements: 3 (2 active, 1 inactive)

-- ============================================================================
-- SUBSCRIPTION TIER DEMO DATA
-- ============================================================================
-- Set subscription tiers for demo organizations and create tier-specific test accounts

-- Set subscription tiers for each demo organization
UPDATE public.organizations SET subscription_tier = 'pro'
WHERE id = 'b0000000-0000-0000-0000-000000000001'; -- Nightmare Manor

UPDATE public.organizations SET subscription_tier = 'free'
WHERE id = 'b0000000-0000-0000-0000-000000000002'; -- Spooky Hollow

UPDATE public.organizations SET subscription_tier = 'enterprise'
WHERE id = 'b0000000-0000-0000-0000-000000000003'; -- Terror Collective

UPDATE public.organizations SET subscription_tier = 'free'
WHERE id = 'b0000000-0000-0000-0000-000000000004'; -- Newhouse Haunts (onboarding)

-- Create tier-specific demo users for easy testing
-- These are easier to remember than the existing role-based emails

-- Free tier demo account
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES (
  'a0000000-0000-0000-0000-000000000f01',
  '00000000-0000-0000-0000-000000000000',
  'free@haunt.dev',
  crypt('password123', gen_salt('bf')),
  NOW(), '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Free", "last_name": "Demo"}',
  NOW(), NOW(), 'authenticated', 'authenticated',
  '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
) ON CONFLICT (id) DO NOTHING;

-- Pro tier demo account
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES (
  'a0000000-0000-0000-0000-000000000f02',
  '00000000-0000-0000-0000-000000000000',
  'pro@haunt.dev',
  crypt('password123', gen_salt('bf')),
  NOW(), '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Pro", "last_name": "Demo"}',
  NOW(), NOW(), 'authenticated', 'authenticated',
  '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
) ON CONFLICT (id) DO NOTHING;

-- Enterprise tier demo account
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  role, aud, confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, reauthentication_token,
  phone, phone_change, phone_change_token, is_sso_user, is_anonymous
) VALUES (
  'a0000000-0000-0000-0000-000000000f03',
  '00000000-0000-0000-0000-000000000000',
  'enterprise@haunt.dev',
  crypt('password123', gen_salt('bf')),
  NOW(), '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Enterprise", "last_name": "Demo"}',
  NOW(), NOW(), 'authenticated', 'authenticated',
  '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
) ON CONFLICT (id) DO NOTHING;

-- Create org memberships for tier demo accounts
-- Free tier user -> Spooky Hollow (free org)
INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES (
  'd0000000-0000-0000-0000-000000000f01',
  'b0000000-0000-0000-0000-000000000002',  -- Spooky Hollow (free)
  'a0000000-0000-0000-0000-000000000f01',
  'owner', TRUE, 'active', NOW()
) ON CONFLICT (org_id, user_id) DO NOTHING;

-- Pro tier user -> Nightmare Manor (pro org)
INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES (
  'd0000000-0000-0000-0000-000000000f02',
  'b0000000-0000-0000-0000-000000000001',  -- Nightmare Manor (pro)
  'a0000000-0000-0000-0000-000000000f02',
  'owner', TRUE, 'active', NOW()
) ON CONFLICT (org_id, user_id) DO NOTHING;

-- Enterprise tier user -> Terror Collective (enterprise org)
INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES (
  'd0000000-0000-0000-0000-000000000f03',
  'b0000000-0000-0000-0000-000000000003',  -- Terror Collective (enterprise)
  'a0000000-0000-0000-0000-000000000f03',
  'owner', TRUE, 'active', NOW()
) ON CONFLICT (org_id, user_id) DO NOTHING;

-- ============================================================================
-- SUBSCRIPTION TIER DEMO SUMMARY
-- ============================================================================
-- Organizations:
--   - Nightmare Manor: Pro tier
--   - Spooky Hollow: Free tier
--   - Terror Collective: Enterprise tier
--   - Newhouse Haunts: Free tier (onboarding)
--
-- Demo Accounts (all use password: password123):
--   - free@haunt.dev -> Spooky Hollow (Free tier)
--   - pro@haunt.dev -> Nightmare Manor (Pro tier)
--   - enterprise@haunt.dev -> Terror Collective (Enterprise tier)
