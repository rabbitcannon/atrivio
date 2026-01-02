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
VALUES (
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
  -- Basic tier: ticketing, checkin, storefront (always on for all orgs)
  ('1f000000-0000-0000-0000-000000000006', 'ticketing', 'Ticketing Module', 'Core ticketing functionality including ticket types, orders, and promo codes (F8)', TRUE, 100, '{}', '{}', '{"tier": "basic", "feature": "F8", "module": true}'),
  ('1f000000-0000-0000-0000-000000000007', 'checkin', 'Check-In Module', 'Guest check-in with barcode scanning, capacity tracking, and waivers (F9)', TRUE, 100, '{}', '{}', '{"tier": "basic", "feature": "F9", "module": true}'),

  -- Pro tier: scheduling, inventory, analytics_pro
  ('1f000000-0000-0000-0000-000000000008', 'scheduling', 'Scheduling Module', 'Staff scheduling with availability, shift templates, and swap requests (F7)', TRUE, 100, '{}', '{}', '{"tier": "pro", "feature": "F7", "module": true}'),
  ('1f000000-0000-0000-0000-000000000009', 'inventory', 'Inventory Module', 'Inventory tracking with categories, checkouts, and low stock alerts (F10)', TRUE, 100, '{}', '{}', '{"tier": "pro", "feature": "F10", "module": true}'),
  ('1f000000-0000-0000-0000-00000000000a', 'analytics_pro', 'Analytics Pro', 'Advanced analytics with custom reports, exports, and forecasting (F13)', FALSE, 0, '{}', '{}', '{"tier": "pro", "feature": "F13", "module": true}'),

  -- Enterprise tier: virtual_queue, sms_notifications, custom_domains
  ('1f000000-0000-0000-0000-00000000000b', 'virtual_queue', 'Virtual Queue', 'Real-time virtual queue with position tracking and notifications (F11)', FALSE, 0, '{}', '{}', '{"tier": "enterprise", "feature": "F11", "module": true}'),
  ('1f000000-0000-0000-0000-00000000000c', 'sms_notifications', 'SMS Notifications', 'SMS delivery for queue alerts, shift reminders, and guest communications (F11/F12)', FALSE, 0, '{}', '{}', '{"tier": "enterprise", "feature": "F11,F12", "has_usage_cost": true}'),
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
