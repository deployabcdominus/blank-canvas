-- Drop if exists and recreate all policies

-- Payments
DROP POLICY IF EXISTS "Company members can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can delete payments" ON public.payments;

CREATE POLICY "Company members can update payments"
ON public.payments FOR UPDATE TO authenticated
USING (company_id = get_my_company_id_safe());

CREATE POLICY "Admin can delete payments"
ON public.payments FOR DELETE TO authenticated
USING (
  company_id = get_my_company_id_safe()
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Invitations
DROP POLICY IF EXISTS "Admin can update invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admin can delete invitations" ON public.invitations;

CREATE POLICY "Admin can update invitations"
ON public.invitations FOR UPDATE TO authenticated
USING (company_id = get_my_company_id_safe())
WITH CHECK (company_id = get_my_company_id_safe());

CREATE POLICY "Admin can delete invitations"
ON public.invitations FOR DELETE TO authenticated
USING (
  company_id = get_my_company_id_safe()
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Purchases
DROP POLICY IF EXISTS "Company members can insert purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admin can delete purchases" ON public.purchases;

CREATE POLICY "Company members can insert purchases"
ON public.purchases FOR INSERT TO authenticated
WITH CHECK (company_id = get_my_company_id_safe());

CREATE POLICY "Admin can delete purchases"
ON public.purchases FOR DELETE TO authenticated
USING (
  company_id = get_my_company_id_safe()
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);