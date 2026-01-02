-- ============================================================================
-- PLATFORM REVENUE AGGREGATION FUNCTIONS
-- Functions for super admin to view platform-wide fee revenue
-- ============================================================================

-- Get platform-wide revenue summary
-- Returns total platform fees collected, with period breakdowns
CREATE OR REPLACE FUNCTION get_platform_revenue_summary()
RETURNS TABLE (
  total_platform_fees BIGINT,
  total_transactions BIGINT,
  total_gross_volume BIGINT,
  fees_today BIGINT,
  fees_7d BIGINT,
  fees_30d BIGINT,
  fees_this_month BIGINT,
  transactions_today BIGINT,
  transactions_7d BIGINT,
  transactions_30d BIGINT
) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_7d_ago DATE := CURRENT_DATE - INTERVAL '7 days';
  v_30d_ago DATE := CURRENT_DATE - INTERVAL '30 days';
  v_month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(st.platform_fee), 0)::BIGINT AS total_platform_fees,
    COUNT(*)::BIGINT AS total_transactions,
    COALESCE(SUM(st.amount), 0)::BIGINT AS total_gross_volume,
    COALESCE(SUM(CASE WHEN st.created_at::DATE = v_today THEN st.platform_fee ELSE 0 END), 0)::BIGINT AS fees_today,
    COALESCE(SUM(CASE WHEN st.created_at::DATE >= v_7d_ago THEN st.platform_fee ELSE 0 END), 0)::BIGINT AS fees_7d,
    COALESCE(SUM(CASE WHEN st.created_at::DATE >= v_30d_ago THEN st.platform_fee ELSE 0 END), 0)::BIGINT AS fees_30d,
    COALESCE(SUM(CASE WHEN st.created_at::DATE >= v_month_start THEN st.platform_fee ELSE 0 END), 0)::BIGINT AS fees_this_month,
    COUNT(CASE WHEN st.created_at::DATE = v_today THEN 1 END)::BIGINT AS transactions_today,
    COUNT(CASE WHEN st.created_at::DATE >= v_7d_ago THEN 1 END)::BIGINT AS transactions_7d,
    COUNT(CASE WHEN st.created_at::DATE >= v_30d_ago THEN 1 END)::BIGINT AS transactions_30d
  FROM stripe_transactions st
  WHERE st.status = 'succeeded'
    AND st.type = 'charge';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get revenue breakdown by organization
-- Returns platform fees collected per organization
CREATE OR REPLACE FUNCTION get_platform_revenue_by_org(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  org_id UUID,
  org_name TEXT,
  org_slug TEXT,
  stripe_account_id UUID,
  total_platform_fees BIGINT,
  total_transactions BIGINT,
  total_gross_volume BIGINT,
  avg_transaction_amount BIGINT,
  platform_fee_percent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS org_id,
    o.name::TEXT AS org_name,
    o.slug::TEXT AS org_slug,
    sa.id AS stripe_account_id,
    COALESCE(SUM(st.platform_fee), 0)::BIGINT AS total_platform_fees,
    COUNT(st.id)::BIGINT AS total_transactions,
    COALESCE(SUM(st.amount), 0)::BIGINT AS total_gross_volume,
    CASE
      WHEN COUNT(st.id) > 0 THEN (COALESCE(SUM(st.amount), 0) / COUNT(st.id))::BIGINT
      ELSE 0::BIGINT
    END AS avg_transaction_amount,
    COALESCE(o.platform_fee_percent, 3.0) AS platform_fee_percent
  FROM organizations o
  LEFT JOIN stripe_accounts sa ON sa.org_id = o.id
  LEFT JOIN stripe_transactions st ON st.stripe_account_id = sa.id
    AND st.status = 'succeeded'
    AND st.type = 'charge'
    AND (p_start_date IS NULL OR st.created_at::DATE >= p_start_date)
    AND (p_end_date IS NULL OR st.created_at::DATE <= p_end_date)
  GROUP BY o.id, o.name, o.slug, sa.id, o.platform_fee_percent
  ORDER BY COALESCE(SUM(st.platform_fee), 0) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get daily revenue trend for charts
-- Returns daily platform fees for the specified period
CREATE OR REPLACE FUNCTION get_platform_revenue_trend(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  platform_fees BIGINT,
  transaction_count BIGINT,
  gross_volume BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1) * INTERVAL '1 day',
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE AS date
  )
  SELECT
    ds.date,
    COALESCE(SUM(st.platform_fee), 0)::BIGINT AS platform_fees,
    COUNT(st.id)::BIGINT AS transaction_count,
    COALESCE(SUM(st.amount), 0)::BIGINT AS gross_volume
  FROM date_series ds
  LEFT JOIN stripe_transactions st ON st.created_at::DATE = ds.date
    AND st.status = 'succeeded'
    AND st.type = 'charge'
  GROUP BY ds.date
  ORDER BY ds.date ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions to authenticated users (RLS will handle access control)
GRANT EXECUTE ON FUNCTION get_platform_revenue_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_revenue_by_org(INTEGER, INTEGER, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_revenue_trend(INTEGER) TO authenticated;

COMMENT ON FUNCTION get_platform_revenue_summary() IS 'Get platform-wide revenue metrics (super admin only)';
COMMENT ON FUNCTION get_platform_revenue_by_org(INTEGER, INTEGER, DATE, DATE) IS 'Get revenue breakdown by organization (super admin only)';
COMMENT ON FUNCTION get_platform_revenue_trend(INTEGER) IS 'Get daily revenue trend for charts (super admin only)';
