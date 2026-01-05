-- F12: Notifications
-- Multi-channel notification system for email, SMS, and in-app notifications

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');

CREATE TYPE notification_status AS ENUM (
  'pending',      -- Created, not yet sent
  'queued',       -- In queue for sending
  'sent',         -- Sent to provider
  'delivered',    -- Confirmed delivered
  'opened',       -- Email opened (tracking pixel)
  'clicked',      -- Link clicked
  'failed',       -- Failed to send
  'bounced',      -- Email bounced
  'unsubscribed'  -- User unsubscribed
);

CREATE TYPE recipient_type AS ENUM ('user', 'customer', 'staff', 'guest');

CREATE TYPE notification_category AS ENUM (
  'tickets',        -- Order confirmations, reminders
  'queue',          -- Virtual queue updates
  'schedule',       -- Shift schedules, swaps
  'announcements',  -- Org-wide announcements
  'marketing',      -- Promotional emails
  'system'          -- Account, security, platform
);

CREATE TYPE device_platform AS ENUM ('ios', 'android', 'web');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Notification Templates
-- Reusable templates for different notification types
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  channel notification_channel NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, key, channel)
);

-- System templates have NULL org_id, org templates override system ones
CREATE INDEX idx_notification_templates_org ON notification_templates(org_id);
CREATE INDEX idx_notification_templates_key ON notification_templates(key, channel);

-- Notifications
-- Individual notification records
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  category notification_category NOT NULL DEFAULT 'system',

  -- Recipient info (one of these based on recipient_type)
  recipient_type recipient_type NOT NULL,
  recipient_id UUID,                    -- User/staff ID if applicable
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_device_token TEXT,

  -- Content
  subject VARCHAR(255),
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',              -- Additional data (deep links, etc.)

  -- Status tracking
  status notification_status DEFAULT 'pending',
  priority INTEGER DEFAULT 0,           -- Higher = more urgent
  scheduled_at TIMESTAMPTZ,             -- For scheduled notifications
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Provider info
  provider_message_id VARCHAR(255),     -- Twilio SID, SendGrid ID, etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_org ON notifications(org_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Notification Preferences
-- User opt-in/opt-out settings per category
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category notification_category NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, org_id, category)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

-- Push Devices
-- Registered devices for push notifications
CREATE TABLE push_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_token TEXT UNIQUE NOT NULL,
  platform device_platform NOT NULL,
  device_name VARCHAR(200),
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_push_devices_user ON push_devices(user_id);
CREATE INDEX idx_push_devices_token ON push_devices(device_token);

-- In-App Notifications
-- Lightweight table for in-app notification bell
CREATE TABLE in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category notification_category NOT NULL DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_in_app_notifications_user ON in_app_notifications(user_id);
CREATE INDEX idx_in_app_notifications_unread ON in_app_notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_in_app_notifications_created ON in_app_notifications(created_at DESC);

-- =============================================================================
-- SYSTEM TEMPLATES (org_id = NULL)
-- =============================================================================

INSERT INTO notification_templates (org_id, key, name, description, channel, subject, body, variables, is_system) VALUES
-- Queue notifications (SMS)
(NULL, 'queue_joined', 'Queue Joined', 'Sent when guest joins virtual queue', 'sms', NULL,
 'You''re in line at {{attraction_name}}! Position: #{{queue_position}}. We''ll text you when it''s your turn. Code: {{confirmation_code}}',
 ARRAY['attraction_name', 'queue_position', 'confirmation_code', 'wait_time'], TRUE),

(NULL, 'queue_ready', 'Queue Ready', 'Sent when guest turn is ready', 'sms', NULL,
 '🎃 Your turn at {{attraction_name}}! Head to the entrance now. Code: {{confirmation_code}}. You have {{expiry_minutes}} min.',
 ARRAY['attraction_name', 'confirmation_code', 'expiry_minutes'], TRUE),

(NULL, 'queue_reminder', 'Queue Reminder', 'Reminder before turn', 'sms', NULL,
 'Almost your turn at {{attraction_name}}! ~{{wait_time}} min remaining. Be ready! Code: {{confirmation_code}}',
 ARRAY['attraction_name', 'wait_time', 'confirmation_code'], TRUE),

-- Ticket notifications (Email)
(NULL, 'ticket_confirmation', 'Ticket Confirmation', 'Order confirmation email', 'email',
 'Your tickets for {{attraction_name}} - Order #{{order_number}}',
 E'Hi {{guest_name}},\n\nYour order is confirmed!\n\nOrder #{{order_number}}\n{{attraction_name}}\nDate: {{date}}\nTime: {{time_slot}}\n\nTickets:\n{{ticket_details}}\n\nTotal: {{total_amount}}\n\nSee you there!',
 ARRAY['guest_name', 'attraction_name', 'order_number', 'date', 'time_slot', 'ticket_details', 'total_amount'], TRUE),

(NULL, 'ticket_reminder', 'Ticket Reminder', 'Event reminder', 'email',
 'Reminder: {{attraction_name}} is tomorrow!',
 E'Hi {{guest_name}},\n\nDon''t forget - your visit to {{attraction_name}} is tomorrow!\n\nDate: {{date}}\nTime: {{time_slot}}\nOrder: #{{order_number}}\n\nSee you there!',
 ARRAY['guest_name', 'attraction_name', 'date', 'time_slot', 'order_number'], TRUE),

-- Schedule notifications (Email + Push)
(NULL, 'schedule_published', 'Schedule Published', 'New schedule available', 'email',
 'New schedule posted for {{period_name}}',
 E'Hi {{staff_name}},\n\nA new schedule has been published for {{period_name}}.\n\nYour shifts:\n{{shift_summary}}\n\nView full schedule: {{schedule_url}}',
 ARRAY['staff_name', 'period_name', 'shift_summary', 'schedule_url'], TRUE),

(NULL, 'shift_reminder', 'Shift Reminder', 'Reminder before shift', 'sms', NULL,
 'Reminder: You have a shift at {{attraction_name}} today at {{shift_time}}. See you there!',
 ARRAY['attraction_name', 'shift_time', 'shift_date'], TRUE),

(NULL, 'swap_requested', 'Swap Requested', 'Someone wants to swap shifts', 'email',
 'Shift swap request from {{requester_name}}',
 E'Hi {{staff_name}},\n\n{{requester_name}} wants to swap shifts with you.\n\nTheir shift: {{their_shift}}\nYour shift: {{your_shift}}\n\nRespond here: {{swap_url}}',
 ARRAY['staff_name', 'requester_name', 'their_shift', 'your_shift', 'swap_url'], TRUE);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Notification Templates: Org members can view, admins can manage
CREATE POLICY "View notification templates" ON notification_templates
  FOR SELECT USING (
    org_id IS NULL  -- System templates visible to all
    OR org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Manage notification templates" ON notification_templates
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Notifications: Users see their own, admins see org notifications
CREATE POLICY "View own notifications" ON notifications
  FOR SELECT USING (
    recipient_id = auth.uid()
    OR org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Manage org notifications" ON notifications
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Notification Preferences: Users manage their own
CREATE POLICY "Manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Push Devices: Users manage their own
CREATE POLICY "Manage own devices" ON push_devices
  FOR ALL USING (user_id = auth.uid());

-- In-App Notifications: Users see their own
CREATE POLICY "View own in_app notifications" ON in_app_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Update own in_app notifications" ON in_app_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Service role bypass for backend
CREATE POLICY "Service role full access templates" ON notification_templates
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access notifications" ON notifications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access in_app" ON in_app_notifications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM in_app_notifications
  WHERE user_id = p_user_id AND read = FALSE;
$$;

-- Mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE in_app_notifications
  SET read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND read = FALSE;
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamps
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FEATURE FLAG
-- =============================================================================

-- Add notifications feature flag (basic tier - always enabled)
INSERT INTO feature_flags (id, key, name, description, enabled, rollout_percentage, org_ids, user_ids, metadata)
VALUES (
  '1f000000-0000-0000-0000-00000000000c',
  'notifications',
  'Notifications',
  'Multi-channel notifications (email, SMS, in-app)',
  TRUE,
  100,
  '{}',
  '{}',
  '{"tier": "basic", "module": true, "feature": "F12"}'
) ON CONFLICT (id) DO NOTHING;
