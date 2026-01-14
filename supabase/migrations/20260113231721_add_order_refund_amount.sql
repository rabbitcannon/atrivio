-- Add refund_amount column to orders table for partial refund tracking
-- This allows tracking the actual refund amount instead of assuming full refunds

ALTER TABLE orders ADD COLUMN refund_amount INTEGER DEFAULT 0;

-- Add index for analytics queries on refunded orders
CREATE INDEX orders_refunded_idx ON orders(org_id, status, refund_amount) WHERE status = 'refunded';

-- Add comment for documentation
COMMENT ON COLUMN orders.refund_amount IS 'Refund amount in cents. For partial refunds, this may be less than total. Updated by Stripe webhook on refund events.';
