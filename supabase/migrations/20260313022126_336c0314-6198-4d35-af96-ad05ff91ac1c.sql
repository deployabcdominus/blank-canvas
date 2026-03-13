
-- ============================================================
-- VULNERABILITY 1: Fix user_roles self-assignment
-- ============================================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;

-- New policy: only admin/superadmin can assign roles
CREATE POLICY "Only admins can assign roles"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'superadmin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND role != 'superadmin'
  )
);

-- ============================================================
-- VULNERABILITY 2: Add role validation to data table policies
-- ============================================================

-- ── CLIENTS ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Company members can insert clients" ON clients;
CREATE POLICY "Only editors can insert clients"
ON clients FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_my_company_id()
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'operations')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can update clients" ON clients;
CREATE POLICY "Only editors can update clients"
ON clients FOR UPDATE TO authenticated
USING (
  company_id = get_my_company_id()
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'operations')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can delete clients" ON clients;
CREATE POLICY "Only admins can delete clients"
ON clients FOR DELETE TO authenticated
USING (
  company_id = get_my_company_id()
  AND public.has_role(auth.uid(), 'admin')
);

-- ── LEADS ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can insert leads" ON leads;
CREATE POLICY "Only editors can insert leads"
ON leads FOR INSERT TO authenticated
WITH CHECK (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can update leads" ON leads;
CREATE POLICY "Only editors can update leads"
ON leads FOR UPDATE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can delete leads" ON leads;
CREATE POLICY "Only admins can delete leads"
ON leads FOR DELETE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- ── PROPOSALS ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can insert proposals" ON proposals;
CREATE POLICY "Only editors can insert proposals"
ON proposals FOR INSERT TO authenticated
WITH CHECK (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can update proposals" ON proposals;
CREATE POLICY "Only editors can update proposals"
ON proposals FOR UPDATE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can delete proposals" ON proposals;
CREATE POLICY "Only admins can delete proposals"
ON proposals FOR DELETE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- ── PROJECTS ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Company members can insert projects" ON projects;
CREATE POLICY "Only editors can insert projects"
ON projects FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_my_company_id()
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'operations')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can update projects" ON projects;
CREATE POLICY "Only editors can update projects"
ON projects FOR UPDATE TO authenticated
USING (
  company_id = get_my_company_id()
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'operations')
    OR public.has_role(auth.uid(), 'member')
  )
);

DROP POLICY IF EXISTS "Company members can delete projects" ON projects;
CREATE POLICY "Only admins can delete projects"
ON projects FOR DELETE TO authenticated
USING (
  company_id = get_my_company_id()
  AND public.has_role(auth.uid(), 'admin')
);

-- ── INSTALLATIONS ────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can insert installations" ON installations;
CREATE POLICY "Only operations or admin can insert installations"
ON installations FOR INSERT TO authenticated
WITH CHECK (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operations')
  )
);

DROP POLICY IF EXISTS "Company members can update installations" ON installations;
CREATE POLICY "Only operations or admin can update installations"
ON installations FOR UPDATE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operations')
  )
);

DROP POLICY IF EXISTS "Company members can delete installations" ON installations;
CREATE POLICY "Only admins can delete installations"
ON installations FOR DELETE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- ── PRODUCTION ORDERS ────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can insert production_orders" ON production_orders;
CREATE POLICY "Only operations or admin can insert production_orders"
ON production_orders FOR INSERT TO authenticated
WITH CHECK (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operations')
  )
);

DROP POLICY IF EXISTS "Company members can update production_orders" ON production_orders;
CREATE POLICY "Only operations or admin can update production_orders"
ON production_orders FOR UPDATE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operations')
  )
);

DROP POLICY IF EXISTS "Company members can delete production_orders" ON production_orders;
CREATE POLICY "Only admins can delete production_orders"
ON production_orders FOR DELETE TO authenticated
USING (
  (company_id = get_my_company_id() OR user_id = auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);
