-- ============================================================================
-- Drop rollout_percentage - feature access is now fully tier-based
-- ============================================================================

ALTER TABLE feature_flags DROP COLUMN IF EXISTS rollout_percentage;
