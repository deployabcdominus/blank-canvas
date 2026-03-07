
-- Fix overly permissive purchases UPDATE policy
DROP POLICY "Authenticated can update purchases" ON public.purchases;

-- Only allow updating purchases where company_id matches or is null (for initial linking)
CREATE POLICY "Authenticated can update own purchases" ON public.purchases
  FOR UPDATE TO authenticated
  USING (company_id IS NULL OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
