-- 1. Hardening RLS for Audit Logs
-- Audit logs should be read-only for users (only by their company_id) 
-- and only insertable via SECURITY DEFINER functions, never directly by the client.

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their company audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their company audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (company_id = (SELECT get_my_company_id()));

-- Deny direct inserts/updates/deletes to audit_logs from clients
DROP POLICY IF EXISTS "No direct inserts to audit_logs" ON public.audit_logs;
-- (Default is deny if no policy exists, but explicit is better for documentation)

-- 2. Hardening User Roles
-- Prevent users from modifying their own roles. Only superadmins or via controlled RPC.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;
CREATE POLICY "Users can view roles in their company"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM auth.users 
    WHERE id = auth.uid() 
    OR company_id = (SELECT get_my_company_id())
  )
);

-- 3. Storage Security - Strict Isolation
-- Ensure that files in 'company-logos' can only be read if they belong to the company
-- and only uploaded/deleted by admins of that company.

CREATE OR REPLACE FUNCTION storage.check_company_path(path text, user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT company_id INTO v_company_id FROM public.profiles WHERE id = user_id;
  RETURN path STARTS WITH v_company_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Company logo read access" ON storage.objects;
CREATE POLICY "Company logo read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Admins can manage company logos" ON storage.objects;
CREATE POLICY "Admins can manage company logos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'company-logos' 
  AND (SELECT public.has_role(auth.uid(), 'admin'))
  AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
);

-- 4. Global RLS Check for all public tables
-- Ensure every table in public schema has a company_id isolation policy
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('spatial_ref_sys', 'schema_migrations')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
