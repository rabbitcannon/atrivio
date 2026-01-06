-- ============================================================================
-- COMPREHENSIVE TEST DATA FOR F1-F4
-- Password for all test users: "password123"
-- ============================================================================
-- Uses pgcrypto's crypt() function to properly hash passwords at seed time

-- ============================================================================
-- F1: AUTH USERS & PROFILES
-- ============================================================================

-- Create test users in auth.users
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
  -- Org Owner
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
  -- Org Manager
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
  -- Staff members (actors, etc.)
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
  (
    'a0000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'boxoffice@haunt.dev',
    crypt('password123', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Lisa", "last_name": "Park"}',
    NOW(), NOW(), 'authenticated', 'authenticated',
    '', '', '', '', '', '', NULL, '', '', FALSE, FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- Create identities for the users (required for Supabase Auth)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   '{"sub": "a0000000-0000-0000-0000-000000000001", "email": "admin@haunt.dev"}', 'email', 'admin@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
   '{"sub": "a0000000-0000-0000-0000-000000000002", "email": "owner@haunt.dev"}', 'email', 'owner@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
   '{"sub": "a0000000-0000-0000-0000-000000000003", "email": "manager@haunt.dev"}', 'email', 'manager@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
   '{"sub": "a0000000-0000-0000-0000-000000000004", "email": "actor1@haunt.dev"}', 'email', 'actor1@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005',
   '{"sub": "a0000000-0000-0000-0000-000000000005", "email": "actor2@haunt.dev"}', 'email', 'actor2@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006',
   '{"sub": "a0000000-0000-0000-0000-000000000006", "email": "actor3@haunt.dev"}', 'email', 'actor3@haunt.dev', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007',
   '{"sub": "a0000000-0000-0000-0000-000000000007", "email": "boxoffice@haunt.dev"}', 'email', 'boxoffice@haunt.dev', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create profiles for the test users
INSERT INTO public.profiles (id, email, first_name, last_name, display_name, phone, is_super_admin)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@haunt.dev', 'Super', 'Admin', 'Super Admin', NULL, TRUE),
  ('a0000000-0000-0000-0000-000000000002', 'owner@haunt.dev', 'Marcus', 'Holloway', 'Marcus Holloway', '555-0100', FALSE),
  ('a0000000-0000-0000-0000-000000000003', 'manager@haunt.dev', 'Sarah', 'Chen', 'Sarah Chen', '555-0101', FALSE),
  ('a0000000-0000-0000-0000-000000000004', 'actor1@haunt.dev', 'Jake', 'Morrison', 'Jake Morrison', '555-0102', FALSE),
  ('a0000000-0000-0000-0000-000000000005', 'actor2@haunt.dev', 'Emily', 'Rodriguez', 'Emily Rodriguez', '555-0103', FALSE),
  ('a0000000-0000-0000-0000-000000000006', 'actor3@haunt.dev', 'Mike', 'Thompson', 'Mike Thompson', '555-0104', FALSE),
  ('a0000000-0000-0000-0000-000000000007', 'boxoffice@haunt.dev', 'Lisa', 'Park', 'Lisa Park', '555-0105', FALSE)
ON CONFLICT (id) DO UPDATE SET
  is_super_admin = EXCLUDED.is_super_admin,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name;

-- ============================================================================
-- F2: ORGANIZATIONS
-- ============================================================================

INSERT INTO public.organizations (id, name, slug, email, phone, website, address_line1, city, state, postal_code, status)
VALUES
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
  )
ON CONFLICT (id) DO NOTHING;

-- Add members to the organization
INSERT INTO public.org_memberships (id, org_id, user_id, role, is_owner, status, accepted_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'owner', TRUE, 'active', NOW()),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'manager', FALSE, 'active', NOW()),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'actor', FALSE, 'active', NOW()),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'actor', FALSE, 'active', NOW()),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'actor', FALSE, 'active', NOW()),
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'box_office', FALSE, 'active', NOW())
ON CONFLICT (org_id, user_id) DO NOTHING;

-- ============================================================================
-- F3: ATTRACTIONS
-- ============================================================================

-- Create attractions
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

-- Create zones for The Haunted Mansion
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

-- Create zones for Terror Trail
INSERT INTO public.zones (id, attraction_id, name, description, capacity, sort_order, color)
VALUES
  ('e0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'Trail Entrance', 'The point of no return', 10, 1, '#14532D'),
  ('e0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000002', 'Dead Woods', 'Where the trees have eyes', 8, 2, '#166534'),
  ('e0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', 'Clown Alley', 'Abandoned circus camp', 12, 3, '#15803D'),
  ('e0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 'The Swamp', 'Something lurks beneath', 6, 4, '#16A34A'),
  ('e0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'Final Stretch', 'Sprint to safety... if you can', 10, 5, '#22C55E')
ON CONFLICT (id) DO NOTHING;

-- Create seasons
INSERT INTO public.seasons (id, attraction_id, name, year, start_date, end_date, status)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Halloween Season', 2024, '2024-09-27', '2024-11-02', 'completed'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Halloween Season', 2025, '2025-09-26', '2025-11-01', 'upcoming'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Halloween Season', 2024, '2024-10-01', '2024-10-31', 'completed'),
  ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Halloween Season', 2025, '2025-10-01', '2025-10-31', 'upcoming')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- F4: STAFF PROFILES & ASSIGNMENTS
-- ============================================================================

-- Create staff profiles (linked to org_memberships)
INSERT INTO public.staff_profiles (id, org_id, employee_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, hire_date, hourly_rate, employment_type, status, shirt_size)
VALUES
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'NM-MGR-001', 'David Chen', '555-0201', 'spouse', '2022-08-15', 2500, 'full_time', 'active', 'M'),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'NM-ACT-001', 'Mary Morrison', '555-0202', 'mother', '2023-09-01', 1800, 'seasonal', 'active', 'L'),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'NM-ACT-002', 'Carlos Rodriguez', '555-0203', 'father', '2023-09-01', 1800, 'seasonal', 'active', 'S'),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'NM-ACT-003', 'Susan Thompson', '555-0204', 'mother', '2024-09-15', 1600, 'seasonal', 'active', 'XL'),
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'NM-BOX-001', 'James Park', '555-0205', 'spouse', '2023-08-01', 1500, 'part_time', 'active', 'M')
ON CONFLICT (id) DO NOTHING;

-- Assign staff to attractions
INSERT INTO public.staff_attraction_assignments (id, staff_id, attraction_id, is_primary)
VALUES
  ('cc000000-0000-0000-0001-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', TRUE),
  ('cc000000-0000-0000-0001-000000000002', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', FALSE),
  ('cc000000-0000-0000-0001-000000000003', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', TRUE),
  ('cc000000-0000-0000-0001-000000000004', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', TRUE),
  ('cc000000-0000-0000-0001-000000000005', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', TRUE),
  ('cc000000-0000-0000-0001-000000000006', 'd0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Assign skills to staff
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

-- Add certifications
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

-- Add some time entries for recent activity
INSERT INTO public.staff_time_entries (id, staff_id, org_id, attraction_id, clock_in, clock_out, break_minutes, status)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days' + INTERVAL '18 hours', NOW() - INTERVAL '2 days' + INTERVAL '23 hours', 30, 'approved'),
  ('aa000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days' + INTERVAL '18 hours', NOW() - INTERVAL '2 days' + INTERVAL '23 hours', 30, 'approved'),
  ('aa000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day' + INTERVAL '18 hours', NOW() - INTERVAL '1 day' + INTERVAL '23 hours', 30, 'pending'),
  ('aa000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day' + INTERVAL '19 hours', NOW() - INTERVAL '1 day' + INTERVAL '24 hours', 15, 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- F5: PLATFORM ADMIN DATA
-- ============================================================================

-- Feature flags with various states (using valid hex UUIDs: 1f = feature flags)
-- Tier mapping: basic (included), pro (upgrade), enterprise (premium)
INSERT INTO public.feature_flags (id, key, name, description, enabled, rollout_percentage, org_ids, user_ids, metadata)
VALUES
  -- Legacy/experimental flags
  ('1f000000-0000-0000-0000-000000000001', 'virtual_queue_v2', 'Virtual Queue V2', 'New virtual queue system with SMS notifications and improved UX', FALSE, 25, '{}', '{}', '{"release_date": "2025-Q1", "ticket": "HAUNT-1234"}'),
  ('1f000000-0000-0000-0000-000000000002', 'new_checkout_flow', 'Streamlined Checkout', 'One-page checkout experience with Apple Pay support', TRUE, 0, '{}', '{}', '{"a_b_test": true}'),
  ('1f000000-0000-0000-0000-000000000003', 'staff_mobile_app', 'Staff Mobile App', 'Mobile app for staff to clock in/out and view schedules', FALSE, 0, ARRAY['b0000000-0000-0000-0000-000000000001']::UUID[], '{}', '{"beta_org": true}'),
  ('1f000000-0000-0000-0000-000000000004', 'advanced_analytics', 'Advanced Analytics Dashboard', 'Enhanced analytics with real-time metrics and forecasting', FALSE, 50, '{}', '{}', '{"premium_feature": true}'),
  ('1f000000-0000-0000-0000-000000000005', 'ai_scheduling', 'AI-Powered Scheduling', 'Machine learning powered staff scheduling optimization', FALSE, 0, '{}', ARRAY['a0000000-0000-0000-0000-000000000002']::UUID[], '{"experimental": true}'),

  -- Module flags (F7-F14)
  -- Basic tier: ticketing, checkin, time_tracking (always on for all orgs)
  -- NOTE: 'notifications' flag is created by F12 migration, not here
  ('1f000000-0000-0000-0000-000000000006', 'ticketing', 'Ticketing Module', 'Core ticketing functionality including ticket types, orders, and promo codes (F8)', TRUE, 100, '{}', '{}', '{"tier": "basic", "feature": "F8", "module": true}'),
  ('1f000000-0000-0000-0000-000000000007', 'checkin', 'Check-In Module', 'Guest check-in with barcode scanning, capacity tracking, and waivers (F9)', TRUE, 100, '{}', '{}', '{"tier": "basic", "feature": "F9", "module": true}'),
  ('1f000000-0000-0000-0000-00000000000e', 'time_tracking', 'Time Tracking Module', 'Staff time clock with clock in/out, time entries, and approval workflows (F7a)', TRUE, 100, '{}', '{}', '{"tier": "basic", "feature": "F7a", "module": true}'),
  -- NOTE: 'storefronts' flag is created by F14 migration with ON CONFLICT handling

  -- Pro tier: scheduling, inventory, analytics_pro
  ('1f000000-0000-0000-0000-000000000008', 'scheduling', 'Scheduling Module', 'Staff scheduling with availability, shift templates, and swap requests (F7)', TRUE, 100, '{}', '{}', '{"tier": "pro", "feature": "F7", "module": true}'),
  ('1f000000-0000-0000-0000-000000000009', 'inventory', 'Inventory Module', 'Inventory tracking with categories, checkouts, and low stock alerts (F10)', TRUE, 100, '{}', '{}', '{"tier": "pro", "feature": "F10", "module": true}'),
  ('1f000000-0000-0000-0000-00000000000a', 'analytics_pro', 'Analytics Pro', 'Advanced analytics with custom reports, exports, and forecasting (F13)', FALSE, 0, '{}', '{}', '{"tier": "pro", "feature": "F13", "module": true}'),

  -- Enterprise tier: virtual_queue, sms_notifications, custom_domains
  -- Enable virtual_queue for Nightmare Manor (test org) to support E2E tests and demos
  -- NOTE: ID 00c is used by 'notifications' in F12 migration
  ('1f000000-0000-0000-0000-00000000000b', 'virtual_queue', 'Virtual Queue', 'Real-time virtual queue with position tracking and notifications (F11)', FALSE, 0, ARRAY['b0000000-0000-0000-0000-000000000001']::UUID[], '{}', '{"tier": "enterprise", "feature": "F11", "module": true}'),
  ('1f000000-0000-0000-0000-000000000010', 'sms_notifications', 'SMS Notifications', 'SMS delivery for queue alerts, shift reminders, and guest communications (F11/F12)', FALSE, 0, '{}', '{}', '{"tier": "enterprise", "feature": "F11,F12", "has_usage_cost": true}'),
  ('1f000000-0000-0000-0000-00000000000d', 'custom_domains', 'Custom Domains', 'Custom domain support for public storefronts with SSL provisioning (F14)', FALSE, 0, '{}', '{}', '{"tier": "enterprise", "feature": "F14", "has_infra_cost": true}')
ON CONFLICT (id) DO NOTHING;

-- Platform announcements (using valid hex UUIDs: 2a = announcements)
INSERT INTO public.platform_announcements (id, title, content, type, target_roles, starts_at, expires_at, is_dismissible, created_by)
VALUES
  ('2a000000-0000-0000-0000-000000000001', 'Welcome to Haunt Platform!', 'Thank you for joining the Haunt Platform. We''re excited to help you manage your attractions more effectively. Check out our getting started guide in the documentation.', 'feature', '{}', NOW() - INTERVAL '7 days', NULL, TRUE, 'a0000000-0000-0000-0000-000000000001'),
  ('2a000000-0000-0000-0000-000000000002', 'New Feature: Real-time Analytics', 'We''ve launched real-time analytics for all attractions! Visit your dashboard to see live visitor counts, wait times, and more.', 'feature', ARRAY['owner', 'admin', 'manager']::org_role[], NOW() - INTERVAL '3 days', NOW() + INTERVAL '14 days', TRUE, 'a0000000-0000-0000-0000-000000000001'),
  ('2a000000-0000-0000-0000-000000000003', 'Scheduled Maintenance', 'We will be performing scheduled maintenance on January 15th from 2:00 AM - 4:00 AM EST. The platform may be unavailable during this time.', 'maintenance', '{}', NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days', FALSE, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Audit logs showing recent platform activity (using valid hex UUIDs: 3b = audit logs)
INSERT INTO public.audit_logs (id, actor_id, actor_type, action, resource_type, resource_id, org_id, changes, metadata, ip_address, created_at)
VALUES
  -- User management actions
  ('3b000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'user', 'user.create', 'user', 'a0000000-0000-0000-0000-000000000002', NULL, '{"email": "owner@haunt.dev"}', '{}', '192.168.1.1', NOW() - INTERVAL '30 days'),
  ('3b000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'user', 'org.create', 'organization', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"name": "Nightmare Manor", "slug": "nightmare-manor"}', '{}', '192.168.1.2', NOW() - INTERVAL '29 days'),
  ('3b000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'user', 'attraction.create', 'attraction', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"name": "The Haunted Mansion"}', '{}', '192.168.1.2', NOW() - INTERVAL '28 days'),
  ('3b000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'user', 'attraction.create', 'attraction', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '{"name": "Terror Trail"}', '{}', '192.168.1.2', NOW() - INTERVAL '28 days'),
  ('3b000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'user', 'member.invite', 'org_membership', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '{"email": "manager@haunt.dev", "role": "manager"}', '{}', '192.168.1.2', NOW() - INTERVAL '27 days'),
  ('3b000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'user', 'invitation.accept', 'org_membership', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '{}', '{}', '192.168.1.3', NOW() - INTERVAL '26 days'),

  -- Staff management
  ('3b000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'user', 'staff.create', 'staff_profile', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '{"employee_id": "NM-ACT-001", "name": "Jake Morrison"}', '{}', '192.168.1.3', NOW() - INTERVAL '20 days'),
  ('3b000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'user', 'staff.create', 'staff_profile', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', '{"employee_id": "NM-ACT-002", "name": "Emily Rodriguez"}', '{}', '192.168.1.3', NOW() - INTERVAL '20 days'),
  ('3b000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'user', 'staff.skill_add', 'staff_skill', 'dd000000-0000-0000-0001-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"skill": "acting", "level": 5}', '{}', '192.168.1.3', NOW() - INTERVAL '19 days'),
  ('3b000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000003', 'user', 'staff.certification_add', 'staff_certification', 'ee000000-0000-0000-0001-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"cert": "first_aid"}', '{}', '192.168.1.3', NOW() - INTERVAL '18 days'),

  -- Attraction updates
  ('3b000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-000000000002', 'user', 'attraction.update', 'attraction', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"status": {"from": "draft", "to": "active"}}', '{}', '192.168.1.2', NOW() - INTERVAL '15 days'),
  ('3b000000-0000-0000-0000-00000000000c', 'a0000000-0000-0000-0000-000000000002', 'user', 'attraction.update', 'attraction', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '{"status": {"from": "draft", "to": "active"}}', '{}', '192.168.1.2', NOW() - INTERVAL '15 days'),
  ('3b000000-0000-0000-0000-00000000000d', 'a0000000-0000-0000-0000-000000000003', 'user', 'zone.create', 'zone', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"name": "Entry Hall"}', '{}', '192.168.1.3', NOW() - INTERVAL '14 days'),
  ('3b000000-0000-0000-0000-00000000000e', 'a0000000-0000-0000-0000-000000000003', 'user', 'season.create', 'season', 'f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '{"name": "Halloween Season 2025", "year": 2025}', '{}', '192.168.1.3', NOW() - INTERVAL '10 days'),

  -- Recent activity (last 7 days)
  ('3b000000-0000-0000-0000-00000000000f', 'a0000000-0000-0000-0000-000000000004', 'user', 'time.clock_in', 'time_entry', 'aa000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{}', '{}', '192.168.1.4', NOW() - INTERVAL '5 days'),
  ('3b000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', 'user', 'time.clock_out', 'time_entry', 'aa000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{}', '{}', '192.168.1.4', NOW() - INTERVAL '5 days'),
  ('3b000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003', 'user', 'time.approve', 'time_entry', 'aa000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"status": {"from": "pending", "to": "approved"}}', '{}', '192.168.1.3', NOW() - INTERVAL '4 days'),
  ('3b000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'user', 'org.settings_update', 'organization', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '{"settings": {"notifications": true}}', '{}', '192.168.1.2', NOW() - INTERVAL '3 days'),
  ('3b000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'user', 'flag.update', 'feature_flag', '1f000000-0000-0000-0000-000000000002', NULL, '{"enabled": {"from": false, "to": true}}', '{}', '10.0.0.1', NOW() - INTERVAL '2 days'),
  ('3b000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'user', 'announcement.create', 'announcement', '2a000000-0000-0000-0000-000000000003', NULL, '{"title": "Scheduled Maintenance"}', '{}', '10.0.0.1', NOW() - INTERVAL '1 day'),

  -- System events
  ('3b000000-0000-0000-0000-000000000015', NULL, 'system', 'system.backup_complete', 'system', NULL, NULL, '{"size_mb": 256, "duration_seconds": 45}', '{}', NULL, NOW() - INTERVAL '12 hours'),
  ('3b000000-0000-0000-0000-000000000016', NULL, 'system', 'system.cleanup_job', 'system', NULL, NULL, '{"expired_sessions": 150, "old_logs": 1024}', '{}', NULL, NOW() - INTERVAL '6 hours'),
  ('3b000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000002', 'user', 'auth.login', 'user', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '{}', '{"user_agent": "Mozilla/5.0"}', '192.168.1.2', NOW() - INTERVAL '2 hours'),
  ('3b000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000003', 'user', 'auth.login', 'user', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '{}', '{"user_agent": "Mozilla/5.0"}', '192.168.1.3', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- System health logs for demo
INSERT INTO public.system_health_logs (id, service, status, latency_ms, metadata, checked_at)
VALUES
  ('5a000000-0000-0000-0000-000000000001', 'api', 'healthy', 12, '{"requests_per_minute": 450}', NOW() - INTERVAL '1 hour'),
  ('5a000000-0000-0000-0000-000000000002', 'database', 'healthy', 5, '{"connections": 25, "max_connections": 100}', NOW() - INTERVAL '1 hour'),
  ('5a000000-0000-0000-0000-000000000003', 'redis', 'healthy', 2, '{"memory_used_mb": 128}', NOW() - INTERVAL '1 hour'),
  ('5a000000-0000-0000-0000-000000000004', 'stripe', 'healthy', 150, '{}', NOW() - INTERVAL '1 hour'),
  ('5a000000-0000-0000-0000-000000000005', 'supabase_auth', 'healthy', 45, '{}', NOW() - INTERVAL '1 hour'),
  ('5a000000-0000-0000-0000-000000000006', 'supabase_storage', 'healthy', 35, '{}', NOW() - INTERVAL '1 hour'),
  ('5a000000-0000-0000-0000-000000000007', 'api', 'healthy', 15, '{"requests_per_minute": 420}', NOW() - INTERVAL '30 minutes'),
  ('5a000000-0000-0000-0000-000000000008', 'database', 'healthy', 4, '{"connections": 22, "max_connections": 100}', NOW() - INTERVAL '30 minutes'),
  ('5a000000-0000-0000-0000-000000000009', 'api', 'healthy', 10, '{"requests_per_minute": 480}', NOW()),
  ('5a000000-0000-0000-0000-00000000000a', 'database', 'healthy', 6, '{"connections": 28, "max_connections": 100}', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Test Accounts (password: password123):
--   admin@haunt.dev     - Super Admin (platform level)
--   owner@haunt.dev     - Org Owner (Nightmare Manor)
--   manager@haunt.dev   - Manager (Nightmare Manor)
--   actor1@haunt.dev    - Actor - Jake Morrison
--   actor2@haunt.dev    - Actor - Emily Rodriguez
--   actor3@haunt.dev    - Actor - Mike Thompson
--   boxoffice@haunt.dev - Box Office - Lisa Park
--
-- Organization: Nightmare Manor (slug: nightmare-manor)
--
-- Attractions:
--   1. The Haunted Mansion (active, 7 zones)
--   2. Terror Trail (active, 5 zones)
--   3. Escape the Asylum (draft)
--
-- Staff: 5 members with skills, certifications, and time entries
--
-- F5 Platform Admin Data:
--   - Feature Flags: 5 (various states: enabled, percentage rollout, org-specific)
--   - Audit Logs: 24 entries showing platform activity
--   - Announcements: 3 (welcome, feature, maintenance)
--   - Health Logs: 10 entries for system monitoring demo
--
-- F6 Stripe Connect Data:
--   - Nightmare Manor: Connected with active Stripe account
--   - 5 payouts with various statuses
--   - 12 transactions showing payment history
--   - 8 webhook events for integration demo

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
     '2025-09-01 00:00:00', '2025-11-01 23:59:59'),

    ('80000000-0000-0000-0000-000000000002', v_org_id, v_mansion_id, v_season_id,
     'VIP Experience', 'Premium Haunted Mansion experience with exclusive access and perks.',
     4500, 5500, v_vip_cat_id, 6,
     ARRAY['Skip-the-line entry', 'Exclusive VIP lounge access', 'Souvenir photo included', 'Behind-the-scenes tour', 'Meet the actors'],
     '{"min_age": 14}'::JSONB, 2, TRUE,
     '2025-09-01 00:00:00', '2025-11-01 23:59:59'),

    ('80000000-0000-0000-0000-000000000003', v_org_id, v_mansion_id, v_season_id,
     'Fast Pass', 'Express entry with minimal wait time.',
     3500, NULL, v_fast_pass_cat_id, 8,
     ARRAY['Priority queue access', 'Reduced wait time', 'Dedicated fast lane entry'],
     '{"min_age": 12}'::JSONB, 3, TRUE,
     '2025-09-01 00:00:00', '2025-11-01 23:59:59'),

    ('80000000-0000-0000-0000-000000000004', v_org_id, v_mansion_id, v_season_id,
     'Group Ticket (10+)', 'Discounted rate for groups of 10 or more.',
     2000, 2500, v_group_cat_id, 50,
     ARRAY['Discounted group rate', 'Group photo', 'Dedicated entrance time'],
     '{"min_age": 12, "min_quantity": 10}'::JSONB, 4, TRUE,
     '2025-09-01 00:00:00', '2025-11-01 23:59:59'),

  -- Terror Trail Tickets
    ('80000000-0000-0000-0000-000000000005', v_org_id, v_trail_id, v_season_id,
     'Trail General Admission', 'Experience the half-mile Terror Trail through dark woods.',
     3000, NULL, v_general_cat_id, 10,
     ARRAY['Half-mile outdoor trail', '35-minute experience', 'Flashlight prohibited'],
     '{"min_age": 14}'::JSONB, 1, TRUE,
     '2025-10-01 00:00:00', '2025-10-31 23:59:59'),

    ('80000000-0000-0000-0000-000000000006', v_org_id, v_trail_id, v_season_id,
     'Trail VIP', 'Premium Terror Trail with guide and exclusive scares.',
     5500, NULL, v_vip_cat_id, 4,
     ARRAY['Personal guide', 'Extra scare interactions', 'Night vision goggles provided', 'Hot cocoa at finish'],
     '{"min_age": 16}'::JSONB, 2, TRUE,
     '2025-10-01 00:00:00', '2025-10-31 23:59:59'),

  -- Combo Tickets
    ('80000000-0000-0000-0000-000000000007', v_org_id, v_mansion_id, v_season_id,
     'Nightmare Combo', 'Both Haunted Mansion AND Terror Trail in one night.',
     5000, 5500, v_combo_cat_id, 8,
     ARRAY['Haunted Mansion entry', 'Terror Trail entry', 'Valid same night only', 'Commemorative lanyard'],
     '{"min_age": 14}'::JSONB, 5, TRUE,
     '2025-10-01 00:00:00', '2025-10-31 23:59:59'),

    ('80000000-0000-0000-0000-000000000008', v_org_id, v_mansion_id, v_season_id,
     'Ultimate Nightmare VIP', 'The complete Nightmare Manor VIP experience.',
     8500, 10000, v_vip_cat_id, 4,
     ARRAY['VIP access to both attractions', 'Reserved parking', 'Dinner at Cryptkeeper Cafe', 'Exclusive merchandise', 'Professional photo package'],
     '{"min_age": 16}'::JSONB, 6, TRUE,
     '2025-10-01 00:00:00', '2025-10-31 23:59:59')
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
    ('81000000-0000-0000-0000-000000000020', v_org_id, v_mansion_id, '2025-10-05', '18:45', '19:00', 20, 0, 'available', 0)
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
  INSERT INTO storefront_settings (
    id, org_id, attraction_id, tagline, description,
    logo_url, favicon_url, hero_image_url, hero_title, hero_subtitle,
    theme_preset, primary_color, secondary_color, accent_color,
    social_facebook, social_instagram, social_twitter, social_tiktok,
    seo_title, seo_description, seo_keywords,
    show_attractions, show_calendar, show_faq, show_reviews,
    featured_attraction_ids, is_published, published_at
  ) VALUES
    -- The Haunted Mansion storefront (published)
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
      'dark',
      '#7C3AED',  -- Purple
      '#1F2937',  -- Dark gray
      '#F59E0B',  -- Orange/amber
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
    -- Terror Trail storefront (draft)
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
      'dark',
      '#DC2626',  -- Red
      '#1F2937',
      '#F59E0B',
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
      FALSE,
      NULL
    )
  ON CONFLICT (attraction_id) DO NOTHING;

  -- ============================================================================
  -- STOREFRONT DOMAINS
  -- ============================================================================

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
      'haunted-mansion.hauntplatform.com',
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
      'terror-trail.hauntplatform.com',
      'subdomain',
      TRUE,
      NULL,
      'dns_txt',
      NOW() - INTERVAL '15 days',
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
    ('f3000000-0000-0000-0000-000000000004', v_org_id, 'FAQ', 'page', v_faq_page_id, NULL, v_mansion_id, 'header', 3, TRUE, FALSE),
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
