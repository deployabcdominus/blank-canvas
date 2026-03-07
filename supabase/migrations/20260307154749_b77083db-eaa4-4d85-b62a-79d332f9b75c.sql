-- Create helper function to check if user is viewer (read-only role)
CREATE OR REPLACE FUNCTION public.is_viewer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'viewer'
  )
$$;

-- ===== CLIENTS =====
-- Replace INSERT policy: deny viewer
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND NOT is_viewer(auth.uid())
);

-- Replace UPDATE policy: deny viewer
DROP POLICY IF EXISTS "clients_update" ON public.clients;
CREATE POLICY "clients_update" ON public.clients FOR UPDATE TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND NOT is_viewer(auth.uid())
);

-- ===== LEADS =====
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND created_by_user_id = auth.uid()
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "leads_update" ON public.leads;
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR created_by_user_id = auth.uid() OR assigned_to_user_id = auth.uid())
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);

-- ===== PROPOSALS =====
DROP POLICY IF EXISTS "proposals_insert" ON public.proposals;
CREATE POLICY "proposals_insert" ON public.proposals FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND owner_user_id = auth.uid()
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "proposals_update" ON public.proposals;
CREATE POLICY "proposals_update" ON public.proposals FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR owner_user_id = auth.uid())
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);

-- ===== PROJECTS =====
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND NOT is_viewer(auth.uid())
);

DROP POLICY IF EXISTS "projects_update" ON public.projects;
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND (is_company_admin(auth.uid()) OR owner_user_id = auth.uid())
  AND NOT is_viewer(auth.uid())
);

-- ===== PRODUCTION_ORDERS (Work Orders) =====
DROP POLICY IF EXISTS "production_orders_insert" ON public.production_orders;
CREATE POLICY "production_orders_insert" ON public.production_orders FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND owner_user_id = auth.uid()
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "production_orders_update" ON public.production_orders;
CREATE POLICY "production_orders_update" ON public.production_orders FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR owner_user_id = auth.uid())
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);

-- ===== PAYMENTS =====
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND created_by = auth.uid()
  AND NOT is_viewer(auth.uid())
);

-- ===== INSTALLATIONS =====
DROP POLICY IF EXISTS "installations_insert" ON public.installations;
CREATE POLICY "installations_insert" ON public.installations FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "installations_update" ON public.installations;
CREATE POLICY "installations_update" ON public.installations FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND NOT is_viewer(auth.uid())
    ELSE user_id = auth.uid()
  END
);