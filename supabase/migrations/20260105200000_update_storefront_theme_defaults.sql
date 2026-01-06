-- Migration: Update storefront theme defaults
-- Description: Updates default theme values to use the 'dark' preset colors
-- This ensures new storefronts get a proper dark theme by default

-- Update column defaults for storefront_settings
ALTER TABLE storefront_settings
  ALTER COLUMN theme_preset SET DEFAULT 'dark',
  ALTER COLUMN primary_color SET DEFAULT '#dc2626',      -- Red-600
  ALTER COLUMN secondary_color SET DEFAULT '#1f2937',    -- Gray-800
  ALTER COLUMN accent_color SET DEFAULT '#f59e0b',       -- Amber-500
  ALTER COLUMN background_color SET DEFAULT '#0a0a0a',   -- Near black
  ALTER COLUMN text_color SET DEFAULT '#f5f5f5';         -- Gray-100

-- Add comment documenting the theme system
COMMENT ON COLUMN storefront_settings.theme_preset IS 'Theme preset key (dark, light, horror, vintage, neon, blood-moon, forest, carnival). See @haunt/shared/constants/themes for definitions.';
COMMENT ON COLUMN storefront_settings.primary_color IS 'Primary brand color in hex format (#RRGGBB)';
COMMENT ON COLUMN storefront_settings.secondary_color IS 'Secondary color for cards/sections in hex format';
COMMENT ON COLUMN storefront_settings.accent_color IS 'Accent color for highlights/badges in hex format';
COMMENT ON COLUMN storefront_settings.background_color IS 'Page background color in hex format';
COMMENT ON COLUMN storefront_settings.text_color IS 'Main text color in hex format';
