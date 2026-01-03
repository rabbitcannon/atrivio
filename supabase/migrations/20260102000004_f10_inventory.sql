-- ============================================================================
-- F10: INVENTORY MANAGEMENT
-- Migration: 20260102000004_f10_inventory.sql
--
-- Tables: inventory_types, inventory_categories, inventory_items,
--         inventory_transactions, inventory_checkouts
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Item condition enum
DO $$ BEGIN
  CREATE TYPE item_condition AS ENUM (
    'new', 'excellent', 'good', 'fair', 'poor', 'damaged', 'retired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Inventory transaction type enum (named uniquely to avoid conflict with Stripe's transaction_type)
DO $$ BEGIN
  CREATE TYPE inventory_transaction_type AS ENUM (
    'purchase', 'adjustment', 'checkout', 'return',
    'transfer', 'damaged', 'lost', 'disposed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- LOOKUP TABLE: inventory_types
-- ============================================================================

CREATE TABLE public.inventory_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(50),
  color VARCHAR(7),
  is_consumable BOOLEAN DEFAULT FALSE,
  requires_checkout BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique per org (NULL org_id = system default)
  CONSTRAINT inventory_types_org_key_unique UNIQUE (org_id, key)
);

-- Index for lookups
CREATE INDEX idx_inventory_types_org ON public.inventory_types(org_id);
CREATE INDEX idx_inventory_types_key ON public.inventory_types(key);

-- ============================================================================
-- TABLE: inventory_categories
-- ============================================================================

CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inventory_categories_org ON public.inventory_categories(org_id);
CREATE INDEX idx_inventory_categories_parent ON public.inventory_categories(parent_id);

-- ============================================================================
-- TABLE: inventory_items
-- ============================================================================

CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  attraction_id UUID REFERENCES public.attractions(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  type_id UUID NOT NULL REFERENCES public.inventory_types(id) ON DELETE RESTRICT,
  sku VARCHAR(50),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER,
  unit VARCHAR(50) DEFAULT 'each',
  unit_cost INTEGER, -- In cents
  location VARCHAR(200),
  condition item_condition DEFAULT 'good',
  image_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- SKU unique per org
  CONSTRAINT inventory_items_sku_unique UNIQUE (org_id, sku)
);

-- Indexes
CREATE INDEX idx_inventory_items_org ON public.inventory_items(org_id);
CREATE INDEX idx_inventory_items_attraction ON public.inventory_items(attraction_id);
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_items_type ON public.inventory_items(type_id);
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX idx_inventory_items_low_stock ON public.inventory_items(org_id, quantity, min_quantity)
  WHERE quantity <= min_quantity AND is_active = TRUE;

-- ============================================================================
-- TABLE: inventory_transactions
-- ============================================================================

CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type inventory_transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  previous_qty INTEGER NOT NULL,
  new_qty INTEGER NOT NULL,
  reason TEXT,
  reference_type VARCHAR(50), -- 'checkout', 'order', 'manual', etc.
  reference_id UUID,
  performed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inventory_transactions_org ON public.inventory_transactions(org_id);
CREATE INDEX idx_inventory_transactions_item ON public.inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_performed_by ON public.inventory_transactions(performed_by);
CREATE INDEX idx_inventory_transactions_created ON public.inventory_transactions(created_at DESC);
CREATE INDEX idx_inventory_transactions_reference ON public.inventory_transactions(reference_type, reference_id);

-- ============================================================================
-- TABLE: inventory_checkouts
-- ============================================================================

CREATE TABLE public.inventory_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  checked_out_at TIMESTAMPTZ DEFAULT NOW(),
  checked_out_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  returned_at TIMESTAMPTZ,
  returned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  condition_out item_condition,
  condition_in item_condition,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inventory_checkouts_org ON public.inventory_checkouts(org_id);
CREATE INDEX idx_inventory_checkouts_item ON public.inventory_checkouts(item_id);
CREATE INDEX idx_inventory_checkouts_staff ON public.inventory_checkouts(staff_id);
CREATE INDEX idx_inventory_checkouts_active ON public.inventory_checkouts(org_id, returned_at)
  WHERE returned_at IS NULL;
-- Index for due_date filtering (CURRENT_DATE is checked at query time, not in index predicate)
CREATE INDEX idx_inventory_checkouts_due ON public.inventory_checkouts(org_id, due_date)
  WHERE returned_at IS NULL AND due_date IS NOT NULL;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update item quantity on checkout/return
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Checkout: decrease quantity
    UPDATE public.inventory_items
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.item_id;

    -- Create transaction record
    INSERT INTO public.inventory_transactions (
      org_id, item_id, type, quantity, previous_qty, new_qty,
      reason, reference_type, reference_id, performed_by
    )
    SELECT
      NEW.org_id,
      NEW.item_id,
      'checkout',
      -NEW.quantity,
      i.quantity + NEW.quantity,
      i.quantity,
      'Checked out to staff',
      'checkout',
      NEW.id,
      NEW.checked_out_by
    FROM public.inventory_items i WHERE i.id = NEW.item_id;

  ELSIF TG_OP = 'UPDATE' AND OLD.returned_at IS NULL AND NEW.returned_at IS NOT NULL THEN
    -- Return: increase quantity
    UPDATE public.inventory_items
    SET quantity = quantity + NEW.quantity,
        condition = COALESCE(NEW.condition_in, condition),
        updated_at = NOW()
    WHERE id = NEW.item_id;

    -- Create transaction record
    INSERT INTO public.inventory_transactions (
      org_id, item_id, type, quantity, previous_qty, new_qty,
      reason, reference_type, reference_id, performed_by
    )
    SELECT
      NEW.org_id,
      NEW.item_id,
      'return',
      NEW.quantity,
      i.quantity - NEW.quantity,
      i.quantity,
      'Returned from checkout',
      'checkout',
      NEW.id,
      NEW.returned_by
    FROM public.inventory_items i WHERE i.id = NEW.item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for checkout/return
CREATE TRIGGER trg_inventory_checkout_quantity
  AFTER INSERT OR UPDATE ON public.inventory_checkouts
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_quantity();

-- Function to get low stock items
CREATE OR REPLACE FUNCTION get_low_stock_items(p_org_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(200),
  sku VARCHAR(50),
  quantity INTEGER,
  min_quantity INTEGER,
  type_name VARCHAR(100),
  location VARCHAR(200),
  shortage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.name,
    i.sku,
    i.quantity,
    i.min_quantity,
    t.name AS type_name,
    i.location,
    (i.min_quantity - i.quantity) AS shortage
  FROM public.inventory_items i
  JOIN public.inventory_types t ON i.type_id = t.id
  WHERE i.org_id = p_org_id
    AND i.is_active = TRUE
    AND i.quantity <= i.min_quantity
  ORDER BY (i.min_quantity - i.quantity) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get inventory summary
CREATE OR REPLACE FUNCTION get_inventory_summary(p_org_id UUID)
RETURNS TABLE (
  total_items BIGINT,
  total_quantity BIGINT,
  total_value BIGINT,
  low_stock_count BIGINT,
  checked_out_count BIGINT,
  by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH item_stats AS (
    SELECT
      COUNT(*) AS total_items,
      COALESCE(SUM(quantity), 0) AS total_quantity,
      COALESCE(SUM(quantity * COALESCE(unit_cost, 0)), 0) AS total_value,
      COUNT(*) FILTER (WHERE quantity <= min_quantity AND is_active) AS low_stock_count
    FROM public.inventory_items
    WHERE org_id = p_org_id AND is_active = TRUE
  ),
  checkout_stats AS (
    SELECT COUNT(*) AS checked_out_count
    FROM public.inventory_checkouts
    WHERE org_id = p_org_id AND returned_at IS NULL
  ),
  type_breakdown AS (
    SELECT jsonb_agg(jsonb_build_object(
      'type', t.name,
      'count', counts.cnt,
      'quantity', counts.qty
    )) AS by_type
    FROM (
      SELECT type_id, COUNT(*) AS cnt, SUM(quantity) AS qty
      FROM public.inventory_items
      WHERE org_id = p_org_id AND is_active = TRUE
      GROUP BY type_id
    ) counts
    JOIN public.inventory_types t ON counts.type_id = t.id
  )
  SELECT
    s.total_items,
    s.total_quantity,
    s.total_value,
    s.low_stock_count,
    c.checked_out_count,
    COALESCE(tb.by_type, '[]'::jsonb)
  FROM item_stats s, checkout_stats c, type_breakdown tb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.inventory_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_checkouts ENABLE ROW LEVEL SECURITY;

-- inventory_types policies
CREATE POLICY "inventory_types_select" ON public.inventory_types
  FOR SELECT USING (
    org_id IS NULL -- System defaults visible to all
    OR org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "inventory_types_insert" ON public.inventory_types
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "inventory_types_update" ON public.inventory_types
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "inventory_types_delete" ON public.inventory_types
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- inventory_categories policies
CREATE POLICY "inventory_categories_select" ON public.inventory_categories
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "inventory_categories_insert" ON public.inventory_categories
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "inventory_categories_update" ON public.inventory_categories
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "inventory_categories_delete" ON public.inventory_categories
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- inventory_items policies
CREATE POLICY "inventory_items_select" ON public.inventory_items
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "inventory_items_insert" ON public.inventory_items
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "inventory_items_update" ON public.inventory_items
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "inventory_items_delete" ON public.inventory_items
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- inventory_transactions policies (read-only for most users)
CREATE POLICY "inventory_transactions_select" ON public.inventory_transactions
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "inventory_transactions_insert" ON public.inventory_transactions
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

-- inventory_checkouts policies
CREATE POLICY "inventory_checkouts_select" ON public.inventory_checkouts
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "inventory_checkouts_insert" ON public.inventory_checkouts
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "inventory_checkouts_update" ON public.inventory_checkouts
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'manager')
    )
  );

-- ============================================================================
-- SEED DATA: System Default Inventory Types
-- ============================================================================

INSERT INTO public.inventory_types (org_id, key, name, description, category, icon, color, is_consumable, requires_checkout, sort_order)
VALUES
  (NULL, 'costume', 'Costume', 'Character costumes and wardrobe items', 'production', 'shirt', '#9333EA', FALSE, TRUE, 1),
  (NULL, 'prop', 'Prop', 'Props and set pieces', 'production', 'box', '#F59E0B', FALSE, TRUE, 2),
  (NULL, 'makeup', 'Makeup', 'Makeup and prosthetics supplies', 'production', 'palette', '#EC4899', TRUE, FALSE, 3),
  (NULL, 'equipment', 'Equipment', 'Technical equipment and tools', 'technical', 'wrench', '#6B7280', FALSE, TRUE, 4),
  (NULL, 'lighting', 'Lighting', 'Lighting equipment and fixtures', 'technical', 'lightbulb', '#FBBF24', FALSE, FALSE, 5),
  (NULL, 'audio', 'Audio', 'Audio equipment and sound effects', 'technical', 'volume-2', '#3B82F6', FALSE, FALSE, 6),
  (NULL, 'safety', 'Safety', 'Safety equipment and first aid', 'operations', 'shield', '#EF4444', FALSE, FALSE, 7),
  (NULL, 'consumable', 'Consumable', 'Disposable supplies and materials', 'operations', 'package', '#10B981', TRUE, FALSE, 8),
  (NULL, 'other', 'Other', 'Miscellaneous items', 'operations', 'more-horizontal', '#6B7280', FALSE, FALSE, 9)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_inventory_types_updated_at
  BEFORE UPDATE ON public.inventory_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_inventory_categories_updated_at
  BEFORE UPDATE ON public.inventory_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_inventory_checkouts_updated_at
  BEFORE UPDATE ON public.inventory_checkouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.inventory_types IS 'Extensible inventory type classifications (costume, prop, makeup, etc.)';
COMMENT ON TABLE public.inventory_categories IS 'Hierarchical categories for organizing inventory items';
COMMENT ON TABLE public.inventory_items IS 'Individual inventory items tracked by the organization';
COMMENT ON TABLE public.inventory_transactions IS 'Audit trail of all inventory quantity changes';
COMMENT ON TABLE public.inventory_checkouts IS 'Track items checked out to staff members';
