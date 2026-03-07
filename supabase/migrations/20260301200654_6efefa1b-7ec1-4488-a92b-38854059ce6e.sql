
-- Fix companies SELECT: allow both company members AND the original creator
DROP POLICY IF EXISTS "Company members can view company" ON public.companies;
CREATE POLICY "Company members can view company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR id = get_user_company_id(auth.uid())
  );

-- Fix companies UPDATE: allow creator OR company admin
DROP POLICY IF EXISTS "Company admins can update company" ON public.companies;
CREATE POLICY "Company admins can update company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (
    (user_id = auth.uid()) 
    OR (id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()))
  );
