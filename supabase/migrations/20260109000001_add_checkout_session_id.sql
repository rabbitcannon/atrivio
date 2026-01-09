-- Add stripe_checkout_session_id column to orders table
-- This stores the Stripe Checkout Session ID for redirect-based checkout flow

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255);

-- Create index for looking up orders by checkout session
CREATE INDEX IF NOT EXISTS orders_checkout_session_idx ON orders(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

COMMENT ON COLUMN orders.stripe_checkout_session_id IS 'Stripe Checkout Session ID for hosted checkout flow';
