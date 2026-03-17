
CREATE OR REPLACE FUNCTION public.get_weekly_report(p_company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  -- Current week
  cw_new_leads integer;
  cw_converted integer;
  cw_revenue numeric;
  cw_lost_value numeric;
  cw_closed_orders integer;
  -- Previous week
  pw_new_leads integer;
  pw_converted integer;
  pw_revenue numeric;
  pw_lost_value numeric;
  pw_closed_orders integer;
  -- Date boundaries
  now_ts timestamptz := now();
  week_ago timestamptz := now() - interval '7 days';
  two_weeks_ago timestamptz := now() - interval '14 days';
BEGIN
  -- Security: only admin/superadmin of the same company
  IF NOT (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN profiles p ON p.id = ur.user_id
      WHERE ur.user_id = auth.uid()
        AND p.company_id = p_company_id
        AND ur.role IN ('admin', 'superadmin')
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- CURRENT WEEK metrics
  SELECT COUNT(*) INTO cw_new_leads
  FROM leads WHERE company_id = p_company_id AND deleted_at IS NULL AND created_at >= week_ago;

  SELECT COUNT(*) INTO cw_converted
  FROM leads WHERE company_id = p_company_id AND deleted_at IS NULL
    AND status IN ('Convertido') AND created_at >= week_ago;

  SELECT COALESCE(SUM(value), 0) INTO cw_revenue
  FROM proposals WHERE company_id = p_company_id AND status = 'Aprobada'
    AND approved_at >= week_ago;

  SELECT COALESCE(SUM(CAST(value AS numeric)), 0) INTO cw_lost_value
  FROM leads WHERE company_id = p_company_id AND deleted_at IS NOT NULL
    AND deleted_at >= week_ago AND value IS NOT NULL AND value != '';

  SELECT COUNT(*) INTO cw_closed_orders
  FROM production_orders WHERE company_id = p_company_id
    AND status = 'Finalizada' AND end_date >= week_ago;

  -- PREVIOUS WEEK metrics
  SELECT COUNT(*) INTO pw_new_leads
  FROM leads WHERE company_id = p_company_id AND deleted_at IS NULL
    AND created_at >= two_weeks_ago AND created_at < week_ago;

  SELECT COUNT(*) INTO pw_converted
  FROM leads WHERE company_id = p_company_id AND deleted_at IS NULL
    AND status IN ('Convertido') AND created_at >= two_weeks_ago AND created_at < week_ago;

  SELECT COALESCE(SUM(value), 0) INTO pw_revenue
  FROM proposals WHERE company_id = p_company_id AND status = 'Aprobada'
    AND approved_at >= two_weeks_ago AND approved_at < week_ago;

  SELECT COALESCE(SUM(CAST(value AS numeric)), 0) INTO pw_lost_value
  FROM leads WHERE company_id = p_company_id AND deleted_at IS NOT NULL
    AND deleted_at >= two_weeks_ago AND deleted_at < week_ago AND value IS NOT NULL AND value != '';

  SELECT COUNT(*) INTO pw_closed_orders
  FROM production_orders WHERE company_id = p_company_id
    AND status = 'Finalizada' AND end_date >= two_weeks_ago AND end_date < week_ago;

  result := jsonb_build_object(
    'current', jsonb_build_object(
      'new_leads', cw_new_leads,
      'converted', cw_converted,
      'revenue', cw_revenue,
      'lost_value', cw_lost_value,
      'closed_orders', cw_closed_orders
    ),
    'previous', jsonb_build_object(
      'new_leads', pw_new_leads,
      'converted', pw_converted,
      'revenue', pw_revenue,
      'lost_value', pw_lost_value,
      'closed_orders', pw_closed_orders
    ),
    'period_start', week_ago,
    'period_end', now_ts
  );

  RETURN result;
END;
$$;
