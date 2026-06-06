
-- 1) Drop overly permissive proposals public read
DROP POLICY IF EXISTS "Public can view proposal by token match" ON public.proposals;

-- 2) RPC for public proposal approval flow
CREATE OR REPLACE FUNCTION public.get_proposal_by_approval_token(_token uuid)
RETURNS TABLE (
  id uuid,
  client text,
  project text,
  value numeric,
  description text,
  status text,
  approved_at timestamptz,
  approval_token uuid,
  company_id uuid,
  mockup_url text,
  company_name text,
  company_logo_url text,
  company_brand_color text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.client, p.project, p.value, p.description, p.status,
         p.approved_at, p.approval_token, p.company_id, p.mockup_url,
         c.name, c.logo_url, c.brand_color
  FROM public.proposals p
  LEFT JOIN public.companies c ON c.id = p.company_id
  WHERE p.approval_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_proposal_by_approval_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_approval_token(uuid) TO anon, authenticated;

-- 3) Blueprints company-scoped UPDATE/DELETE
DROP POLICY IF EXISTS "Authenticated can manage blueprints" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update blueprints" ON storage.objects;

CREATE POLICY "Company members can update blueprints"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'work-order-blueprints'
  AND (storage.foldername(name))[1] = (public.get_my_company_id())::text)
WITH CHECK (bucket_id = 'work-order-blueprints'
  AND (storage.foldername(name))[1] = (public.get_my_company_id())::text);

CREATE POLICY "Company members can delete blueprints"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'work-order-blueprints'
  AND (storage.foldername(name))[1] = (public.get_my_company_id())::text);

-- 4) Signatures company-scoped UPDATE/DELETE
DROP POLICY IF EXISTS "Authenticated users can update signatures" ON storage.objects;

CREATE POLICY "Company members can update signatures"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'signatures'
  AND (storage.foldername(name))[1] = (public.get_my_company_id())::text)
WITH CHECK (bucket_id = 'signatures'
  AND (storage.foldername(name))[1] = (public.get_my_company_id())::text);

CREATE POLICY "Company members can delete signatures"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'signatures'
  AND (storage.foldername(name))[1] = (public.get_my_company_id())::text);

-- 5) Tighten poi-photos upload
DROP POLICY IF EXISTS "Anyone can upload poi photos" ON storage.objects;

CREATE POLICY "Valid POI token required to upload poi photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'poi-photos'
  AND EXISTS (
    SELECT 1 FROM public.production_orders po
    WHERE po.id::text = (storage.foldername(name))[2]
      AND po.company_id::text = (storage.foldername(name))[1]
      AND po.poi_token IS NOT NULL
      AND po.poi_token_exp > now()
  )
);

-- 6) user_roles same-company enforcement
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;

CREATE POLICY "Only admins can assign roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'superadmin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND role <> 'superadmin'::app_role
    AND EXISTS (
      SELECT 1
      FROM public.profiles target
      JOIN public.profiles admin_p ON admin_p.id = auth.uid()
      WHERE target.id = user_roles.user_id
        AND target.company_id IS NOT NULL
        AND target.company_id = admin_p.company_id
    )
  )
);

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'superadmin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND user_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles target
      JOIN public.profiles admin_p ON admin_p.id = auth.uid()
      WHERE target.id = user_roles.user_id
        AND target.company_id IS NOT NULL
        AND target.company_id = admin_p.company_id
    )
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'superadmin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND role <> 'superadmin'::app_role
    AND EXISTS (
      SELECT 1
      FROM public.profiles target
      JOIN public.profiles admin_p ON admin_p.id = auth.uid()
      WHERE target.id = user_roles.user_id
        AND target.company_id IS NOT NULL
        AND target.company_id = admin_p.company_id
    )
  )
);
