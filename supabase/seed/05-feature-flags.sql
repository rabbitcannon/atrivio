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
-- Note: Feature access is now fully tier-based via is_feature_enabled() function
INSERT INTO public.feature_flags (id, key, name, description, enabled, org_ids, user_ids, metadata)
VALUES
  -- ============================================================================
  -- BASIC TIER (All orgs get these)
  -- ============================================================================

  -- Time Tracking (F7a) - Basic tier
  ('1f000000-0000-0000-0000-00000000000e', 'time_tracking', 'Time Tracking Module',
   'Staff time clock with clock in/out, time entries, and approval workflows (F7a)',
   TRUE, '{}', '{}',
   '{"tier": "basic", "feature": "F7a", "module": true}'),

  -- Ticketing (F8) - Basic tier
  ('1f000000-0000-0000-0000-000000000006', 'ticketing', 'Ticketing Module',
   'Core ticketing functionality including ticket types, orders, and promo codes (F8)',
   TRUE, '{}', '{}',
   '{"tier": "basic", "feature": "F8", "module": true}'),

  -- Check-In (F9) - Basic tier
  ('1f000000-0000-0000-0000-000000000007', 'checkin', 'Check-In Module',
   'Guest check-in with barcode scanning, capacity tracking, and waivers (F9)',
   TRUE, '{}', '{}',
   '{"tier": "basic", "feature": "F9", "module": true}'),

  -- Notifications (F12) - Basic tier (in-app only)
  -- NOTE: This may be created by F12 migration, use ON CONFLICT
  ('1f000000-0000-0000-0000-00000000000c', 'notifications', 'Notifications Module',
   'Multi-channel notification system with in-app, email, and SMS delivery (F12)',
   TRUE, '{}', '{}',
   '{"tier": "basic", "feature": "F12", "module": true}'),

  -- ============================================================================
  -- PRO TIER (Pro and Enterprise orgs)
  -- ============================================================================

  -- Scheduling (F7b) - Pro tier
  -- Enabled for: Nightmare Manor, Terror Collective
  ('1f000000-0000-0000-0000-000000000008', 'scheduling', 'Scheduling Module',
   'Staff scheduling with availability, shift templates, and swap requests (F7)',
   TRUE,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F7b", "module": true}'),

  -- Inventory (F10) - Pro tier
  -- Enabled for: Nightmare Manor, Terror Collective
  ('1f000000-0000-0000-0000-000000000009', 'inventory', 'Inventory Module',
   'Inventory tracking with categories, checkouts, and low stock alerts (F10)',
   TRUE,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F10", "module": true}'),

  -- Analytics Pro (F13) - Pro tier
  -- Enabled for: Nightmare Manor, Terror Collective
  ('1f000000-0000-0000-0000-00000000000a', 'analytics_pro', 'Analytics Pro',
   'Advanced analytics with custom reports, exports, and forecasting (F13)',
   TRUE,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F13", "module": true}'),

  -- Storefronts (F14) - Pro tier
  -- NOTE: This may be created by F14 migration, use ON CONFLICT
  ('1f000000-0000-0000-0000-00000000000f', 'storefronts', 'Storefronts Module',
   'Public-facing storefront for ticket sales with customizable themes (F14)',
   TRUE,
   ARRAY['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "pro", "feature": "F14", "module": true}'),

  -- ============================================================================
  -- ENTERPRISE TIER (Enterprise orgs only)
  -- ============================================================================

  -- Virtual Queue (F11) - Enterprise tier
  -- Enabled for: Terror Collective (Enterprise only - tier enforced)
  ('1f000000-0000-0000-0000-00000000000b', 'virtual_queue', 'Virtual Queue',
   'Real-time virtual queue with position tracking and notifications (F11)',
   TRUE,
   ARRAY['b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "enterprise", "feature": "F11", "module": true}'),

  -- SMS Notifications - Enterprise tier
  -- Enabled for: Terror Collective only (has SMS gateway configured)
  ('1f000000-0000-0000-0000-000000000010', 'sms_notifications', 'SMS Notifications',
   'SMS delivery for queue alerts, shift reminders, and guest communications (F11/F12)',
   TRUE,
   ARRAY['b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "enterprise", "feature": "F11,F12", "has_usage_cost": true}'),

  -- Custom Domains - Enterprise tier
  -- Enabled for: Terror Collective only
  ('1f000000-0000-0000-0000-00000000000d', 'custom_domains', 'Custom Domains',
   'Custom domain support for public storefronts with SSL provisioning (F14)',
   TRUE,
   ARRAY['b0000000-0000-0000-0000-000000000003']::UUID[],
   '{}',
   '{"tier": "enterprise", "feature": "F14", "has_infra_cost": true}'),

  -- ============================================================================
  -- EXPERIMENTAL/BETA FLAGS (org/user allowlist based)
  -- ============================================================================

  -- Virtual Queue V2 (beta)
  ('1f000000-0000-0000-0000-000000000001', 'virtual_queue_v2', 'Virtual Queue V2',
   'New virtual queue system with SMS notifications and improved UX',
   FALSE, '{}', '{}',
   '{"release_date": "2025-Q1", "ticket": "HAUNT-1234"}'),

  -- Streamlined Checkout (A/B test)
  ('1f000000-0000-0000-0000-000000000002', 'new_checkout_flow', 'Streamlined Checkout',
   'One-page checkout experience with Apple Pay support',
   TRUE, '{}', '{}',
   '{"a_b_test": true}'),

  -- Staff Mobile App (beta for Nightmare Manor)
  ('1f000000-0000-0000-0000-000000000003', 'staff_mobile_app', 'Staff Mobile App',
   'Mobile app for staff to clock in/out and view schedules',
   FALSE,
   ARRAY['b0000000-0000-0000-0000-000000000001']::UUID[],
   '{}',
   '{"beta_org": true}'),

  -- Advanced Analytics Dashboard
  ('1f000000-0000-0000-0000-000000000004', 'advanced_analytics', 'Advanced Analytics Dashboard',
   'Enhanced analytics with real-time metrics and forecasting',
   FALSE, '{}', '{}',
   '{"premium_feature": true}'),

  -- AI Scheduling (experimental, single user)
  ('1f000000-0000-0000-0000-000000000005', 'ai_scheduling', 'AI-Powered Scheduling',
   'Machine learning powered staff scheduling optimization',
   FALSE, '{}',
   ARRAY['a0000000-0000-0000-0000-000000000002']::UUID[],
   '{"experimental": true}')

ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
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
--   ❌ virtual_queue, sms_notifications, custom_domains
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
