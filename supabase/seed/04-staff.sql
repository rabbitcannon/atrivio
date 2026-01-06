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
