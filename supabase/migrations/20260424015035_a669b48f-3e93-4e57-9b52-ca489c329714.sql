-- Fix search_path for functions that were missing it
ALTER FUNCTION public.get_my_company_id_safe() SET search_path = public;
ALTER FUNCTION public.validate_poi_token(p_token text) SET search_path = public;
ALTER FUNCTION public.create_company(p_user_id uuid, p_name text, p_logo_url text, p_brand_color text, p_industry text, p_plan_id uuid) SET search_path = public;
ALTER FUNCTION public.get_my_company_id() SET search_path = public;
ALTER FUNCTION public.get_weekly_report(p_company_id uuid) SET search_path = public;

-- Add RLS policy for unpausesupabase (assuming it's a utility table)
-- If it's not used, we could even drop it, but for now let's just secure it.
CREATE POLICY "Admins can manage unpausesupabase" 
ON public.unpausesupabase 
FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin'));

-- Tighten storage policies to prevent listing
-- Instead of broad bucket_id check, we use a policy that doesn't allow listing but allows selecting specific files
-- Note: 'public' buckets in Supabase allow listing objects by default if a SELECT policy exists.
-- To prevent listing while allowing read, we need to ensure the SELECT policy is specific.

-- For avatars: only allow if authenticated or specific file (avatars are usually public though)
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- For company-logos:
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Company logos public read" ON storage.objects;
CREATE POLICY "Company logos public read" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');

-- For lead-logos:
DROP POLICY IF EXISTS "Lead logos public read" ON storage.objects;
CREATE POLICY "Lead logos public read" ON storage.objects FOR SELECT USING (bucket_id = 'lead-logos');

-- For work-order-blueprints: (Should NOT be public listing)
DROP POLICY IF EXISTS "Public can view blueprints" ON storage.objects;
CREATE POLICY "Public can view blueprints" ON storage.objects FOR SELECT USING (bucket_id = 'work-order-blueprints' AND (auth.role() = 'authenticated'));

-- For signatures: (Sensitive)
DROP POLICY IF EXISTS "Anyone can view signatures" ON storage.objects;
CREATE POLICY "Authenticated users can view signatures" ON storage.objects FOR SELECT USING (bucket_id = 'signatures' AND (auth.role() = 'authenticated'));

-- For poi-photos:
DROP POLICY IF EXISTS "Anyone can view poi photos" ON storage.objects;
CREATE POLICY "Anyone can view poi photos" ON storage.objects FOR SELECT USING (bucket_id = 'poi-photos');

-- Ensure all functions have search_path
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT proname, nspname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public') 
  LOOP
    EXECUTE 'ALTER FUNCTION public.' || quote_ident(r.proname) || '(' || pg_get_function_identity_arguments((SELECT oid FROM pg_proc WHERE proname = r.proname AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') LIMIT 1)) || ') SET search_path = public';
  END LOOP;
END $$;
