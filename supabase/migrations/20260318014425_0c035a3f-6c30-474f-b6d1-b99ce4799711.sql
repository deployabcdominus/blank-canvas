
-- 1. Create a SECURITY DEFINER RPC to validate purchase by access_token (for anon use)
CREATE OR REPLACE FUNCTION public.validate_purchase_by_token(p_access_token uuid)
RETURNS TABLE(id uuid, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.status
  FROM public.purchases p
  WHERE p.access_token = p_access_token
  LIMIT 1;
$$;

-- 2. Drop the overly permissive anon SELECT policy
DROP POLICY IF EXISTS "Anyone can view purchases by token" ON purchases;

-- 3. Add a company-scoped authenticated SELECT policy (for onboarding/checkout flows)
CREATE POLICY "Authenticated can view own purchases"
ON purchases
FOR SELECT
TO authenticated
USING (
  company_id IS NULL
  OR company_id = get_my_company_id_safe()
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'superadmin')
  )
);
