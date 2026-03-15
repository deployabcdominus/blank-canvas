
-- Platform Health Dashboard: aggregation function for superadmin
CREATE OR REPLACE FUNCTION public.get_platform_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_revenue numeric;
  active_tenants integer;
  total_leads integer;
  approved_proposals integer;
  conversion_rate numeric;
  total_records bigint;
  growth_data jsonb;
  top_tenants jsonb;
  recent_activity jsonb;
BEGIN
  -- Only superadmin can call this
  IF NOT has_role(auth.uid(), 'superadmin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Total revenue
  SELECT COALESCE(SUM(amount), 0) INTO total_revenue FROM payments;

  -- Active tenants
  SELECT COUNT(*) INTO active_tenants FROM companies WHERE is_active = true;

  -- Conversion rate (leads -> approved proposals)
  SELECT COUNT(*) INTO total_leads FROM leads;
  SELECT COUNT(*) INTO approved_proposals FROM proposals WHERE status = 'Aprobada';
  IF total_leads > 0 THEN
    conversion_rate := ROUND((approved_proposals::numeric / total_leads::numeric) * 100, 1);
  ELSE
    conversion_rate := 0;
  END IF;

  -- Total records (system load indicator)
  SELECT (
    (SELECT COUNT(*) FROM leads) +
    (SELECT COUNT(*) FROM proposals) +
    (SELECT COUNT(*) FROM production_orders) +
    (SELECT COUNT(*) FROM payments) +
    (SELECT COUNT(*) FROM clients) +
    (SELECT COUNT(*) FROM installations)
  ) INTO total_records;

  -- Growth data: leads and work orders per day for last 30 days
  SELECT COALESCE(jsonb_agg(row_to_json(d)), '[]'::jsonb)
  INTO growth_data
  FROM (
    SELECT
      gs::date AS date,
      COALESCE(l.cnt, 0) AS leads,
      COALESCE(o.cnt, 0) AS orders
    FROM generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      '1 day'
    ) gs
    LEFT JOIN (
      SELECT created_at::date AS d, COUNT(*) AS cnt
      FROM leads
      WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
      GROUP BY d
    ) l ON l.d = gs::date
    LEFT JOIN (
      SELECT created_at::date AS d, COUNT(*) AS cnt
      FROM production_orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
      GROUP BY d
    ) o ON o.d = gs::date
    ORDER BY gs
  ) d;

  -- Top 5 tenants by revenue
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO top_tenants
  FROM (
    SELECT
      c.id,
      c.name,
      c.logo_url,
      c.created_at,
      c.is_active,
      COALESCE(u.user_count, 0) AS user_count,
      COALESCE(p.total_revenue, 0) AS total_revenue,
      COALESCE(wo.order_count, 0) AS order_count
    FROM companies c
    LEFT JOIN (
      SELECT company_id, COUNT(*) AS user_count
      FROM profiles
      WHERE company_id IS NOT NULL
      GROUP BY company_id
    ) u ON u.company_id = c.id
    LEFT JOIN (
      SELECT company_id, SUM(amount) AS total_revenue
      FROM payments
      GROUP BY company_id
    ) p ON p.company_id = c.id
    LEFT JOIN (
      SELECT company_id, COUNT(*) AS order_count
      FROM production_orders
      GROUP BY company_id
    ) wo ON wo.company_id = c.id
    ORDER BY COALESCE(p.total_revenue, 0) DESC
    LIMIT 5
  ) t;

  -- Recent platform activity (last 10 audit entries)
  SELECT COALESCE(jsonb_agg(row_to_json(a)), '[]'::jsonb)
  INTO recent_activity
  FROM (
    SELECT id, actor_id, action_type, target_name, details, created_at
    FROM platform_audit_logs
    ORDER BY created_at DESC
    LIMIT 10
  ) a;

  result := jsonb_build_object(
    'total_revenue', total_revenue,
    'active_tenants', active_tenants,
    'conversion_rate', conversion_rate,
    'total_records', total_records,
    'total_leads', total_leads,
    'approved_proposals', approved_proposals,
    'growth_data', growth_data,
    'top_tenants', top_tenants,
    'recent_activity', recent_activity
  );

  RETURN result;
END;
$$;
