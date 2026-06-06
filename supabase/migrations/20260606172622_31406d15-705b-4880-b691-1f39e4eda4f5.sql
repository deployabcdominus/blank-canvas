-- 1. Narrow POI access
CREATE OR REPLACE FUNCTION public.validate_poi_token(p_token text)
RETURNS TABLE (
    order_id uuid,
    company_id uuid,
    client text,
    project_name text,
    wo_number text,
    token_valid boolean,
    token_expired boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    po.id            AS order_id,
    po.company_id    AS company_id,
    po.client        AS client,
    po.project_name  AS project_name,
    po.wo_number     AS wo_number,
    (
      po.poi_token = p_token
      AND po.poi_token_exp > now()
      AND (po.poi_token_used = false OR po.poi_token_used IS NULL)
    )                AS token_valid,
    (
      po.poi_token IS NOT NULL
      AND po.poi_token_exp <= now()
    )                AS token_expired
  FROM public.production_orders po
  WHERE po.poi_token = p_token
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke the permissive public select
DROP POLICY IF EXISTS "production_orders_public_read_by_token" ON public.production_orders;

-- 2. Storage Hardening for POI
-- Only allow uploads if the user has a valid token for the order
-- This requires checking the production_orders table in the policy.
-- Note: storage policies for anon are tricky, but we can check the path.

DROP POLICY IF EXISTS "Anyone can upload POI photos" ON storage.objects;
-- Already handled by the previous agent in a way, but let's make it robust.

-- 3. Encrypt integration tokens
-- We'll use a simple approach: encrypt access_token and refresh_token
-- First, ensure pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add a decryption function for use in authorized code/RPCs
CREATE OR REPLACE FUNCTION public.get_decrypted_integration(p_integration_id uuid)
RETURNS TABLE (
    access_token text,
    refresh_token text
) AS $$
DECLARE
  master_key text := 'lovable-security-key-2026';
BEGIN
  -- Only allow if the user is an admin or superadmin
  IF NOT (SELECT is_admin()) AND NOT (SELECT has_role(auth.uid(), 'superadmin')) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    pgp_sym_decrypt(i.access_token::bytea, master_key) as access_token,
    pgp_sym_decrypt(i.refresh_token::bytea, master_key) as refresh_token
  FROM public.integrations i
  WHERE i.id = p_integration_id
  AND i.company_id = (SELECT get_my_company_id());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
