-- Allow authenticated users to update invitations they were invited to (by matching email)
CREATE POLICY "Invited user can accept invitation"
ON public.invitations
FOR UPDATE
TO authenticated
USING (lower(email) = lower(auth.email()))
WITH CHECK (lower(email) = lower(auth.email()));