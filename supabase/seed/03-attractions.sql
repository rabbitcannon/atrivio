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
