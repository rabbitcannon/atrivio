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
