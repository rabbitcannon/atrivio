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
INSERT INTO public.feature_flags (id, key, name, description, enabled, rollout_percentage, org_ids, user_ids, metadata)
VALUES
  ('1f000000-0000-0000-0000-000000000001', 'virtual_queue_v2', 'Virtual Queue V2', 'New virtual queue system with SMS notifications and improved UX', FALSE, 25, '{}', '{}', '{"release_date": "2025-Q1", "ticket": "HAUNT-1234"}'),
  ('1f000000-0000-0000-0000-000000000002', 'new_checkout_flow', 'Streamlined Checkout', 'One-page checkout experience with Apple Pay support', TRUE, 0, '{}', '{}', '{"a_b_test": true}'),
  ('1f000000-0000-0000-0000-000000000003', 'staff_mobile_app', 'Staff Mobile App', 'Mobile app for staff to clock in/out and view schedules', FALSE, 0, ARRAY['b0000000-0000-0000-0000-000000000001']::UUID[], '{}', '{"beta_org": true}'),
  ('1f000000-0000-0000-0000-000000000004', 'advanced_analytics', 'Advanced Analytics Dashboard', 'Enhanced analytics with real-time metrics and forecasting', FALSE, 50, '{}', '{}', '{"premium_feature": true}'),
  ('1f000000-0000-0000-0000-000000000005', 'ai_scheduling', 'AI-Powered Scheduling', 'Machine learning powered staff scheduling optimization', FALSE, 0, '{}', ARRAY['a0000000-0000-0000-0000-000000000002']::UUID[], '{"experimental": true}')
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
INSERT INTO public.stripe_accounts (
  id, org_id, stripe_account_id, status, type,
  charges_enabled, payouts_enabled, details_submitted,
  dashboard_url, country, default_currency, business_type, business_name, metadata
)
VALUES
  -- Nightmare Manor - Fully connected and operational
  (
    '60000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'acct_1NightmareManor2024',
    'active',
    'express',
    TRUE,
    TRUE,
    TRUE,
    'https://connect.stripe.com/express/acct_1NightmareManor2024',
    'US',
    'usd',
    'company',
    'Nightmare Manor LLC',
    '{"verified_at": "2024-10-01", "industry": "entertainment"}'
  )
ON CONFLICT (id) DO NOTHING;

-- Stripe payouts (using valid hex UUIDs: 7p = payouts)
INSERT INTO public.stripe_payouts (
  id, stripe_account_id, stripe_payout_id, amount, currency, status,
  arrival_date, method, destination_type, destination_last4, metadata
)
VALUES
  -- Completed payouts
  (
    '70000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    'po_1OctPayout2024',
    1250000, -- $12,500
    'usd',
    'paid',
    '2024-10-15',
    'standard',
    'bank_account',
    '4567',
    '{"period": "2024-10-01 to 2024-10-14"}'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000001',
    'po_2OctPayout2024',
    1875000, -- $18,750
    'usd',
    'paid',
    '2024-10-31',
    'standard',
    'bank_account',
    '4567',
    '{"period": "2024-10-15 to 2024-10-31"}'
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    '60000000-0000-0000-0000-000000000001',
    'po_1NovPayout2024',
    890000, -- $8,900
    'usd',
    'paid',
    '2024-11-15',
    'standard',
    'bank_account',
    '4567',
    '{"period": "2024-11-01 to 2024-11-14"}'
  ),
  -- In transit payout
  (
    '70000000-0000-0000-0000-000000000004',
    '60000000-0000-0000-0000-000000000001',
    'po_1DecPayout2024',
    325000, -- $3,250
    'usd',
    'in_transit',
    CURRENT_DATE + INTERVAL '2 days',
    'standard',
    'bank_account',
    '4567',
    '{"period": "2024-12-01 to 2024-12-15"}'
  ),
  -- Pending payout
  (
    '70000000-0000-0000-0000-000000000005',
    '60000000-0000-0000-0000-000000000001',
    'po_2DecPayout2024',
    156000, -- $1,560
    'usd',
    'pending',
    CURRENT_DATE + INTERVAL '5 days',
    'standard',
    'bank_account',
    '4567',
    '{"period": "2024-12-16 to current"}'
  )
ON CONFLICT (id) DO NOTHING;

-- Stripe transactions (using valid hex UUIDs: 8t = transactions)
INSERT INTO public.stripe_transactions (
  id, stripe_account_id, stripe_payment_intent_id, stripe_charge_id,
  type, status, amount, currency, platform_fee, stripe_fee, net_amount,
  description, customer_email, metadata, created_at
)
VALUES
  -- October transactions (during Halloween season)
  (
    '80000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct01_001', 'ch_Oct01_001',
    'charge', 'succeeded',
    4500, 'usd', 130, 160, 4210,
    'General Admission x3',
    'john.smith@example.com',
    '{"tickets": 3, "type": "general"}',
    NOW() - INTERVAL '60 days'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct05_001', 'ch_Oct05_001',
    'charge', 'succeeded',
    12000, 'usd', 348, 378, 11274,
    'VIP Fast Pass x4',
    'mary.jones@example.com',
    '{"tickets": 4, "type": "vip_fast_pass"}',
    NOW() - INTERVAL '56 days'
  ),
  (
    '80000000-0000-0000-0000-000000000003',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct10_001', 'ch_Oct10_001',
    'charge', 'succeeded',
    6000, 'usd', 174, 204, 5622,
    'Group Package x6',
    'group.booking@company.com',
    '{"tickets": 6, "type": "group"}',
    NOW() - INTERVAL '51 days'
  ),
  (
    '80000000-0000-0000-0000-000000000004',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct15_001', 'ch_Oct15_001',
    'charge', 'succeeded',
    2500, 'usd', 72, 102, 2326,
    'General Admission x2 (Senior Discount)',
    'senior.couple@email.com',
    '{"tickets": 2, "type": "general", "discount": "senior"}',
    NOW() - INTERVAL '46 days'
  ),
  -- Refund example
  (
    '80000000-0000-0000-0000-000000000005',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct20_001', NULL,
    'refund', 'succeeded',
    1500, 'usd', 0, 0, -1500,
    'Refund - Event cancelled due to weather',
    'refund.customer@email.com',
    '{"original_charge": "ch_Oct18_001", "reason": "weather_cancellation"}',
    NOW() - INTERVAL '41 days'
  ),
  -- More charges
  (
    '80000000-0000-0000-0000-000000000006',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct25_001', 'ch_Oct25_001',
    'charge', 'succeeded',
    8500, 'usd', 246, 276, 7978,
    'Ultimate Scare Package x2',
    'thrill.seeker@example.com',
    '{"tickets": 2, "type": "ultimate_package"}',
    NOW() - INTERVAL '36 days'
  ),
  (
    '80000000-0000-0000-0000-000000000007',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct28_001', 'ch_Oct28_001',
    'charge', 'succeeded',
    15000, 'usd', 435, 465, 14100,
    'Halloween Night VIP x5',
    'party.planner@gmail.com',
    '{"tickets": 5, "type": "halloween_vip", "date": "2024-10-31"}',
    NOW() - INTERVAL '33 days'
  ),
  (
    '80000000-0000-0000-0000-000000000008',
    '60000000-0000-0000-0000-000000000001',
    'pi_Oct31_001', 'ch_Oct31_001',
    'charge', 'succeeded',
    22500, 'usd', 652, 682, 21166,
    'Halloween Night - Walk-ins x15',
    NULL,
    '{"tickets": 15, "type": "general", "walk_in": true, "date": "2024-10-31"}',
    NOW() - INTERVAL '30 days'
  ),
  -- November transactions
  (
    '80000000-0000-0000-0000-000000000009',
    '60000000-0000-0000-0000-000000000001',
    'pi_Nov01_001', 'ch_Nov01_001',
    'charge', 'succeeded',
    3000, 'usd', 87, 117, 2796,
    'General Admission x2',
    'late.season@email.com',
    '{"tickets": 2, "type": "general"}',
    NOW() - INTERVAL '29 days'
  ),
  -- Recent transactions
  (
    '80000000-0000-0000-0000-000000000010',
    '60000000-0000-0000-0000-000000000001',
    'pi_Dec15_001', 'ch_Dec15_001',
    'charge', 'succeeded',
    7500, 'usd', 217, 247, 7036,
    'Gift Cards Purchase',
    'gift.buyer@example.com',
    '{"type": "gift_card", "cards": 5, "value_each": 1500}',
    NOW() - INTERVAL '7 days'
  ),
  (
    '80000000-0000-0000-0000-000000000011',
    '60000000-0000-0000-0000-000000000001',
    'pi_Dec20_001', 'ch_Dec20_001',
    'charge', 'succeeded',
    4000, 'usd', 116, 146, 3738,
    'Season Pass 2025',
    'superfan@hauntlover.com',
    '{"type": "season_pass", "year": 2025}',
    NOW() - INTERVAL '3 days'
  ),
  -- Pending charge
  (
    '80000000-0000-0000-0000-000000000012',
    '60000000-0000-0000-0000-000000000001',
    'pi_Dec22_001', NULL,
    'charge', 'pending',
    3500, 'usd', 101, 131, 3268,
    'Corporate Group Booking Deposit',
    'events@bigcorp.com',
    '{"type": "corporate_deposit", "full_amount": 15000}',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Stripe webhooks (using valid hex UUIDs: 9w = webhooks)
INSERT INTO public.stripe_webhooks (
  id, stripe_event_id, type, api_version, processed, payload, created_at, processed_at
)
VALUES
  (
    '90000000-0000-0000-0000-000000000001',
    'evt_account_updated_001',
    'account.updated',
    '2023-10-16',
    TRUE,
    '{"id": "evt_account_updated_001", "type": "account.updated", "data": {"object": {"id": "acct_1NightmareManor2024", "charges_enabled": true, "payouts_enabled": true}}}',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    'evt_payout_paid_001',
    'payout.paid',
    '2023-10-16',
    TRUE,
    '{"id": "evt_payout_paid_001", "type": "payout.paid", "data": {"object": {"id": "po_1OctPayout2024", "amount": 1250000, "status": "paid"}}}',
    NOW() - INTERVAL '46 days',
    NOW() - INTERVAL '46 days'
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    'evt_payment_succeeded_001',
    'payment_intent.succeeded',
    '2023-10-16',
    TRUE,
    '{"id": "evt_payment_succeeded_001", "type": "payment_intent.succeeded", "data": {"object": {"id": "pi_Oct31_001", "amount": 22500, "status": "succeeded"}}}',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  ),
  (
    '90000000-0000-0000-0000-000000000004',
    'evt_charge_refunded_001',
    'charge.refunded',
    '2023-10-16',
    TRUE,
    '{"id": "evt_charge_refunded_001", "type": "charge.refunded", "data": {"object": {"id": "ch_Oct18_001", "amount_refunded": 1500}}}',
    NOW() - INTERVAL '41 days',
    NOW() - INTERVAL '41 days'
  ),
  (
    '90000000-0000-0000-0000-000000000005',
    'evt_payout_paid_002',
    'payout.paid',
    '2023-10-16',
    TRUE,
    '{"id": "evt_payout_paid_002", "type": "payout.paid", "data": {"object": {"id": "po_2OctPayout2024", "amount": 1875000, "status": "paid"}}}',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  ),
  (
    '90000000-0000-0000-0000-000000000006',
    'evt_payout_paid_003',
    'payout.paid',
    '2023-10-16',
    TRUE,
    '{"id": "evt_payout_paid_003", "type": "payout.paid", "data": {"object": {"id": "po_1NovPayout2024", "amount": 890000, "status": "paid"}}}',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  ),
  (
    '90000000-0000-0000-0000-000000000007',
    'evt_payout_created_001',
    'payout.created',
    '2023-10-16',
    TRUE,
    '{"id": "evt_payout_created_001", "type": "payout.created", "data": {"object": {"id": "po_1DecPayout2024", "amount": 325000, "status": "pending"}}}',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '90000000-0000-0000-0000-000000000008',
    'evt_payment_pending_001',
    'payment_intent.processing',
    '2023-10-16',
    TRUE,
    '{"id": "evt_payment_pending_001", "type": "payment_intent.processing", "data": {"object": {"id": "pi_Dec22_001", "amount": 3500, "status": "processing"}}}',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;
