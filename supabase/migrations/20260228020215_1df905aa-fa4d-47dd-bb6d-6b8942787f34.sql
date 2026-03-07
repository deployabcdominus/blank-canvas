
-- 1. Add company_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- 2. Add multi-tenant columns to leads
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_to_user_id uuid;

-- 3. Add multi-tenant columns to proposals
ALTER TABLE public.proposals 
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS owner_user_id uuid;

-- 4. Add multi-tenant columns to production_orders
ALTER TABLE public.production_orders 
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS owner_user_id uuid;

-- 5. Helper: get user's company_id (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- 6. Helper: check if user is admin
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- 7. Drop old RLS policies
DROP POLICY IF EXISTS "Users can manage own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can manage own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can manage own production orders" ON public.production_orders;

-- 8. NEW RLS: leads SELECT
-- Admin: all in company. Comercial: created_by or assigned_to. Fallback: user_id for old data.
CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR created_by_user_id = auth.uid()
        OR assigned_to_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);

-- leads INSERT
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND created_by_user_id = auth.uid()
    ELSE
      user_id = auth.uid()
  END
);

-- leads UPDATE
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR created_by_user_id = auth.uid()
        OR assigned_to_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);

-- leads DELETE (admin or creator)
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR created_by_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);

-- 9. NEW RLS: proposals
CREATE POLICY "proposals_select" ON public.proposals FOR SELECT TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR owner_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);

CREATE POLICY "proposals_insert" ON public.proposals FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND owner_user_id = auth.uid()
    ELSE
      user_id = auth.uid()
  END
);

CREATE POLICY "proposals_update" ON public.proposals FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR owner_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);

CREATE POLICY "proposals_delete" ON public.proposals FOR DELETE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR owner_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);

-- 10. NEW RLS: production_orders
-- SELECT: everyone in company can see all
CREATE POLICY "production_orders_select" ON public.production_orders FOR SELECT TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
    ELSE
      user_id = auth.uid()
  END
);

CREATE POLICY "production_orders_insert" ON public.production_orders FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND owner_user_id = auth.uid()
    ELSE
      user_id = auth.uid()
  END
);

CREATE POLICY "production_orders_update" ON public.production_orders FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR owner_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);

CREATE POLICY "production_orders_delete" ON public.production_orders FOR DELETE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = public.get_user_company_id(auth.uid())
      AND (
        public.is_company_admin(auth.uid())
        OR owner_user_id = auth.uid()
      )
    ELSE
      user_id = auth.uid()
  END
);
