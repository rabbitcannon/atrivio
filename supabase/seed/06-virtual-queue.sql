-- ============================================================================
-- 06-VIRTUAL-QUEUE.SQL - Enterprise Tier Virtual Queue Demo Data
-- ============================================================================
-- This file seeds virtual queue data for Terror Collective (Enterprise tier)
-- to demonstrate the virtual queue feature.
--
-- Organization: Terror Collective (b0000000-0000-0000-0000-000000000003)
-- Attractions with queues:
--   - Dread Factory (c3000000-0000-0000-0000-000000000001)
--   - Nightmare Kingdom (c3000000-0000-0000-0000-000000000004)
-- ============================================================================

-- ============================================================================
-- QUEUE CONFIGURATIONS
-- ============================================================================

-- Dread Factory Queue (high capacity, industrial efficiency)
INSERT INTO public.queue_configs (
  id, org_id, attraction_id, name,
  is_active, is_paused,
  capacity_per_batch, batch_interval_minutes,
  max_wait_minutes, max_queue_size,
  allow_rejoin, require_check_in,
  notification_lead_minutes, expiry_minutes,
  settings
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000003',
  'c3000000-0000-0000-0000-000000000001',
  'Dread Factory Virtual Line',
  TRUE, FALSE,
  15, 5,    -- 15 people every 5 minutes
  90, 300,  -- 90 min max wait, 300 max queue
  FALSE, TRUE,
  10, 15,   -- 10 min notification, 15 min expiry
  '{"sms_enabled": true, "priority_boarding": true, "vip_lanes": true}'
) ON CONFLICT (attraction_id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  capacity_per_batch = EXCLUDED.capacity_per_batch,
  settings = EXCLUDED.settings;

-- Nightmare Kingdom Queue (family-friendly, fantasy theme)
INSERT INTO public.queue_configs (
  id, org_id, attraction_id, name,
  is_active, is_paused,
  capacity_per_batch, batch_interval_minutes,
  max_wait_minutes, max_queue_size,
  allow_rejoin, require_check_in,
  notification_lead_minutes, expiry_minutes,
  settings
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'c3000000-0000-0000-0000-000000000004',
  'Kingdom Virtual Pass',
  TRUE, FALSE,
  20, 6,    -- 20 people every 6 minutes
  120, 500, -- 120 min max wait, 500 max queue
  TRUE, TRUE,
  15, 20,   -- 15 min notification, 20 min expiry
  '{"sms_enabled": true, "family_mode": true, "photo_pass_integration": true}'
) ON CONFLICT (attraction_id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  capacity_per_batch = EXCLUDED.capacity_per_batch,
  settings = EXCLUDED.settings;

-- ============================================================================
-- QUEUE ENTRIES - Dread Factory (Active queue with variety of statuses)
-- ============================================================================

-- Generate realistic queue entries with various statuses
INSERT INTO public.queue_entries (
  id, org_id, queue_id, confirmation_code,
  guest_name, guest_phone, guest_email,
  party_size, position, status,
  joined_at, estimated_time, notified_at, called_at, checked_in_at
) VALUES
  -- Currently waiting guests (positions 1-8)
  ('ae000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-A1B2C3', 'Michael Chen', '+1555-0101', 'mchen@example.com',
   4, 1, 'waiting', NOW() - INTERVAL '25 minutes', NOW() + INTERVAL '5 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-D4E5F6', 'Sarah Johnson', '+1555-0102', 'sjohnson@example.com',
   2, 2, 'waiting', NOW() - INTERVAL '22 minutes', NOW() + INTERVAL '10 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-G7H8I9', 'The Martinez Family', '+1555-0103', 'martinez.fam@example.com',
   6, 3, 'waiting', NOW() - INTERVAL '18 minutes', NOW() + INTERVAL '15 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-J1K2L3', 'David Park', '+1555-0104', 'dpark@example.com',
   2, 4, 'notified', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '2 minutes', NOW() - INTERVAL '2 minutes', NULL, NULL),

  ('ae000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-M4N5O6', 'Jessica Williams', '+1555-0105', 'jwilliams@example.com',
   3, 5, 'waiting', NOW() - INTERVAL '12 minutes', NOW() + INTERVAL '20 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-P7Q8R9', 'Alex & Friends', '+1555-0106', 'alex.group@example.com',
   5, 6, 'waiting', NOW() - INTERVAL '8 minutes', NOW() + INTERVAL '25 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-S1T2U3', 'Emily Rodriguez', '+1555-0107', 'erodriguez@example.com',
   2, 7, 'waiting', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '30 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-V4W5X6', 'Chris Thompson', '+1555-0108', 'cthompson@example.com',
   1, 8, 'waiting', NOW() - INTERVAL '2 minutes', NOW() + INTERVAL '35 minutes', NULL, NULL, NULL),

  -- Called guests (ready to enter)
  ('ae000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-Y7Z8A1', 'Nicole Anderson', '+1555-0110', 'nanderson@example.com',
   4, 0, 'called', NOW() - INTERVAL '35 minutes', NOW(), NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '5 minutes', NULL),

  -- Recently checked in
  ('ae000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-B2C3D4', 'Tyler Brown', '+1555-0111', 'tbrown@example.com',
   2, 0, 'checked_in', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '10 minutes'),

  ('ae000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-E5F6G7', 'Jennifer Garcia', '+1555-0112', 'jgarcia@example.com',
   3, 0, 'checked_in', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '15 minutes'),

  -- Expired (no show)
  ('ae000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'DF-H8I9J1', 'Robert Wilson', '+1555-0113', 'rwilson@example.com',
   2, 0, 'expired', NOW() - INTERVAL '60 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '30 minutes', NULL)

ON CONFLICT (confirmation_code) DO NOTHING;

-- ============================================================================
-- QUEUE ENTRIES - Nightmare Kingdom (Family-friendly queue)
-- ============================================================================

INSERT INTO public.queue_entries (
  id, org_id, queue_id, confirmation_code,
  guest_name, guest_phone, guest_email,
  party_size, position, status,
  joined_at, estimated_time, notified_at, called_at, checked_in_at
) VALUES
  -- Waiting guests (family groups)
  ('ae000000-0000-0000-0001-000000000001', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-A1B2C3', 'The Henderson Family', '+1555-0201', 'hendersons@example.com',
   5, 1, 'waiting', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '6 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0001-000000000002', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-D4E5F6', 'Lisa & Tom Cooper', '+1555-0202', 'coopers@example.com',
   4, 2, 'notified', NOW() - INTERVAL '28 minutes', NOW() + INTERVAL '3 minutes', NOW() - INTERVAL '3 minutes', NULL, NULL),

  ('ae000000-0000-0000-0001-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-G7H8I9', 'Garcia Birthday Party', '+1555-0203', 'garciaparty@example.com',
   8, 3, 'waiting', NOW() - INTERVAL '25 minutes', NOW() + INTERVAL '12 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0001-000000000004', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-J1K2L3', 'James Miller', '+1555-0204', 'jmiller@example.com',
   2, 4, 'waiting', NOW() - INTERVAL '20 minutes', NOW() + INTERVAL '18 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0001-000000000005', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-M4N5O6', 'Nguyen Family', '+1555-0205', 'nguyens@example.com',
   6, 5, 'waiting', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '24 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0001-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-P7Q8R9', 'Birthday Group - Emma', '+1555-0206', 'emmabirthday@example.com',
   10, 6, 'waiting', NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '30 minutes', NULL, NULL, NULL),

  ('ae000000-0000-0000-0001-000000000007', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-S1T2U3', 'The Kim Family', '+1555-0207', 'kims@example.com',
   4, 7, 'waiting', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '36 minutes', NULL, NULL, NULL),

  -- Called guests
  ('ae000000-0000-0000-0001-000000000010', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-V4W5X6', 'Peterson Party', '+1555-0210', 'petersons@example.com',
   6, 0, 'called', NOW() - INTERVAL '40 minutes', NOW(), NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '8 minutes', NULL),

  -- Checked in
  ('ae000000-0000-0000-0001-000000000011', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-Y7Z8A1', 'Robinson Family', '+1555-0211', 'robinsons@example.com',
   5, 0, 'checked_in', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '20 minutes'),

  ('ae000000-0000-0000-0001-000000000012', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'NK-B2C3D4', 'Adams & Company', '+1555-0212', 'adamsco@example.com',
   7, 0, 'checked_in', NOW() - INTERVAL '65 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '30 minutes')

ON CONFLICT (confirmation_code) DO NOTHING;

-- ============================================================================
-- QUEUE STATS - Sample hourly statistics
-- ============================================================================

INSERT INTO public.queue_stats (
  id, org_id, queue_id, hour_start,
  total_joined, total_served, total_expired, total_left,
  avg_wait_minutes, max_wait_minutes,
  peak_queue_size
) VALUES
  -- Dread Factory - Last 6 hours
  ('a5000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   DATE_TRUNC('hour', NOW() - INTERVAL '5 hours'), 45, 42, 2, 1, 28, 52, 35),
  ('a5000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   DATE_TRUNC('hour', NOW() - INTERVAL '4 hours'), 52, 48, 3, 1, 32, 58, 42),
  ('a5000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   DATE_TRUNC('hour', NOW() - INTERVAL '3 hours'), 68, 65, 2, 1, 38, 65, 55),
  ('a5000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   DATE_TRUNC('hour', NOW() - INTERVAL '2 hours'), 75, 70, 4, 1, 42, 72, 62),
  ('a5000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'), 58, 52, 3, 3, 35, 55, 48),
  ('a5000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   DATE_TRUNC('hour', NOW()), 25, 18, 1, 0, 25, 40, 28),

  -- Nightmare Kingdom - Last 6 hours
  ('a5000000-0000-0000-0001-000000000001', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   DATE_TRUNC('hour', NOW() - INTERVAL '5 hours'), 62, 58, 3, 1, 35, 62, 48),
  ('a5000000-0000-0000-0001-000000000002', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   DATE_TRUNC('hour', NOW() - INTERVAL '4 hours'), 78, 72, 4, 2, 42, 75, 65),
  ('a5000000-0000-0000-0001-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   DATE_TRUNC('hour', NOW() - INTERVAL '3 hours'), 95, 88, 5, 2, 48, 85, 78),
  ('a5000000-0000-0000-0001-000000000004', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   DATE_TRUNC('hour', NOW() - INTERVAL '2 hours'), 85, 80, 3, 2, 45, 78, 72),
  ('a5000000-0000-0000-0001-000000000005', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'), 65, 60, 3, 2, 38, 65, 55),
  ('a5000000-0000-0000-0001-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   DATE_TRUNC('hour', NOW()), 32, 25, 1, 0, 30, 48, 35)

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- QUEUE NOTIFICATIONS - Sample notification history
-- ============================================================================

INSERT INTO public.queue_notifications (
  id, org_id, entry_id, type, channel, recipient, message, sent_at, delivered_at
) VALUES
  -- Notifications for Dread Factory
  ('a6000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0000-000000000001',
   'joined', 'sms', '+1555-0101', 'Welcome to Dread Factory! Your party of 4 is #1 in line. Estimated wait: ~30 min. Confirmation: DF-A1B2C3',
   NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes'),

  ('a6000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0000-000000000004',
   'almost_ready', 'sms', '+1555-0104', 'Almost time! Your turn at Dread Factory is coming up in ~10 minutes. Please head to the entrance. Confirmation: DF-J1K2L3',
   NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '2 minutes'),

  ('a6000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0000-000000000010',
   'ready', 'sms', '+1555-0110', 'IT''S TIME! Please proceed to Dread Factory entrance now. Your window expires in 15 min. Confirmation: DF-Y7Z8A1',
   NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),

  -- Notifications for Nightmare Kingdom
  ('a6000000-0000-0000-0001-000000000001', 'b0000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0001-000000000001',
   'joined', 'sms', '+1555-0201', 'Welcome to Nightmare Kingdom! Your party of 5 is #1 in line. Estimated wait: ~36 min. Confirmation: NK-A1B2C3',
   NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),

  ('a6000000-0000-0000-0001-000000000002', 'b0000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0001-000000000002',
   'almost_ready', 'sms', '+1555-0202', 'Almost time! Your turn at Nightmare Kingdom is coming up in ~15 minutes. Please gather your party. Confirmation: NK-D4E5F6',
   NOW() - INTERVAL '3 minutes', NOW() - INTERVAL '3 minutes'),

  ('a6000000-0000-0000-0001-000000000003', 'b0000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0001-000000000010',
   'ready', 'sms', '+1555-0210', 'THE KINGDOM AWAITS! Please proceed to Nightmare Kingdom entrance now. Your window expires in 20 min. Confirmation: NK-V4W5X6',
   NOW() - INTERVAL '8 minutes', NOW() - INTERVAL '8 minutes')

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Queue Configs: 2 (Dread Factory, Nightmare Kingdom)
-- Queue Entries: 23 (13 Dread Factory, 10 Nightmare Kingdom)
--   - Waiting: 15
--   - Notified: 2
--   - Called: 2
--   - Checked In: 4
--   - Expired: 1
-- Queue Stats: 12 (6 per queue, last 6 hours)
-- Queue Notifications: 6 (sample SMS notifications)
-- ============================================================================
