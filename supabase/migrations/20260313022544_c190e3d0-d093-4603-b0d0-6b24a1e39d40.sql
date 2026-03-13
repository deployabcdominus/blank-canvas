
-- Allow admins to update roles within their company (not superadmin)
-- Allow superadmins to update any role
CREATE POLICY "Only admins can update roles"
ON user_roles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'superadmin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND user_id != auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'superadmin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND role != 'superadmin'
  )
);
