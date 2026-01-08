-- F14: Refactor Storefronts to Per-Attraction
-- Each attraction gets its own storefront instead of one per organization

-- =============================================================================
-- DROP EXISTING CONSTRAINTS AND INDEXES
-- =============================================================================

-- Drop the unique constraint on org_id for settings
DROP INDEX IF EXISTS storefront_settings_org_idx;

-- Drop unique constraint on pages
ALTER TABLE storefront_pages DROP CONSTRAINT IF EXISTS storefront_pages_org_id_slug_key;
DROP INDEX IF EXISTS storefront_pages_org_status_idx;
DROP INDEX IF EXISTS storefront_pages_org_nav_idx;

-- Drop indexes on domains
DROP INDEX IF EXISTS storefront_domains_org_idx;
DROP INDEX IF EXISTS storefront_domains_org_primary_idx;

-- Drop index on navigation
DROP INDEX IF EXISTS storefront_nav_org_idx;
DROP INDEX IF EXISTS storefront_nav_attraction_idx;

-- Drop indexes on faqs
DROP INDEX IF EXISTS storefront_faqs_org_idx;
DROP INDEX IF EXISTS storefront_faqs_attraction_idx;

-- Drop index on announcements
DROP INDEX IF EXISTS storefront_announcements_active_idx;

-- =============================================================================
-- ADD ATTRACTION_ID TO ALL TABLES
-- =============================================================================

-- storefront_settings: Add attraction_id, make it the unique key
ALTER TABLE storefront_settings
  ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE;

-- For existing data, we need to populate attraction_id
-- We'll take the first attraction for each org (if any)
UPDATE storefront_settings ss
SET attraction_id = (
  SELECT a.id
  FROM attractions a
  WHERE a.org_id = ss.org_id
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE ss.attraction_id IS NULL;

-- Remove the unique constraint on org_id
ALTER TABLE storefront_settings DROP CONSTRAINT IF EXISTS storefront_settings_org_id_key;

-- Make attraction_id required and unique
ALTER TABLE storefront_settings
  ALTER COLUMN attraction_id SET NOT NULL;

CREATE UNIQUE INDEX storefront_settings_attraction_idx ON storefront_settings(attraction_id);
CREATE INDEX storefront_settings_org_idx ON storefront_settings(org_id);

-- storefront_pages: Add attraction_id
ALTER TABLE storefront_pages
  ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE;

-- Populate from existing org_id
UPDATE storefront_pages sp
SET attraction_id = (
  SELECT ss.attraction_id
  FROM storefront_settings ss
  WHERE ss.org_id = sp.org_id
  LIMIT 1
)
WHERE sp.attraction_id IS NULL;

-- For pages without matching settings, use first attraction
UPDATE storefront_pages sp
SET attraction_id = (
  SELECT a.id
  FROM attractions a
  WHERE a.org_id = sp.org_id
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE sp.attraction_id IS NULL;

-- Delete orphaned pages (no attraction found)
DELETE FROM storefront_pages WHERE attraction_id IS NULL;

ALTER TABLE storefront_pages
  ALTER COLUMN attraction_id SET NOT NULL;

-- Update unique constraint: slug unique per attraction
CREATE UNIQUE INDEX storefront_pages_attraction_slug_idx ON storefront_pages(attraction_id, slug);
CREATE INDEX storefront_pages_attraction_status_idx ON storefront_pages(attraction_id, status)
  WHERE status = 'published';
CREATE INDEX storefront_pages_attraction_nav_idx ON storefront_pages(attraction_id, show_in_nav, nav_order)
  WHERE show_in_nav = TRUE AND status = 'published';
CREATE INDEX storefront_pages_org_idx ON storefront_pages(org_id);

-- storefront_domains: Add attraction_id
ALTER TABLE storefront_domains
  ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE;

-- Populate from existing org_id
UPDATE storefront_domains sd
SET attraction_id = (
  SELECT ss.attraction_id
  FROM storefront_settings ss
  WHERE ss.org_id = sd.org_id
  LIMIT 1
)
WHERE sd.attraction_id IS NULL;

-- For domains without matching settings, use first attraction
UPDATE storefront_domains sd
SET attraction_id = (
  SELECT a.id
  FROM attractions a
  WHERE a.org_id = sd.org_id
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE sd.attraction_id IS NULL;

-- Delete orphaned domains
DELETE FROM storefront_domains WHERE attraction_id IS NULL;

ALTER TABLE storefront_domains
  ALTER COLUMN attraction_id SET NOT NULL;

-- Primary domain is per-attraction now
CREATE INDEX storefront_domains_attraction_idx ON storefront_domains(attraction_id);
CREATE INDEX storefront_domains_attraction_primary_idx ON storefront_domains(attraction_id)
  WHERE is_primary = TRUE;
CREATE INDEX storefront_domains_org_idx ON storefront_domains(org_id);

-- storefront_navigation: Add attraction_id
ALTER TABLE storefront_navigation
  ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE;

UPDATE storefront_navigation sn
SET attraction_id = (
  SELECT ss.attraction_id
  FROM storefront_settings ss
  WHERE ss.org_id = sn.org_id
  LIMIT 1
)
WHERE sn.attraction_id IS NULL;

UPDATE storefront_navigation sn
SET attraction_id = (
  SELECT a.id
  FROM attractions a
  WHERE a.org_id = sn.org_id
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE sn.attraction_id IS NULL;

DELETE FROM storefront_navigation WHERE attraction_id IS NULL;

ALTER TABLE storefront_navigation
  ALTER COLUMN attraction_id SET NOT NULL;

CREATE INDEX storefront_nav_attraction_idx ON storefront_navigation(attraction_id, position, sort_order);
CREATE INDEX storefront_nav_org_idx ON storefront_navigation(org_id);

-- storefront_faqs: attraction_id already exists as optional, make it required
-- FAQs can still be attraction-specific within the storefront
UPDATE storefront_faqs sf
SET attraction_id = (
  SELECT ss.attraction_id
  FROM storefront_settings ss
  WHERE ss.org_id = sf.org_id
  LIMIT 1
)
WHERE sf.attraction_id IS NULL;

UPDATE storefront_faqs sf
SET attraction_id = (
  SELECT a.id
  FROM attractions a
  WHERE a.org_id = sf.org_id
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE sf.attraction_id IS NULL;

DELETE FROM storefront_faqs WHERE attraction_id IS NULL;

ALTER TABLE storefront_faqs
  ALTER COLUMN attraction_id SET NOT NULL;

CREATE INDEX storefront_faqs_attraction_idx ON storefront_faqs(attraction_id, sort_order)
  WHERE is_published = TRUE;
CREATE INDEX storefront_faqs_org_idx ON storefront_faqs(org_id);

-- storefront_announcements: Add attraction_id
ALTER TABLE storefront_announcements
  ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE;

UPDATE storefront_announcements sa
SET attraction_id = (
  SELECT ss.attraction_id
  FROM storefront_settings ss
  WHERE ss.org_id = sa.org_id
  LIMIT 1
)
WHERE sa.attraction_id IS NULL;

UPDATE storefront_announcements sa
SET attraction_id = (
  SELECT a.id
  FROM attractions a
  WHERE a.org_id = sa.org_id
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE sa.attraction_id IS NULL;

DELETE FROM storefront_announcements WHERE attraction_id IS NULL;

ALTER TABLE storefront_announcements
  ALTER COLUMN attraction_id SET NOT NULL;

CREATE INDEX storefront_announcements_attraction_idx ON storefront_announcements(attraction_id, starts_at, ends_at)
  WHERE is_active = TRUE;
CREATE INDEX storefront_announcements_org_idx ON storefront_announcements(org_id);

-- =============================================================================
-- UPDATE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published storefronts" ON storefront_settings;
DROP POLICY IF EXISTS "Public can view published pages" ON storefront_pages;
DROP POLICY IF EXISTS "Public can view active domains" ON storefront_domains;
DROP POLICY IF EXISTS "Public can view visible navigation" ON storefront_navigation;
DROP POLICY IF EXISTS "Public can view published FAQs" ON storefront_faqs;
DROP POLICY IF EXISTS "Public can view active announcements" ON storefront_announcements;
DROP POLICY IF EXISTS "Managers can view all storefront settings" ON storefront_settings;
DROP POLICY IF EXISTS "Managers can manage storefront settings" ON storefront_settings;
DROP POLICY IF EXISTS "Managers can view all pages" ON storefront_pages;
DROP POLICY IF EXISTS "Managers can manage pages" ON storefront_pages;
DROP POLICY IF EXISTS "Managers can view all domains" ON storefront_domains;
DROP POLICY IF EXISTS "Admins can manage domains" ON storefront_domains;
DROP POLICY IF EXISTS "Managers can view all navigation" ON storefront_navigation;
DROP POLICY IF EXISTS "Managers can manage navigation" ON storefront_navigation;
DROP POLICY IF EXISTS "Managers can view all FAQs" ON storefront_faqs;
DROP POLICY IF EXISTS "Managers can manage FAQs" ON storefront_faqs;
DROP POLICY IF EXISTS "Managers can view all announcements" ON storefront_announcements;
DROP POLICY IF EXISTS "Managers can manage announcements" ON storefront_announcements;

-- Public read access to published storefronts (by attraction)
CREATE POLICY "Public can view published storefronts"
  ON storefront_settings FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Public can view published pages"
  ON storefront_pages FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM storefront_settings
      WHERE attraction_id = storefront_pages.attraction_id
        AND is_published = TRUE
    )
  );

CREATE POLICY "Public can view active domains"
  ON storefront_domains FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view visible navigation"
  ON storefront_navigation FOR SELECT
  USING (
    is_visible = TRUE
    AND EXISTS (
      SELECT 1 FROM storefront_settings
      WHERE attraction_id = storefront_navigation.attraction_id
        AND is_published = TRUE
    )
  );

CREATE POLICY "Public can view published FAQs"
  ON storefront_faqs FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Public can view active announcements"
  ON storefront_announcements FOR SELECT
  USING (
    is_active = TRUE
    AND starts_at <= NOW()
    AND (ends_at IS NULL OR ends_at > NOW())
  );

-- Manager policies (check org membership through attraction)
CREATE POLICY "Managers can view all storefront settings"
  ON storefront_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_settings.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can manage storefront settings"
  ON storefront_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_settings.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can view all pages"
  ON storefront_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_pages.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can manage pages"
  ON storefront_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_pages.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can view all domains"
  ON storefront_domains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_domains.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Admins can manage domains"
  ON storefront_domains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_domains.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can view all navigation"
  ON storefront_navigation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_navigation.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can manage navigation"
  ON storefront_navigation FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_navigation.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can view all FAQs"
  ON storefront_faqs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_faqs.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can manage FAQs"
  ON storefront_faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_faqs.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can view all announcements"
  ON storefront_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_announcements.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Managers can manage announcements"
  ON storefront_announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN attractions a ON a.org_id = om.org_id
      WHERE a.id = storefront_announcements.attraction_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
        AND om.status = 'active'
    )
  );

-- =============================================================================
-- UPDATE FUNCTIONS
-- =============================================================================

-- Drop existing functions that have different signatures
DROP FUNCTION IF EXISTS resolve_storefront_domain(VARCHAR);
DROP FUNCTION IF EXISTS get_storefront_by_domain(VARCHAR);
DROP FUNCTION IF EXISTS get_public_storefront(UUID);

-- Resolve Domain to Attraction
CREATE OR REPLACE FUNCTION resolve_storefront_domain(p_domain VARCHAR)
RETURNS TABLE(org_id UUID, attraction_id UUID) AS $$
BEGIN
  -- Check custom domains first
  RETURN QUERY
  SELECT sd.org_id, sd.attraction_id
  FROM storefront_domains sd
  WHERE LOWER(sd.domain) = LOWER(p_domain)
    AND sd.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    -- Check subdomain pattern (slug.atrivio.io)
    IF p_domain LIKE '%.atrivio.io' THEN
      -- First try attraction slug
      RETURN QUERY
      SELECT a.org_id, a.id as attraction_id
      FROM attractions a
      WHERE a.slug = SPLIT_PART(p_domain, '.', 1)
        AND a.status = 'active'
      LIMIT 1;

      -- If no attraction found, try org slug with first attraction
      IF NOT FOUND THEN
        RETURN QUERY
        SELECT o.id as org_id, a.id as attraction_id
        FROM organizations o
        JOIN attractions a ON a.org_id = o.id
        WHERE o.slug = SPLIT_PART(p_domain, '.', 1)
          AND o.status = 'active'
        ORDER BY a.created_at ASC
        LIMIT 1;
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Storefront by Domain (updated for attraction)
CREATE OR REPLACE FUNCTION get_storefront_by_domain(p_domain VARCHAR)
RETURNS JSON AS $$
DECLARE
  v_org_id UUID;
  v_attraction_id UUID;
  v_result JSON;
BEGIN
  SELECT org_id, attraction_id INTO v_org_id, v_attraction_id
  FROM resolve_storefront_domain(p_domain);

  IF v_attraction_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'org_id', o.id,
    'org_name', o.name,
    'org_slug', o.slug,
    'attraction_id', a.id,
    'attraction_name', a.name,
    'attraction_slug', a.slug,
    'settings', row_to_json(s),
    'pages', (
      SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
      FROM storefront_pages p
      WHERE p.attraction_id = a.id AND p.status = 'published'
    ),
    'navigation', (
      SELECT COALESCE(json_agg(row_to_json(n) ORDER BY n.sort_order), '[]'::json)
      FROM storefront_navigation n
      WHERE n.attraction_id = a.id AND n.is_visible = TRUE
    ),
    'faqs', (
      SELECT COALESCE(json_agg(row_to_json(f) ORDER BY f.sort_order), '[]'::json)
      FROM storefront_faqs f
      WHERE f.attraction_id = a.id AND f.is_published = TRUE
    ),
    'announcements', (
      SELECT COALESCE(json_agg(row_to_json(ann)), '[]'::json)
      FROM storefront_announcements ann
      WHERE ann.attraction_id = a.id
        AND ann.is_active = TRUE
        AND ann.starts_at <= NOW()
        AND (ann.ends_at IS NULL OR ann.ends_at > NOW())
    )
  ) INTO v_result
  FROM attractions a
  JOIN organizations o ON o.id = a.org_id
  JOIN storefront_settings s ON s.attraction_id = a.id
  WHERE a.id = v_attraction_id
    AND s.is_published = TRUE;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update primary domain trigger to be per-attraction
CREATE OR REPLACE FUNCTION ensure_single_primary_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE storefront_domains
    SET is_primary = FALSE
    WHERE attraction_id = NEW.attraction_id
      AND id != NEW.id
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS ensure_single_primary_domain_trigger ON storefront_domains;
CREATE TRIGGER ensure_single_primary_domain_trigger
  BEFORE INSERT OR UPDATE OF is_primary ON storefront_domains
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION ensure_single_primary_domain();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE storefront_settings IS 'Per-attraction storefront configuration and branding';
COMMENT ON COLUMN storefront_settings.attraction_id IS 'The attraction this storefront belongs to';
COMMENT ON TABLE storefront_pages IS 'Custom content pages for an attraction''s storefront';
COMMENT ON TABLE storefront_domains IS 'Custom domains for an attraction''s storefront';
COMMENT ON TABLE storefront_navigation IS 'Navigation menu items for an attraction''s storefront';
COMMENT ON TABLE storefront_faqs IS 'FAQs for an attraction''s storefront';
COMMENT ON TABLE storefront_announcements IS 'Announcements for an attraction''s storefront';
