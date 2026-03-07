
-- Allow superadmin to delete companies
CREATE POLICY "Superadmin can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (is_superadmin(auth.uid()));
