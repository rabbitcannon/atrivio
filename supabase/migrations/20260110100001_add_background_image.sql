-- Add background image support to storefront themes
-- Allows linking external images as page backgrounds

ALTER TABLE storefront_settings
ADD COLUMN IF NOT EXISTS background_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_position VARCHAR(50) DEFAULT 'center',
ADD COLUMN IF NOT EXISTS background_size VARCHAR(50) DEFAULT 'cover',
ADD COLUMN IF NOT EXISTS background_repeat VARCHAR(50) DEFAULT 'no-repeat',
ADD COLUMN IF NOT EXISTS background_attachment VARCHAR(50) DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS background_overlay VARCHAR(20);

-- Add comments for documentation
COMMENT ON COLUMN storefront_settings.background_image_url IS 'URL to external background image';
COMMENT ON COLUMN storefront_settings.background_position IS 'CSS background-position (center, top, bottom, left, right)';
COMMENT ON COLUMN storefront_settings.background_size IS 'CSS background-size (cover, contain, auto)';
COMMENT ON COLUMN storefront_settings.background_repeat IS 'CSS background-repeat (no-repeat, repeat, repeat-x, repeat-y)';
COMMENT ON COLUMN storefront_settings.background_attachment IS 'CSS background-attachment (scroll, fixed)';
COMMENT ON COLUMN storefront_settings.background_overlay IS 'Overlay color with opacity (e.g., rgba(0,0,0,0.5))';
