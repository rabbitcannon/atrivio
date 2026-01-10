-- Add 'faq' to nav_link_type enum for linking to FAQ page in navigation
ALTER TYPE nav_link_type ADD VALUE IF NOT EXISTS 'faq';

COMMENT ON TYPE nav_link_type IS 'Navigation link types: page, attraction, external, tickets, home, faq';
