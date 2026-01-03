-- ============================================================================
-- F8: TICKETING
-- Ticket sales system with timed entry, multiple ticket types, promo codes
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE slot_status AS ENUM (
  'available',
  'limited',
  'sold_out',
  'closed'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'canceled',
  'refunded',
  'partially_refunded',
  'expired'
);

CREATE TYPE ticket_status AS ENUM (
  'valid',
  'used',
  'voided',
  'expired',
  'transferred'
);

CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed_amount',
  'fixed_price'
);

-- ============================================================================
-- LOOKUP TABLES
-- ============================================================================

-- Ticket Categories (system defaults + org-specific)
CREATE TABLE ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  badge_text VARCHAR(20),
  default_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, key)
);

CREATE INDEX ticket_categories_org_idx ON ticket_categories(org_id);
CREATE INDEX ticket_categories_active_idx ON ticket_categories(org_id, is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_ticket_categories_updated_at
  BEFORE UPDATE ON ticket_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Order Sources (system defaults + org-specific)
CREATE TABLE order_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  commission_rate INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, key)
);

CREATE INDEX order_sources_org_idx ON order_sources(org_id);
CREATE INDEX order_sources_active_idx ON order_sources(org_id, is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_order_sources_updated_at
  BEFORE UPDATE ON order_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TICKET TYPES
-- ============================================================================

CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  compare_price INTEGER,
  category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL,
  max_per_order INTEGER DEFAULT 10,
  min_per_order INTEGER DEFAULT 1,
  capacity INTEGER,
  sold_count INTEGER DEFAULT 0,
  includes TEXT[],
  restrictions JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ticket_types_org_idx ON ticket_types(org_id);
CREATE INDEX ticket_types_attraction_idx ON ticket_types(attraction_id);
CREATE INDEX ticket_types_season_idx ON ticket_types(season_id);
CREATE INDEX ticket_types_active_idx ON ticket_types(attraction_id, is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_ticket_types_updated_at
  BEFORE UPDATE ON ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TIME SLOTS
-- ============================================================================

CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0,
  held_count INTEGER DEFAULT 0,
  status slot_status DEFAULT 'available',
  price_modifier INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attraction_id, date, start_time)
);

CREATE INDEX time_slots_org_idx ON time_slots(org_id);
CREATE INDEX time_slots_attraction_idx ON time_slots(attraction_id);
CREATE INDEX time_slots_date_idx ON time_slots(attraction_id, date);
CREATE INDEX time_slots_available_idx ON time_slots(attraction_id, date, status) WHERE status = 'available';

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PROMO CODES
-- ============================================================================

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100),
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value INTEGER NOT NULL,
  min_order_amount INTEGER,
  max_discount INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  applies_to UUID[],
  excludes UUID[],
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

CREATE UNIQUE INDEX promo_codes_org_code_idx ON promo_codes(org_id, UPPER(code));
CREATE INDEX promo_codes_org_idx ON promo_codes(org_id);
CREATE INDEX promo_codes_active_idx ON promo_codes(org_id, is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(200),
  customer_phone VARCHAR(20),
  subtotal INTEGER NOT NULL,
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status order_status DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  source_id UUID REFERENCES order_sources(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX orders_org_idx ON orders(org_id);
CREATE INDEX orders_attraction_idx ON orders(attraction_id);
CREATE INDEX orders_customer_idx ON orders(customer_email);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_idx ON orders(created_at DESC);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE RESTRICT,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX order_items_order_idx ON order_items(order_id);
CREATE INDEX order_items_ticket_type_idx ON order_items(ticket_type_id);
CREATE INDEX order_items_time_slot_idx ON order_items(time_slot_id);

-- ============================================================================
-- TICKETS
-- ============================================================================

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE RESTRICT,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE RESTRICT,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  qr_code_url TEXT,
  guest_name VARCHAR(200),
  status ticket_status DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES profiles(id),
  void_reason TEXT,
  transferred_from UUID REFERENCES tickets(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX tickets_org_idx ON tickets(org_id);
CREATE INDEX tickets_order_idx ON tickets(order_id);
CREATE INDEX tickets_barcode_idx ON tickets(barcode);
CREATE INDEX tickets_status_idx ON tickets(status);
CREATE INDEX tickets_slot_idx ON tickets(time_slot_id);
CREATE INDEX tickets_ticket_number_idx ON tickets(ticket_number);

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CART SESSIONS
-- ============================================================================

CREATE TABLE cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  customer_email VARCHAR(255),
  items JSONB NOT NULL DEFAULT '[]',
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  subtotal INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  held_slots UUID[],
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cart_sessions_org_idx ON cart_sessions(org_id);
CREATE INDEX cart_sessions_token_idx ON cart_sessions(session_token);
CREATE INDEX cart_sessions_expires_idx ON cart_sessions(expires_at);

CREATE TRIGGER update_cart_sessions_updated_at
  BEFORE UPDATE ON cart_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TICKET WAIVERS
-- ============================================================================

CREATE TABLE ticket_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  waiver_type VARCHAR(100) NOT NULL,
  guest_name VARCHAR(200) NOT NULL,
  guest_email VARCHAR(255),
  guest_dob DATE,
  guardian_name VARCHAR(200),
  guardian_email VARCHAR(255),
  signed_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  signature_data TEXT,
  waiver_version VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ticket_waivers_ticket_idx ON ticket_waivers(ticket_id);
CREATE INDEX ticket_waivers_org_idx ON ticket_waivers(org_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate Order Number
CREATE OR REPLACE FUNCTION generate_order_number(p_org_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_prefix VARCHAR(3);
  v_sequence INTEGER;
  v_number VARCHAR(20);
BEGIN
  -- Get org prefix (first 3 chars of slug, uppercase)
  SELECT UPPER(LEFT(slug, 3)) INTO v_prefix FROM organizations WHERE id = p_org_id;

  -- Get next sequence for this org
  SELECT COALESCE(MAX(CAST(RIGHT(order_number, 8) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM orders
  WHERE org_id = p_org_id;

  v_number := v_prefix || '-' || LPAD(v_sequence::TEXT, 8, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Generate Ticket Number
CREATE OR REPLACE FUNCTION generate_ticket_number(p_org_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_prefix VARCHAR(3);
  v_sequence INTEGER;
  v_number VARCHAR(20);
BEGIN
  -- Get org prefix (first 3 chars of slug, uppercase)
  SELECT UPPER(LEFT(slug, 3)) INTO v_prefix FROM organizations WHERE id = p_org_id;

  -- Get next sequence for this org
  SELECT COALESCE(MAX(CAST(RIGHT(ticket_number, 8) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM tickets
  WHERE org_id = p_org_id;

  v_number := 'T' || v_prefix || '-' || LPAD(v_sequence::TEXT, 7, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Generate Ticket Barcode (24-char hex)
CREATE OR REPLACE FUNCTION generate_ticket_barcode()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN UPPER(encode(gen_random_bytes(12), 'hex'));
END;
$$ LANGUAGE plpgsql;

-- Update Slot Counts (trigger function)
CREATE OR REPLACE FUNCTION update_slot_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.time_slot_id IS NOT NULL THEN
    UPDATE time_slots
    SET sold_count = sold_count + 1,
        status = CASE
          WHEN sold_count + 1 >= capacity THEN 'sold_out'::slot_status
          WHEN sold_count + 1 >= capacity * 0.8 THEN 'limited'::slot_status
          ELSE status
        END,
        updated_at = NOW()
    WHERE id = NEW.time_slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_slot_on_ticket_create
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_counts();

-- Update Ticket Type Sold Count
CREATE OR REPLACE FUNCTION update_ticket_type_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ticket_types
    SET sold_count = sold_count + 1,
        updated_at = NOW()
    WHERE id = NEW.ticket_type_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_type_on_ticket_create
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_type_sold_count();

-- Update Promo Code Usage Count
CREATE OR REPLACE FUNCTION update_promo_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status = 'pending' THEN
    IF NEW.promo_code_id IS NOT NULL THEN
      UPDATE promo_codes
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE id = NEW.promo_code_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promo_on_order_complete
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_usage_count();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_waivers ENABLE ROW LEVEL SECURITY;

-- Ticket Categories: Public read for system defaults, org members for org-specific
CREATE POLICY "Anyone can view system ticket categories"
  ON ticket_categories FOR SELECT
  USING (org_id IS NULL AND is_active = TRUE);

CREATE POLICY "Org members can view org ticket categories"
  ON ticket_categories FOR SELECT
  USING (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = ticket_categories.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage org ticket categories"
  ON ticket_categories FOR ALL
  USING (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = ticket_categories.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Order Sources: Public read for system defaults, org members for org-specific
CREATE POLICY "Anyone can view system order sources"
  ON order_sources FOR SELECT
  USING (org_id IS NULL AND is_active = TRUE);

CREATE POLICY "Org members can view org order sources"
  ON order_sources FOR SELECT
  USING (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = order_sources.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage org order sources"
  ON order_sources FOR ALL
  USING (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = order_sources.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Ticket Types: Public read for active, org members for all
CREATE POLICY "Public can view active ticket types"
  ON ticket_types FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM attractions
      WHERE id = ticket_types.attraction_id
        AND status IN ('published', 'active')
    )
  );

CREATE POLICY "Org members can view all ticket types"
  ON ticket_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = ticket_types.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage ticket types"
  ON ticket_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = ticket_types.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager', 'box_office')
    )
  );

-- Time Slots: Public read for available, org members for all
CREATE POLICY "Public can view available time slots"
  ON time_slots FOR SELECT
  USING (
    status IN ('available', 'limited')
    AND date >= CURRENT_DATE
  );

CREATE POLICY "Org members can view all time slots"
  ON time_slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = time_slots.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage time slots"
  ON time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = time_slots.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager', 'box_office')
    )
  );

-- Promo Codes: Org members only
CREATE POLICY "Org members can view promo codes"
  ON promo_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = promo_codes.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage promo codes"
  ON promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = promo_codes.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager', 'finance')
    )
  );

-- Orders: Customers can view own, org members can view all
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    customer_email = auth.jwt()->>'email'
  );

CREATE POLICY "Org members can view org orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = orders.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Box office can manage orders"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = orders.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager', 'box_office', 'finance')
    )
  );

-- Order Items: Same as orders
CREATE POLICY "Users can view order items for accessible orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
        AND (
          customer_email = auth.jwt()->>'email'
          OR EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_id = orders.org_id
              AND user_id = auth.uid()
              AND status = 'active'
          )
        )
    )
  );

CREATE POLICY "Box office can manage order items"
  ON order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
        AND EXISTS (
          SELECT 1 FROM org_memberships
          WHERE org_id = orders.org_id
            AND user_id = auth.uid()
            AND status = 'active'
            AND role IN ('owner', 'admin', 'manager', 'box_office', 'finance')
        )
    )
  );

-- Tickets: Customers can view own, org members can view all
CREATE POLICY "Customers can view own tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = tickets.order_id
        AND customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Org members can view org tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = tickets.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Scanners can update tickets"
  ON tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = tickets.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager', 'scanner', 'box_office')
    )
  );

CREATE POLICY "Box office can manage tickets"
  ON tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = tickets.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager', 'box_office')
    )
  );

-- Cart Sessions: Public create/update for anonymous carts
CREATE POLICY "Anyone can manage their cart session"
  ON cart_sessions FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Ticket Waivers: Org members can view
CREATE POLICY "Org members can view waivers"
  ON ticket_waivers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = ticket_waivers.org_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Scanners can create waivers"
  ON ticket_waivers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = ticket_waivers.org_id
        AND user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager', 'scanner', 'box_office')
    )
  );

-- ============================================================================
-- SEED DATA: System Default Categories and Sources
-- ============================================================================

-- Ticket Categories (system defaults)
INSERT INTO ticket_categories (org_id, key, name, description, icon, color, badge_text, sort_order) VALUES
  (NULL, 'general', 'General Admission', 'Standard entry ticket', 'ticket', '#6B7280', NULL, 1),
  (NULL, 'vip', 'VIP', 'Premium experience with exclusive access', 'crown', '#F59E0B', 'PREMIUM', 2),
  (NULL, 'fast_pass', 'Fast Pass', 'Skip-the-line access', 'zap', '#8B5CF6', 'SKIP THE LINE', 3),
  (NULL, 'group', 'Group', 'Discounted group tickets', 'users', '#10B981', 'SAVE MORE', 4),
  (NULL, 'season_pass', 'Season Pass', 'Unlimited visits for the season', 'calendar', '#3B82F6', 'BEST VALUE', 5),
  (NULL, 'combo', 'Combo', 'Bundled tickets for multiple attractions', 'package', '#EC4899', 'BUNDLE & SAVE', 6),
  (NULL, 'add_on', 'Add-On', 'Additional experiences and upgrades', 'plus-circle', '#14B8A6', NULL, 7);

-- Order Sources (system defaults)
INSERT INTO order_sources (org_id, key, name, description, icon, color, sort_order) VALUES
  (NULL, 'online', 'Online', 'Direct website purchase', 'globe', '#3B82F6', 1),
  (NULL, 'box_office', 'Box Office', 'In-person purchase at venue', 'building', '#10B981', 2),
  (NULL, 'phone', 'Phone', 'Phone order with staff', 'phone', '#8B5CF6', 3),
  (NULL, 'partner', 'Partner', 'Third-party partner sale', 'handshake', '#F59E0B', 4),
  (NULL, 'comp', 'Complimentary', 'Complimentary ticket', 'gift', '#EC4899', 5);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Increment time slot booked count
CREATE OR REPLACE FUNCTION increment_time_slot_count(slot_id UUID, increment_by INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE time_slots
  SET booked_count = booked_count + increment_by,
      updated_at = NOW()
  WHERE id = slot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement time slot booked count
CREATE OR REPLACE FUNCTION decrement_time_slot_count(slot_id UUID, decrement_by INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE time_slots
  SET booked_count = GREATEST(0, booked_count - decrement_by),
      updated_at = NOW()
  WHERE id = slot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment promo code usage count
CREATE OR REPLACE FUNCTION increment_promo_code_usage(promo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET times_used = times_used + 1,
      updated_at = NOW()
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
