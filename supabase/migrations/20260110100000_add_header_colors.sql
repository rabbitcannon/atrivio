-- Add header color customization to storefront_settings
-- Allows separate control over header/navigation appearance

ALTER TABLE storefront_settings
  ADD COLUMN IF NOT EXISTS header_bg_color VARCHAR(7),
  ADD COLUMN IF NOT EXISTS header_text_color VARCHAR(7);

-- Comments
COMMENT ON COLUMN storefront_settings.header_bg_color IS 'Header/navigation background color in hex format. NULL = transparent/use background_color';
COMMENT ON COLUMN storefront_settings.header_text_color IS 'Header/navigation text color in hex format. NULL = use text_color';
