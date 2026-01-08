# F14: Storefronts - ERD

## Overview

White-label public storefronts for organizations. Each org gets a customizable public-facing website where visitors can view attractions, purchase tickets, and learn about the business. Supports subdomains and custom domains.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        organizations                             │
│                          (from F2)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │ 1:1               │ 1:N               │ 1:N
          ▼                   ▼                   ▼
┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│ storefront_settings │ │ storefront_pages│ │ storefront_domains  │
└─────────────────────┘ └─────────────────┘ └─────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     storefront_settings                          │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id UNIQUE NOT NULL       │
│                                                                  │
│ -- Branding                                                      │
│ tagline         VARCHAR(200)                                     │
│ description     TEXT                                             │
│ logo_url        TEXT                                             │
│ favicon_url     TEXT                                             │
│ hero_image_url  TEXT                                             │
│ hero_video_url  TEXT                                             │
│ hero_title      VARCHAR(200)                                     │
│ hero_subtitle   TEXT                                             │
│                                                                  │
│ -- Theme                                                         │
│ theme_preset    VARCHAR(50) DEFAULT 'default'                    │
│ primary_color   VARCHAR(7) DEFAULT '#7C3AED'                     │
│ secondary_color VARCHAR(7) DEFAULT '#1F2937'                     │
│ accent_color    VARCHAR(7) DEFAULT '#F59E0B'                     │
│ background_color VARCHAR(7) DEFAULT '#FFFFFF'                    │
│ text_color      VARCHAR(7) DEFAULT '#1F2937'                     │
│ font_heading    VARCHAR(100) DEFAULT 'Inter'                     │
│ font_body       VARCHAR(100) DEFAULT 'Inter'                     │
│ custom_css      TEXT                                             │
│                                                                  │
│ -- Contact & Social                                              │
│ show_address    BOOLEAN DEFAULT TRUE                             │
│ show_phone      BOOLEAN DEFAULT TRUE                             │
│ show_email      BOOLEAN DEFAULT TRUE                             │
│ social_facebook VARCHAR(255)                                     │
│ social_instagram VARCHAR(255)                                    │
│ social_twitter  VARCHAR(255)                                     │
│ social_tiktok   VARCHAR(255)                                     │
│ social_youtube  VARCHAR(255)                                     │
│                                                                  │
│ -- SEO                                                           │
│ seo_title       VARCHAR(70)                                      │
│ seo_description VARCHAR(160)                                     │
│ seo_keywords    TEXT[]                                           │
│ og_image_url    TEXT                                             │
│                                                                  │
│ -- Analytics                                                     │
│ google_analytics_id VARCHAR(50)                                  │
│ facebook_pixel_id VARCHAR(50)                                    │
│ custom_head_scripts TEXT                                         │
│                                                                  │
│ -- Features                                                      │
│ show_attractions BOOLEAN DEFAULT TRUE                            │
│ show_calendar   BOOLEAN DEFAULT TRUE                             │
│ show_faq        BOOLEAN DEFAULT TRUE                             │
│ show_reviews    BOOLEAN DEFAULT FALSE                            │
│ featured_attraction_ids UUID[]                                   │
│                                                                  │
│ -- Status                                                        │
│ is_published    BOOLEAN DEFAULT FALSE                            │
│ published_at    TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      storefront_pages                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ slug            VARCHAR(100) NOT NULL                            │
│ title           VARCHAR(200) NOT NULL                            │
│ content         TEXT                                             │
│ content_format  content_format DEFAULT 'markdown'                │
│ page_type       page_type DEFAULT 'custom'                       │
│                                                                  │
│ -- SEO                                                           │
│ seo_title       VARCHAR(70)                                      │
│ seo_description VARCHAR(160)                                     │
│ og_image_url    TEXT                                             │
│                                                                  │
│ -- Display                                                       │
│ show_in_nav     BOOLEAN DEFAULT TRUE                             │
│ nav_order       INTEGER DEFAULT 0                                │
│ icon            VARCHAR(50)                                      │
│                                                                  │
│ -- Status                                                        │
│ status          page_status DEFAULT 'draft'                      │
│ published_at    TIMESTAMPTZ                                      │
│ created_by      UUID FK → profiles.id NOT NULL                   │
│ updated_by      UUID FK → profiles.id                            │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
│                                                                  │
│ UNIQUE(org_id, slug)                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     storefront_domains                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ domain          VARCHAR(255) UNIQUE NOT NULL                     │
│ domain_type     domain_type NOT NULL                             │
│ is_primary      BOOLEAN DEFAULT FALSE                            │
│                                                                  │
│ -- Verification                                                  │
│ verification_token VARCHAR(64)                                   │
│ verification_method verification_method DEFAULT 'dns_txt'        │
│ verified_at     TIMESTAMPTZ                                      │
│                                                                  │
│ -- SSL                                                           │
│ ssl_status      ssl_status DEFAULT 'pending'                     │
│ ssl_expires_at  TIMESTAMPTZ                                      │
│                                                                  │
│ -- Status                                                        │
│ status          domain_status DEFAULT 'pending'                  │
│ error_message   TEXT                                             │
│ last_checked_at TIMESTAMPTZ                                      │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     storefront_navigation                        │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ label           VARCHAR(100) NOT NULL                            │
│ link_type       nav_link_type NOT NULL                           │
│ page_id         UUID FK → storefront_pages.id                    │
│ external_url    TEXT                                             │
│ attraction_id   UUID FK → attractions.id                         │
│ position        nav_position DEFAULT 'header'                    │
│ sort_order      INTEGER DEFAULT 0                                │
│ is_visible      BOOLEAN DEFAULT TRUE                             │
│ open_in_new_tab BOOLEAN DEFAULT FALSE                            │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       storefront_faqs                            │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ attraction_id   UUID FK → attractions.id                         │
│ question        TEXT NOT NULL                                    │
│ answer          TEXT NOT NULL                                    │
│ category        VARCHAR(100)                                     │
│ sort_order      INTEGER DEFAULT 0                                │
│ is_published    BOOLEAN DEFAULT TRUE                             │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    storefront_announcements                      │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK DEFAULT gen_random_uuid()                │
│ org_id          UUID FK → organizations.id NOT NULL              │
│ title           VARCHAR(200) NOT NULL                            │
│ content         TEXT                                             │
│ link_url        TEXT                                             │
│ link_text       VARCHAR(50)                                      │
│ type            announcement_type DEFAULT 'info'                 │
│ position        announcement_position DEFAULT 'banner'           │
│ is_dismissible  BOOLEAN DEFAULT TRUE                             │
│ starts_at       TIMESTAMPTZ DEFAULT NOW()                        │
│ ends_at         TIMESTAMPTZ                                      │
│ is_active       BOOLEAN DEFAULT TRUE                             │
│ created_by      UUID FK → profiles.id NOT NULL                   │
│ created_at      TIMESTAMPTZ DEFAULT NOW()                        │
│ updated_at      TIMESTAMPTZ DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

```sql
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
  'subdomain',   -- org-slug.atrivio.io (free)
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

CREATE TYPE announcement_type AS ENUM (
  'info',
  'warning',
  'success',
  'promo'
);

CREATE TYPE announcement_position AS ENUM (
  'banner',      -- Top of page
  'popup',       -- Modal popup
  'footer'       -- Footer area
);
```

## Tables

### storefront_settings

Main configuration for the organization's public storefront.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Settings ID |
| org_id | UUID | FK, UNIQUE, NOT NULL | Organization (1:1) |
| tagline | VARCHAR(200) | | Short tagline |
| description | TEXT | | About text for homepage |
| logo_url | TEXT | | Storefront logo |
| favicon_url | TEXT | | Browser favicon |
| hero_image_url | TEXT | | Hero background image |
| hero_video_url | TEXT | | Hero background video |
| hero_title | VARCHAR(200) | | Hero headline |
| hero_subtitle | TEXT | | Hero subheadline |
| theme_preset | VARCHAR(50) | DEFAULT 'default' | Theme template |
| primary_color | VARCHAR(7) | DEFAULT '#7C3AED' | Primary brand color |
| secondary_color | VARCHAR(7) | DEFAULT '#1F2937' | Secondary color |
| accent_color | VARCHAR(7) | DEFAULT '#F59E0B' | Accent/CTA color |
| background_color | VARCHAR(7) | DEFAULT '#FFFFFF' | Background color |
| text_color | VARCHAR(7) | DEFAULT '#1F2937' | Text color |
| font_heading | VARCHAR(100) | DEFAULT 'Inter' | Heading font |
| font_body | VARCHAR(100) | DEFAULT 'Inter' | Body font |
| custom_css | TEXT | | Custom CSS overrides |
| show_address | BOOLEAN | DEFAULT TRUE | Display address |
| show_phone | BOOLEAN | DEFAULT TRUE | Display phone |
| show_email | BOOLEAN | DEFAULT TRUE | Display email |
| social_facebook | VARCHAR(255) | | Facebook URL |
| social_instagram | VARCHAR(255) | | Instagram URL |
| social_twitter | VARCHAR(255) | | Twitter/X URL |
| social_tiktok | VARCHAR(255) | | TikTok URL |
| social_youtube | VARCHAR(255) | | YouTube URL |
| seo_title | VARCHAR(70) | | Meta title |
| seo_description | VARCHAR(160) | | Meta description |
| seo_keywords | TEXT[] | | Meta keywords |
| og_image_url | TEXT | | Open Graph image |
| google_analytics_id | VARCHAR(50) | | GA tracking ID |
| facebook_pixel_id | VARCHAR(50) | | FB Pixel ID |
| custom_head_scripts | TEXT | | Custom &lt;head&gt; scripts |
| show_attractions | BOOLEAN | DEFAULT TRUE | Show attractions section |
| show_calendar | BOOLEAN | DEFAULT TRUE | Show event calendar |
| show_faq | BOOLEAN | DEFAULT TRUE | Show FAQ section |
| show_reviews | BOOLEAN | DEFAULT FALSE | Show reviews (future) |
| featured_attraction_ids | UUID[] | | Featured attractions |
| is_published | BOOLEAN | DEFAULT FALSE | Storefront is live |
| published_at | TIMESTAMPTZ | | First publish time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### storefront_pages

Custom content pages for the storefront.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Page ID |
| org_id | UUID | FK, NOT NULL | Organization |
| slug | VARCHAR(100) | NOT NULL | URL slug |
| title | VARCHAR(200) | NOT NULL | Page title |
| content | TEXT | | Page content |
| content_format | content_format | DEFAULT 'markdown' | Content format |
| page_type | page_type | DEFAULT 'custom' | Page type |
| seo_title | VARCHAR(70) | | Meta title |
| seo_description | VARCHAR(160) | | Meta description |
| og_image_url | TEXT | | OG image |
| show_in_nav | BOOLEAN | DEFAULT TRUE | Show in navigation |
| nav_order | INTEGER | DEFAULT 0 | Navigation order |
| icon | VARCHAR(50) | | Nav icon |
| status | page_status | DEFAULT 'draft' | Page status |
| published_at | TIMESTAMPTZ | | Publish time |
| created_by | UUID | FK, NOT NULL | Author |
| updated_by | UUID | FK | Last editor |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### storefront_domains

Custom domain configuration and verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Domain ID |
| org_id | UUID | FK, NOT NULL | Organization |
| domain | VARCHAR(255) | UNIQUE, NOT NULL | Domain name |
| domain_type | domain_type | NOT NULL | Subdomain or custom |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary domain |
| verification_token | VARCHAR(64) | | DNS verification token |
| verification_method | verification_method | DEFAULT 'dns_txt' | Verification method |
| verified_at | TIMESTAMPTZ | | Verification time |
| ssl_status | ssl_status | DEFAULT 'pending' | SSL cert status |
| ssl_expires_at | TIMESTAMPTZ | | SSL expiration |
| status | domain_status | DEFAULT 'pending' | Domain status |
| error_message | TEXT | | Last error |
| last_checked_at | TIMESTAMPTZ | | Last verification check |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### storefront_navigation

Custom navigation menu items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Nav item ID |
| org_id | UUID | FK, NOT NULL | Organization |
| label | VARCHAR(100) | NOT NULL | Display label |
| link_type | nav_link_type | NOT NULL | Link type |
| page_id | UUID | FK | Internal page ref |
| external_url | TEXT | | External URL |
| attraction_id | UUID | FK | Attraction ref |
| position | nav_position | DEFAULT 'header' | Nav position |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_visible | BOOLEAN | DEFAULT TRUE | Is visible |
| open_in_new_tab | BOOLEAN | DEFAULT FALSE | New tab |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### storefront_faqs

Frequently asked questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | FAQ ID |
| org_id | UUID | FK, NOT NULL | Organization |
| attraction_id | UUID | FK | Specific attraction |
| question | TEXT | NOT NULL | Question text |
| answer | TEXT | NOT NULL | Answer text |
| category | VARCHAR(100) | | FAQ category |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_published | BOOLEAN | DEFAULT TRUE | Is visible |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### storefront_announcements

Banners and announcements for the storefront.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Announcement ID |
| org_id | UUID | FK, NOT NULL | Organization |
| title | VARCHAR(200) | NOT NULL | Announcement title |
| content | TEXT | | Additional content |
| link_url | TEXT | | CTA link |
| link_text | VARCHAR(50) | | CTA text |
| type | announcement_type | DEFAULT 'info' | Visual type |
| position | announcement_position | DEFAULT 'banner' | Display position |
| is_dismissible | BOOLEAN | DEFAULT TRUE | Can be dismissed |
| starts_at | TIMESTAMPTZ | DEFAULT NOW() | Start showing |
| ends_at | TIMESTAMPTZ | | Stop showing |
| is_active | BOOLEAN | DEFAULT TRUE | Is active |
| created_by | UUID | FK, NOT NULL | Creator |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## Indexes

```sql
-- Settings
CREATE UNIQUE INDEX storefront_settings_org_idx ON storefront_settings(org_id);

-- Pages
CREATE UNIQUE INDEX storefront_pages_org_slug_idx ON storefront_pages(org_id, slug);
CREATE INDEX storefront_pages_org_status_idx ON storefront_pages(org_id, status)
  WHERE status = 'published';
CREATE INDEX storefront_pages_org_nav_idx ON storefront_pages(org_id, show_in_nav, nav_order)
  WHERE show_in_nav = TRUE AND status = 'published';

-- Domains
CREATE UNIQUE INDEX storefront_domains_domain_idx ON storefront_domains(LOWER(domain));
CREATE INDEX storefront_domains_org_idx ON storefront_domains(org_id);
CREATE INDEX storefront_domains_org_primary_idx ON storefront_domains(org_id)
  WHERE is_primary = TRUE;
CREATE INDEX storefront_domains_status_idx ON storefront_domains(status)
  WHERE status IN ('pending', 'verifying');

-- Navigation
CREATE INDEX storefront_nav_org_idx ON storefront_navigation(org_id, position, sort_order);

-- FAQs
CREATE INDEX storefront_faqs_org_idx ON storefront_faqs(org_id, sort_order)
  WHERE is_published = TRUE;
CREATE INDEX storefront_faqs_attraction_idx ON storefront_faqs(attraction_id)
  WHERE attraction_id IS NOT NULL AND is_published = TRUE;

-- Announcements
CREATE INDEX storefront_announcements_active_idx ON storefront_announcements(org_id, starts_at, ends_at)
  WHERE is_active = TRUE;
```

## RLS Policies

```sql
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

-- Admin management (manager+ can manage storefront)
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
```

## Functions

### Generate Domain Verification Token

```sql
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
```

### Resolve Domain to Organization

```sql
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

  -- Check subdomain pattern (slug.atrivio.io)
  IF p_domain LIKE '%.atrivio.io' THEN
    SELECT id INTO v_org_id
    FROM organizations
    WHERE slug = SPLIT_PART(p_domain, '.', 1)
      AND status = 'active';
  END IF;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql;
```

### Auto-Create Storefront Settings

```sql
CREATE OR REPLACE FUNCTION create_default_storefront()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO storefront_settings (org_id, hero_title)
  VALUES (NEW.id, NEW.name);

  -- Create default subdomain
  INSERT INTO storefront_domains (org_id, domain, domain_type, status, verified_at)
  VALUES (NEW.id, NEW.slug || '.atrivio.io', 'subdomain', 'active', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_storefront_on_org_create
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_storefront();
```

## Business Rules

1. **Auto-Setup**: Storefront settings and subdomain created automatically when org is created.

2. **Subdomain**: Every org gets `{slug}.atrivio.io` free and pre-verified.

3. **Custom Domains**: Require DNS verification before activation. Premium feature.

4. **Primary Domain**: Only one domain can be primary (used for canonical URLs).

5. **SSL**: Automatically provisioned for verified domains via Let's Encrypt/Cloudflare.

6. **Publishing**: Storefront must be explicitly published to be visible to public.

7. **Page Slugs**: Must be unique within org. Reserved slugs: tickets, cart, checkout.

8. **SEO Defaults**: If page SEO fields empty, fall back to storefront-level settings.

## URL Structure

| URL Pattern | Description |
|-------------|-------------|
| `{domain}/` | Homepage |
| `{domain}/attractions` | All attractions |
| `{domain}/attractions/{slug}` | Single attraction |
| `{domain}/tickets` | Ticket purchase |
| `{domain}/cart` | Shopping cart |
| `{domain}/checkout` | Checkout flow |
| `{domain}/p/{slug}` | Custom pages |
| `{domain}/faq` | FAQ page |
| `{domain}/contact` | Contact page |

## Dependencies

- **F2 Organizations**: org_id references
- **F3 Attractions**: featured attractions, attraction pages
- **F8 Ticketing**: ticket purchase integration

## Migration Order

1. Create enums
2. Create storefront_settings table
3. Create storefront_pages table
4. Create storefront_domains table
5. Create storefront_navigation table
6. Create storefront_faqs table
7. Create storefront_announcements table
8. Create indexes
9. Create RLS policies
10. Create functions
11. Create triggers
