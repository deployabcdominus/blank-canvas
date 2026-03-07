
-- Fix purchases policies to be more restrictive
DROP POLICY IF EXISTS "Anyone can create purchases" ON public.purchases;
CREATE POLICY "Anon can create purchases"
  ON public.purchases FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'paid');

DROP POLICY IF EXISTS "Authenticated users can update purchases" ON public.purchases;
CREATE POLICY "Purchase owner can update own purchase"
  ON public.purchases FOR UPDATE
  TO authenticated
  USING (purchaser_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Fix invitations update policy  
DROP POLICY IF EXISTS "Authenticated can accept invitations" ON public.invitations;
CREATE POLICY "Invited user can accept invitation"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())) AND accepted_at IS NULL);
