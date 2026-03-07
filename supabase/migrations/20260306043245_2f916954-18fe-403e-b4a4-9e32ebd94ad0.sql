
-- Add is_active to profiles (may already exist from failed migration)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create superadmin check function
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'superadmin'
  )
$$;

-- Companies RLS
DROP POLICY IF EXISTS "Company members can view company" ON public.companies;
CREATE POLICY "Company members can view company" ON public.companies
FOR SELECT USING (
  (user_id = auth.uid()) OR (id = get_user_company_id(auth.uid())) OR is_superadmin(auth.uid())
);

DROP POLICY IF EXISTS "Company admins can update company" ON public.companies;
CREATE POLICY "Company admins can update company" ON public.companies
FOR UPDATE USING (
  (user_id = auth.uid()) OR 
  ((id = get_user_company_id(auth.uid())) AND is_company_admin(auth.uid())) OR
  is_superadmin(auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;
CREATE POLICY "Users can insert own companies" ON public.companies
FOR INSERT WITH CHECK (
  (auth.uid() = user_id) OR is_superadmin(auth.uid())
);

-- Profiles RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING ((auth.uid() = id) OR is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING ((auth.uid() = id) OR is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK ((auth.uid() = id) OR is_superadmin(auth.uid()));

-- User_roles RLS
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING ((auth.uid() = user_id) OR is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role" ON public.user_roles
FOR INSERT WITH CHECK ((auth.uid() = user_id) OR is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Superadmin can update roles" ON public.user_roles;
CREATE POLICY "Superadmin can update roles" ON public.user_roles
FOR UPDATE USING (is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Superadmin can delete roles" ON public.user_roles;
CREATE POLICY "Superadmin can delete roles" ON public.user_roles
FOR DELETE USING (is_superadmin(auth.uid()));

-- Clients RLS
DROP POLICY IF EXISTS "clients_select" ON public.clients;
CREATE POLICY "clients_select" ON public.clients
FOR SELECT USING ((company_id = get_user_company_id(auth.uid())) OR is_superadmin(auth.uid()));

-- Payments RLS
DROP POLICY IF EXISTS "payments_select" ON public.payments;
CREATE POLICY "payments_select" ON public.payments
FOR SELECT USING ((company_id = get_user_company_id(auth.uid())) OR is_superadmin(auth.uid()));

-- Proposals RLS
DROP POLICY IF EXISTS "proposals_select" ON public.proposals;
CREATE POLICY "proposals_select" ON public.proposals
FOR SELECT USING (
  CASE
    WHEN (company_id IS NOT NULL) THEN (
      (company_id = get_user_company_id(auth.uid())) AND 
      (is_company_admin(auth.uid()) OR (owner_user_id = auth.uid()))
    ) OR is_superadmin(auth.uid())
    ELSE (user_id = auth.uid())
  END
);

-- Leads RLS
DROP POLICY IF EXISTS "leads_select" ON public.leads;
CREATE POLICY "leads_select" ON public.leads
FOR SELECT USING (
  CASE
    WHEN (company_id IS NOT NULL) THEN (
      (company_id = get_user_company_id(auth.uid())) AND 
      (is_company_admin(auth.uid()) OR (created_by_user_id = auth.uid()) OR (assigned_to_user_id = auth.uid()))
    ) OR is_superadmin(auth.uid())
    ELSE (user_id = auth.uid())
  END
);

-- Production orders RLS
DROP POLICY IF EXISTS "production_orders_select" ON public.production_orders;
CREATE POLICY "production_orders_select" ON public.production_orders
FOR SELECT USING (
  CASE
    WHEN (company_id IS NOT NULL) THEN (company_id = get_user_company_id(auth.uid())) OR is_superadmin(auth.uid())
    ELSE (user_id = auth.uid())
  END
);

-- Projects RLS
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects
FOR SELECT USING ((company_id = get_user_company_id(auth.uid())) OR is_superadmin(auth.uid()));
