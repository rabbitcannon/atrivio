-- ============================================================================
-- F15: Media Management - Cloudflare R2 Integration
-- ============================================================================
-- Org-scoped media storage with tier-based limits
-- Free: URL linking only (no uploads)
-- Pro: 500MB storage
-- Enterprise: 5GB storage

-- ============================================================================
-- Media Table
-- ============================================================================

CREATE TABLE org_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),

  -- File info
  key TEXT NOT NULL,                    -- R2 object key: {org_id}/{uuid}.{ext}
  filename TEXT NOT NULL,               -- Original filename
  content_type TEXT NOT NULL,           -- MIME type
  size_bytes BIGINT NOT NULL,           -- File size in bytes

  -- URL
  url TEXT NOT NULL,                    -- Public CDN URL

  -- Image metadata (optional)
  width INTEGER,                        -- Image width in pixels
  height INTEGER,                       -- Image height in pixels
  alt_text TEXT,                        -- Alt text for accessibility

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,               -- Soft delete for cleanup

  CONSTRAINT unique_media_key UNIQUE(key)
);

-- Indexes
CREATE INDEX idx_org_media_org_id ON org_media(org_id);
CREATE INDEX idx_org_media_org_created ON org_media(org_id, created_at DESC);
CREATE INDEX idx_org_media_deleted ON org_media(org_id, deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE org_media ENABLE ROW LEVEL SECURITY;

-- Users can view media in their orgs
CREATE POLICY "Users can view own org media"
  ON org_media FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Users with appropriate roles can upload media
CREATE POLICY "Users can upload to own org"
  ON org_media FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Admins can soft-delete media (update deleted_at)
CREATE POLICY "Admins can delete own org media"
  ON org_media FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- Storage Limit Functions
-- ============================================================================

-- Get total storage used by an org (in bytes)
CREATE OR REPLACE FUNCTION get_org_storage_used(p_org_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(size_bytes)
     FROM org_media
     WHERE org_id = p_org_id AND deleted_at IS NULL),
    0
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Get storage limit for org based on tier (in bytes)
CREATE OR REPLACE FUNCTION get_org_storage_limit(p_org_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM organizations
  WHERE id = p_org_id;

  CASE v_tier
    WHEN 'free' THEN RETURN 0;                          -- No uploads
    WHEN 'pro' THEN RETURN 524288000;                   -- 500MB
    WHEN 'enterprise' THEN RETURN 5368709120;           -- 5GB
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if org can upload (has remaining storage)
CREATE OR REPLACE FUNCTION can_org_upload(p_org_id UUID, p_file_size BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit BIGINT;
  v_used BIGINT;
BEGIN
  v_limit := get_org_storage_limit(p_org_id);

  -- Free tier cannot upload
  IF v_limit = 0 THEN
    RETURN FALSE;
  END IF;

  v_used := get_org_storage_used(p_org_id);

  RETURN (v_used + p_file_size) <= v_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Update Tier Config with Storage Limits
-- ============================================================================

-- Add storage_limit_bytes column to subscription_tier_config
ALTER TABLE subscription_tier_config
ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT NOT NULL DEFAULT 0;

-- Update tier configs with storage limits
UPDATE subscription_tier_config
SET storage_limit_bytes = 0
WHERE tier = 'free';

UPDATE subscription_tier_config
SET storage_limit_bytes = 524288000  -- 500MB
WHERE tier = 'pro';

UPDATE subscription_tier_config
SET storage_limit_bytes = 5368709120  -- 5GB
WHERE tier = 'enterprise';

-- Add media_uploads to pro and enterprise features array
UPDATE subscription_tier_config
SET features = array_append(features, 'media_uploads')
WHERE tier IN ('pro', 'enterprise')
AND NOT ('media_uploads' = ANY(features));

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE org_media IS 'Organization media files stored in Cloudflare R2';
COMMENT ON COLUMN org_media.key IS 'R2 object key in format: {org_id}/{uuid}.{ext}';
COMMENT ON COLUMN org_media.size_bytes IS 'File size in bytes for storage quota tracking';
COMMENT ON COLUMN org_media.deleted_at IS 'Soft delete timestamp - files cleaned up by background job';
COMMENT ON COLUMN subscription_tier_config.storage_limit_bytes IS 'Max storage in bytes (0 = no uploads allowed)';
