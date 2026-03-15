
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clients;

CREATE POLICY "Only admins can delete clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    (company_id = get_my_company_id())
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'superadmin'::app_role)
    )
  );
