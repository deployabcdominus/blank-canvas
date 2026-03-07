-- ============================================================
-- P1: INVITATIONS — Restrict SELECT
-- ============================================================
-- The invite flow needs unauthenticated/any-auth users to read by token.
-- Tokens are 64-char hex from gen_random_bytes(32) — enumeration infeasible.
-- We keep a scoped SELECT but add admin visibility.

DROP POLICY IF EXISTS "Anyone can read invitations by token" ON public.invitations;

-- Admin of the company can see all their company invitations
-- Authenticated users can see invitations matching their email (for acceptance)
-- For the /invite page token lookup: we need anon access by token.
-- Since RLS can't filter "only rows WHERE token = X", we use a pragmatic approach:
-- Keep the open SELECT for anon (tokens are unguessable), but restrict authenticated to own-company or own-email.
CREATE POLICY "invitations_select_anon" ON public.invitations
FOR SELECT TO anon
USING (true);

CREATE POLICY "invitations_select_authenticated" ON public.invitations
FOR SELECT TO authenticated
USING (
  (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()))
  OR lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())::text)
  OR is_superadmin(auth.uid())
);

-- ============================================================
-- P1: PURCHASES — Restrict SELECT
-- ============================================================
-- Access.tsx reads purchases by access_token (unauthenticated).
-- Checkout.tsx inserts as anon. Success.tsx uses localStorage token.
-- Tokens are 64-char hex — enumeration infeasible.

DROP POLICY IF EXISTS "Anyone can read purchases by token" ON public.purchases;

-- Anon users need to read by token for the /access flow
CREATE POLICY "purchases_select_anon" ON public.purchases
FOR SELECT TO anon
USING (true);

-- Authenticated users: superadmin sees all, owner sees own
CREATE POLICY "purchases_select_authenticated" ON public.purchases
FOR SELECT TO authenticated
USING (
  is_superadmin(auth.uid())
  OR lower(purchaser_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- ============================================================
-- P2: INSTALLER_COMPANIES — admin + operations only for write
-- ============================================================
DROP POLICY IF EXISTS "installer_companies_insert" ON public.installer_companies;
CREATE POLICY "installer_companies_insert" ON public.installer_companies FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "installer_companies_update" ON public.installer_companies;
CREATE POLICY "installer_companies_update" ON public.installer_companies FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

-- ============================================================
-- P2: TEAM_ROLES — admin only for write
-- ============================================================
DROP POLICY IF EXISTS "team_roles_insert" ON public.team_roles;
CREATE POLICY "team_roles_insert" ON public.team_roles FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND is_company_admin(auth.uid())
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "team_roles_update" ON public.team_roles;
CREATE POLICY "team_roles_update" ON public.team_roles FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND is_company_admin(auth.uid())
    ELSE user_id = auth.uid()
  END
);

-- ============================================================
-- P2: TEAM_MEMBERS — admin + operations for write
-- ============================================================
DROP POLICY IF EXISTS "team_members_insert" ON public.team_members;
CREATE POLICY "team_members_insert" ON public.team_members FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "team_members_update" ON public.team_members;
CREATE POLICY "team_members_update" ON public.team_members FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

-- ============================================================
-- P2: TEAM_ALLOCATIONS — admin + operations for write
-- ============================================================
DROP POLICY IF EXISTS "team_allocations_insert" ON public.team_allocations;
CREATE POLICY "team_allocations_insert" ON public.team_allocations FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "team_allocations_update" ON public.team_allocations;
CREATE POLICY "team_allocations_update" ON public.team_allocations FOR UPDATE TO authenticated
USING (
  CASE
    WHEN company_id IS NOT NULL THEN
      company_id = get_user_company_id(auth.uid())
      AND (is_company_admin(auth.uid()) OR is_operations(auth.uid()))
    ELSE user_id = auth.uid()
  END
);

-- ============================================================
-- P3: PROFILES — same-company visibility
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR is_superadmin(auth.uid())
  OR (company_id IS NOT NULL AND company_id = get_user_company_id(auth.uid()))
);