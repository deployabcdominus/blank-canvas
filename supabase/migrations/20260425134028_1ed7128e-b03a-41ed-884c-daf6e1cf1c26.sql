-- Drop the existing DELETE policy if it exists
DROP POLICY IF EXISTS "Admin can delete user_roles" ON public.user_roles;

-- Create a new policy that only allows superadmins to delete roles
CREATE POLICY "Only superadmins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'superadmin'::public.app_role)
);