-- F14: Storefronts
-- White-label public storefronts for organizations with custom domains and branding

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE content_format AS ENUM (
  'markdown',
  'html',
  'blocks'      -- For future block editor support
);

CREATE TYPE page_type AS ENUM (
  'custom',     -- User-created page
  'about',      -- About page (special handling)
  'faq',        -- FAQ page (pulls from storefront_faqs)
  'contact',    -- Contact page
  'policies',   -- Terms/policies
  'tickets'     -- Ticket purchase page
);

CREATE TYPE page_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE domain_type AS ENUM (
  'subdomain',   -- org-slug.hauntplatform.com (free)
  'custom'       -- customdomain.com (premium)
);

CREATE TYPE domain_status AS ENUM (
  'pending',     -- Awaiting verification
  'verifying',   -- Verification in progress
  'active',      -- Verified and working
  'failed',      -- Verification failed
  'suspended'    -- Manually suspended
);

CREATE TYPE ssl_status AS ENUM (
  'pending',
  'provisioning',
  'active',
  'expired',
  'failed'
);

CREATE TYPE verification_method AS ENUM (
  'dns_txt',     -- Add TXT record
  'dns_cname',   -- Add CNAME record
  'file'         -- Upload verification file
);

CREATE TYPE nav_link_type AS ENUM (
  'page',        -- Internal page
  'attraction',  -- Attraction detail
  'external',    -- External URL
  'tickets',     -- Ticket purchase
  'home'         -- Homepage
);

CREATE TYPE nav_position AS ENUM (
  'header',
  'footer',
  'both'
);

-- announcement_type already exists from F5, add missing values
ALTER TYPE announcement_type ADD VALUE IF NOT EXISTS 'success';
ALTER TYPE announcement_type ADD VALUE IF NOT EXISTS 'promo';

CREATE TYPE announcement_position AS ENUM (
  'banner',      -- Top of page
  'popup',       -- Modal popup
  'footer'       -- Footer area
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- Storefront Settings
-- Main configuration for the organization's public storefront
CREATE TABLE storefront_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- Branding
  tagline VARCHAR(200),
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  hero_image_url TEXT,
  hero_video_url TEXT,
  hero_title VARCHAR(200),
  hero_subtitle TEXT,

  -- Theme
  theme_preset VARCHAR(50) DEFAULT 'default',
  primary_color VARCHAR(7) DEFAULT '#7C3AED',
  secondary_color VARCHAR(7) DEFAULT '#1F2937',
  accent_color VARCHAR(7) DEFAULT '#F59E0B',
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  text_color VARCHAR(7) DEFAULT '#1F2937',
  font_heading VARCHAR(100) DEFAULT 'Inter',
  font_body VARCHAR(100) DEFAULT 'Inter',
  custom_css TEXT,

  -- Contact & Social
  show_address BOOLEAN DEFAULT TRUE,
  show_phone BOOLEAN DEFAULT TRUE,
  show_email BOOLEAN DEFAULT TRUE,
  social_facebook VARCHAR(255),
  social_instagram VARCHAR(255),
  social_twitter VARCHAR(255),
  social_tiktok VARCHAR(255),
  social_youtube VARCHAR(255),

  -- SEO
  seo_title VARCHAR(70),
  seo_description VARCHAR(160),
  seo_keywords TEXT[],
  og_image_url TEXT,

  -- Analytics
  google_analytics_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  custom_head_scripts TEXT,

  -- Features
  show_attractions BOOLEAN DEFAULT TRUE,
  show_calendar BOOLEAN DEFAULT TRUE,
  show_faq BOOLEAN DEFAULT TRUE,
  show_reviews BOOLEAN DEFAULT FALSE,
  featured_attraction_ids UUID[],

  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX storefront_settings_org_idx ON storefront_settings(org_id);

-- Storefront Pages
-- Custom content pages for the storefront
CREATE TABLE storefront_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  content_format content_format DEFAULT 'markdown',
  page_type page_type DEFAULT 'custom',

  -- SEO
  seo_title VARCHAR(70),
  seo_description VARCHAR(160),
  og_image_url TEXT,

  -- Display
  show_in_nav BOOLEAN DEFAULT TRUE,
  nav_order INTEGER DEFAULT 0,
  icon VARCHAR(50),

  -- Status
  status page_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, slug)
);

CREATE INDEX storefront_pages_org_status_idx ON storefront_pages(org_id, status)
  WHERE status = 'published';
CREATE INDEX storefront_pages_org_nav_idx ON storefront_pages(org_id, show_in_nav, nav_order)
  WHERE show_in_nav = TRUE AND status = 'published';

-- Storefront Domains
-- Custom domain configuration and verification
CREATE TABLE storefront_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  domain_type domain_type NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,

  -- Verification
  verification_token VARCHAR(64),
  verification_method verification_method DEFAULT 'dns_txt',
  verified_at TIMESTAMPTZ,

  -- SSL
  ssl_status ssl_status DEFAULT 'pending',
  ssl_expires_at TIMESTAMPTZ,

  -- Status
  status domain_status DEFAULT 'pending',
  error_message TEXT,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX storefront_domains_domain_idx ON storefront_domains(LOWER(domain));
CREATE INDEX storefront_domains_org_idx ON storefront_domains(org_id);
CREATE INDEX storefront_domains_org_primary_idx ON storefront_domains(org_id)
  WHERE is_primary = TRUE;
CREATE INDEX storefront_domains_status_idx ON storefront_domains(status)
  WHERE status IN ('pending', 'verifying');

-- Storefront Navigation
-- Custom navigation menu items
CREATE TABLE storefront_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  link_type nav_link_type NOT NULL,
  page_id UUID REFERENCES storefront_pages(id) ON DELETE CASCADE,
  external_url TEXT,
  attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
  position nav_position DEFAULT 'header',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  open_in_new_tab BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX storefront_nav_org_idx ON storefront_navigation(org_id, position, sort_order);

-- Storefront FAQs
-- Frequently asked questions
CREATE TABLE storefront_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX storefront_faqs_org_idx ON storefront_faqs(org_id, sort_order)
  WHERE is_published = TRUE;
CREATE INDEX storefront_faqs_attraction_idx ON storefront_faqs(attraction_id)
  WHERE attraction_id IS NOT NULL AND is_published = TRUE;

-- Storefront Announcements
-- Banners and announcements for the storefront
CREATE TABLE storefront_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  link_url TEXT,
  link_text VARCHAR(50),
  type announcement_type DEFAULT 'info',
  position announcement_position DEFAULT 'banner',
  is_dismissible BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX storefront_announcements_active_idx ON storefront_announcements(org_id, starts_at, ends_at)
  WHERE is_active = TRUE;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE storefront_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_announcements ENABLE ROW LEVEL SECURITY;

-- Public read access to published storefronts
CREATE POLICY "Public can view published storefronts"
  ON storefront_settings FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Public can view published pages"
  ON storefront_pages FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM storefront_settings
      WHERE org_id = storefront_pages.org_id
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
      WHERE org_id = storefront_navigation.org_id
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

-- Managers can view all storefront data for their org
CREATE POLICY "Managers can view all storefront settings"
  ON storefront_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_settings.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage storefront settings"
  ON storefront_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_settings.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can view all pages"
  ON storefront_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_pages.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage pages"
  ON storefront_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_pages.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can view all domains"
  ON storefront_domains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_domains.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- Domain management (admin+ only due to DNS complexity)
CREATE POLICY "Admins can manage domains"
  ON storefront_domains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_domains.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can view all navigation"
  ON storefront_navigation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_navigation.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage navigation"
  ON storefront_navigation FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_navigation.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can view all FAQs"
  ON storefront_faqs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_faqs.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage FAQs"
  ON storefront_faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_faqs.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can view all announcements"
  ON storefront_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_announcements.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage announcements"
  ON storefront_announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = storefront_announcements.org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'manager')
        AND status = 'active'
    )
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Generate Domain Verification Token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Resolve Domain to Organization
CREATE OR REPLACE FUNCTION resolve_storefront_domain(p_domain VARCHAR)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Check custom domains first
  SELECT org_id INTO v_org_id
  FROM storefront_domains
  WHERE LOWER(domain) = LOWER(p_domain)
    AND status = 'active';

  IF v_org_id IS NOT NULL THEN
    RETURN v_org_id;
  END IF;

  -- Check subdomain pattern (slug.hauntplatform.com)
  IF p_domain LIKE '%.hauntplatform.com' THEN
    SELECT id INTO v_org_id
    FROM organizations
    WHERE slug = SPLIT_PART(p_domain, '.', 1)
      AND status = 'active';
  END IF;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Storefront by Domain
CREATE OR REPLACE FUNCTION get_storefront_by_domain(p_domain VARCHAR)
RETURNS JSON AS $$
DECLARE
  v_org_id UUID;
  v_result JSON;
BEGIN
  v_org_id := resolve_storefront_domain(p_domain);

  IF v_org_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'org_id', o.id,
    'org_name', o.name,
    'org_slug', o.slug,
    'settings', row_to_json(s),
    'pages', (
      SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
      FROM storefront_pages p
      WHERE p.org_id = o.id AND p.status = 'published'
    ),
    'navigation', (
      SELECT COALESCE(json_agg(row_to_json(n) ORDER BY n.sort_order), '[]'::json)
      FROM storefront_navigation n
      WHERE n.org_id = o.id AND n.is_visible = TRUE
    ),
    'faqs', (
      SELECT COALESCE(json_agg(row_to_json(f) ORDER BY f.sort_order), '[]'::json)
      FROM storefront_faqs f
      WHERE f.org_id = o.id AND f.is_published = TRUE
    ),
    'announcements', (
      SELECT COALESCE(json_agg(row_to_json(a)), '[]'::json)
      FROM storefront_announcements a
      WHERE a.org_id = o.id
        AND a.is_active = TRUE
        AND a.starts_at <= NOW()
        AND (a.ends_at IS NULL OR a.ends_at > NOW())
    )
  ) INTO v_result
  FROM organizations o
  JOIN storefront_settings s ON s.org_id = o.id
  WHERE o.id = v_org_id
    AND s.is_published = TRUE;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure only one primary domain per org
CREATE OR REPLACE FUNCTION ensure_single_primary_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE storefront_domains
    SET is_primary = FALSE
    WHERE org_id = NEW.org_id
      AND id != NEW.id
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_domain_trigger
  BEFORE INSERT OR UPDATE OF is_primary ON storefront_domains
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION ensure_single_primary_domain();

-- Auto-set verification token on domain creation
CREATE OR REPLACE FUNCTION set_verification_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.domain_type = 'custom' AND NEW.verification_token IS NULL THEN
    NEW.verification_token := generate_verification_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_verification_token_trigger
  BEFORE INSERT ON storefront_domains
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_token();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_storefront_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storefront_settings_timestamp
  BEFORE UPDATE ON storefront_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_storefront_timestamp();

CREATE TRIGGER update_storefront_pages_timestamp
  BEFORE UPDATE ON storefront_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_storefront_timestamp();

CREATE TRIGGER update_storefront_domains_timestamp
  BEFORE UPDATE ON storefront_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_storefront_timestamp();

CREATE TRIGGER update_storefront_navigation_timestamp
  BEFORE UPDATE ON storefront_navigation
  FOR EACH ROW
  EXECUTE FUNCTION update_storefront_timestamp();

CREATE TRIGGER update_storefront_faqs_timestamp
  BEFORE UPDATE ON storefront_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_storefront_timestamp();

CREATE TRIGGER update_storefront_announcements_timestamp
  BEFORE UPDATE ON storefront_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_storefront_timestamp();

-- Set published_at when storefront is first published
CREATE OR REPLACE FUNCTION set_storefront_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = TRUE AND OLD.is_published = FALSE AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_storefront_published_at_trigger
  BEFORE UPDATE OF is_published ON storefront_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_storefront_published_at();

-- Set published_at when page is first published
CREATE OR REPLACE FUNCTION set_page_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_page_published_at_trigger
  BEFORE UPDATE OF status ON storefront_pages
  FOR EACH ROW
  EXECUTE FUNCTION set_page_published_at();

-- =============================================================================
-- FEATURE FLAG
-- =============================================================================

INSERT INTO feature_flags (
  key,
  name,
  description,
  enabled,
  rollout_percentage,
  metadata
) VALUES (
  'storefronts',
  'Storefronts',
  'White-label public storefronts with custom domains',
  TRUE,
  100,
  '{"tier": "pro", "module": true}'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

-- Note: custom_domains feature flag is already defined in seed.sql with proper ID
