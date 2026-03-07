-- ============================================================
-- PHASE: Granular RBAC helpers
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_sales(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'sales') $$;

CREATE OR REPLACE FUNCTION public.is_operations(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'operations') $$;

CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'member') $$;

-- ============================================================
-- CLIENTS: admin + sales can write; ops/member/viewer read-only
-- ============================================================
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND (is_company_admin(auth.uid()) OR is_sales(auth.uid()))
);

DROP POLICY IF EXISTS "clients_update" ON public.clients;
CREATE POLICY "clients_update" ON public.clients FOR UPDATE TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND (is_company_admin(auth.uid()) OR is_sales(auth.uid()))
);

-- ============================================================
-- LEADS: admin + sales can write; member can update assigned
-- ============================================================
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND created_by_user_id = auth.uid()
      AND (is_company_admin(auth.uid()) OR is_sales(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "leads_update" ON public.leads;
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (
        is_company_admin(auth.uid())
        OR (is_sales(auth.uid()) AND (created_by_user_id = auth.uid() OR assigned_to_user_id = auth.uid()))
        OR (is_member(auth.uid()) AND assigned_to_user_id = auth.uid())
      )
    ELSE user_id = auth.uid()
  END
);

-- ============================================================
-- PROPOSALS: admin + sales can write
-- ============================================================
DROP POLICY IF EXISTS "proposals_insert" ON public.proposals;
CREATE POLICY "proposals_insert" ON public.proposals FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND owner_user_id = auth.uid()
      AND (is_company_admin(auth.uid()) OR is_sales(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "proposals_update" ON public.proposals;
CREATE POLICY "proposals_update" ON public.proposals FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (
        is_company_admin(auth.uid())
        OR (is_sales(auth.uid()) AND owner_user_id = auth.uid())
      )
    ELSE user_id = auth.uid()
  END
);

-- ============================================================
-- PROJECTS: admin + operations can write; member can update assigned
-- ============================================================
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
);

DROP POLICY IF EXISTS "projects_update" ON public.projects;
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated
USING (
  company_id = get_user_company_id(auth.uid())
  AND (
    is_company_admin(auth.uid())
    OR (is_operations(auth.uid()) AND (owner_user_id = auth.uid() OR assigned_to_user_id = auth.uid()))
    OR (is_member(auth.uid()) AND assigned_to_user_id = auth.uid())
  )
);

-- ============================================================
-- PRODUCTION_ORDERS (Work Orders): admin + operations can write; member can update own
-- ============================================================
DROP POLICY IF EXISTS "production_orders_insert" ON public.production_orders;
CREATE POLICY "production_orders_insert" ON public.production_orders FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND owner_user_id = auth.uid()
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "production_orders_update" ON public.production_orders;
CREATE POLICY "production_orders_update" ON public.production_orders FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (
        is_company_admin(auth.uid())
        OR (is_operations(auth.uid()) AND (owner_user_id = auth.uid()))
        OR (is_member(auth.uid()) AND owner_user_id = auth.uid())
      )
    ELSE user_id = auth.uid()
  END
);

-- ============================================================
-- PAYMENTS: only admin can insert (financial control)
-- ============================================================
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_user_company_id(auth.uid())
  AND created_by = auth.uid()
  AND is_company_admin(auth.uid())
);

-- ============================================================
-- INSTALLATIONS: admin + operations can write
-- ============================================================
DROP POLICY IF EXISTS "installations_insert" ON public.installations;
CREATE POLICY "installations_insert" ON public.installations FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "installations_update" ON public.installations;
CREATE POLICY "installations_update" ON public.installations FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);