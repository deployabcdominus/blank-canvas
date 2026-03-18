-- Allow superadmins to read all data across tenants for supervision

CREATE POLICY "superadmin_select_all_leads" ON public.leads
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "superadmin_select_all_proposals" ON public.proposals
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "superadmin_select_all_production_orders" ON public.production_orders
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "superadmin_select_all_installations" ON public.installations
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "superadmin_select_all_payments" ON public.payments
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "superadmin_select_all_clients" ON public.clients
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "superadmin_select_all_projects" ON public.projects
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));