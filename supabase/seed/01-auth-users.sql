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
