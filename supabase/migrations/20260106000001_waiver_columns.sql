-- ============================================================================
-- F17: Add waiver support columns
-- ============================================================================
-- Adds:
-- 1. requires_waiver column to ticket_types table
-- 2. waiver_text column to attractions table
-- ============================================================================

-- Add waiver requirement to ticket types
ALTER TABLE ticket_types
ADD COLUMN requires_waiver BOOLEAN DEFAULT FALSE NOT NULL;

COMMENT ON COLUMN ticket_types.requires_waiver IS 'Whether guests must sign a waiver to use this ticket type';

-- Add waiver text to attractions (template for this attraction)
ALTER TABLE attractions
ADD COLUMN waiver_text TEXT;

COMMENT ON COLUMN attractions.waiver_text IS 'Liability waiver text that guests must accept. Can include markdown.';

-- Create index for efficient waiver checks during check-in
CREATE INDEX ticket_types_waiver_idx ON ticket_types(id) WHERE requires_waiver = TRUE;
