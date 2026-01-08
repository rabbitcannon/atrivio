-- Add active column to platform_announcements
-- This provides explicit control over announcement visibility independent of date scheduling

ALTER TABLE platform_announcements
ADD COLUMN active boolean NOT NULL DEFAULT true;

-- Update RLS policy to also check active status
DROP POLICY IF EXISTS "Anyone can view active announcements" ON platform_announcements;

CREATE POLICY "Anyone can view active announcements" ON platform_announcements
FOR SELECT
USING (
  active = true
  AND starts_at <= now()
  AND (expires_at IS NULL OR expires_at > now())
);

COMMENT ON COLUMN platform_announcements.active IS 'Manual toggle for announcement visibility. Works in conjunction with starts_at/expires_at.';
