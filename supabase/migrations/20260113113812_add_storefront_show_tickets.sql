-- Add show_tickets column to storefront_settings
-- Controls visibility of the tickets section on the public storefront

ALTER TABLE storefront_settings
ADD COLUMN IF NOT EXISTS show_tickets BOOLEAN DEFAULT TRUE;

-- Add comment for documentation
COMMENT ON COLUMN storefront_settings.show_tickets IS 'Whether to show the tickets section on the public storefront';
