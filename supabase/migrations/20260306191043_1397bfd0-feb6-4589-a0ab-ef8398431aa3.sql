
-- C3: Fix multitenancy RLS for installations, installer_companies, team_roles, team_allocations, team_members

-- 1. Add company_id to tables that lack it
ALTER TABLE public.installations ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.installer_companies ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.team_roles ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.team_allocations ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- 2. Backfill company_id from user_id using profiles
UPDATE public.installations SET company_id = (SELECT company_id FROM public.profiles WHERE profiles.id = installations.user_id) WHERE company_id IS NULL;
UPDATE public.installer_companies SET company_id = (SELECT company_id FROM public.profiles WHERE profiles.id = installer_companies.user_id) WHERE company_id IS NULL;
UPDATE public.team_roles SET company_id = (SELECT company_id FROM public.profiles WHERE profiles.id = team_roles.user_id) WHERE company_id IS NULL;
UPDATE public.team_allocations SET company_id = (SELECT company_id FROM public.profiles WHERE profiles.id = team_allocations.user_id) WHERE company_id IS NULL;

-- 3. Fix RLS: installations
DROP POLICY IF EXISTS "Users can manage own installations" ON public.installations;
CREATE POLICY "installations_select" ON public.installations FOR SELECT TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) OR is_superadmin(auth.uid()))
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "installations_insert" ON public.installations FOR INSERT TO authenticated
  WITH CHECK (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "installations_update" ON public.installations FOR UPDATE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "installations_delete" ON public.installations FOR DELETE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) AND (is_company_admin(auth.uid()) OR user_id = auth.uid()))
    ELSE user_id = auth.uid() END
  );

-- 4. Fix RLS: installer_companies
DROP POLICY IF EXISTS "Users can manage own installer companies" ON public.installer_companies;
CREATE POLICY "installer_companies_select" ON public.installer_companies FOR SELECT TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) OR is_superadmin(auth.uid()))
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "installer_companies_insert" ON public.installer_companies FOR INSERT TO authenticated
  WITH CHECK (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "installer_companies_update" ON public.installer_companies FOR UPDATE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "installer_companies_delete" ON public.installer_companies FOR DELETE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()))
    ELSE user_id = auth.uid() END
  );

-- 5. Fix RLS: team_members (already has company_id but wrong RLS)
DROP POLICY IF EXISTS "Users can manage own team members" ON public.team_members;
CREATE POLICY "team_members_select" ON public.team_members FOR SELECT TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) OR is_superadmin(auth.uid()))
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_members_insert" ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_members_update" ON public.team_members FOR UPDATE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_members_delete" ON public.team_members FOR DELETE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()))
    ELSE user_id = auth.uid() END
  );

-- 6. Fix RLS: team_roles
DROP POLICY IF EXISTS "Users can manage own team roles" ON public.team_roles;
CREATE POLICY "team_roles_select" ON public.team_roles FOR SELECT TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) OR is_superadmin(auth.uid()))
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_roles_insert" ON public.team_roles FOR INSERT TO authenticated
  WITH CHECK (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_roles_update" ON public.team_roles FOR UPDATE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_roles_delete" ON public.team_roles FOR DELETE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()))
    ELSE user_id = auth.uid() END
  );

-- 7. Fix RLS: team_allocations
DROP POLICY IF EXISTS "Users can manage own team allocations" ON public.team_allocations;
CREATE POLICY "team_allocations_select" ON public.team_allocations FOR SELECT TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) OR is_superadmin(auth.uid()))
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_allocations_insert" ON public.team_allocations FOR INSERT TO authenticated
  WITH CHECK (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_allocations_update" ON public.team_allocations FOR UPDATE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN company_id = get_user_company_id(auth.uid())
    ELSE user_id = auth.uid() END
  );
CREATE POLICY "team_allocations_delete" ON public.team_allocations FOR DELETE TO authenticated
  USING (
    CASE WHEN company_id IS NOT NULL THEN (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()))
    ELSE user_id = auth.uid() END
  );
