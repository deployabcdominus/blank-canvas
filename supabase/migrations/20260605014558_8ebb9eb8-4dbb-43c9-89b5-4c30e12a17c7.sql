-- 1. HARDEN FUNCTIONS (SET search_path and EXECUTE permissions)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.auto_generate_production_steps() SET search_path = public;
ALTER FUNCTION public.guard_project_delete() SET search_path = public;
ALTER FUNCTION public.create_company(uuid, text, text, text, text, uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.create_company(uuid, text, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company(uuid, text, text, text, text, uuid) TO authenticated;

ALTER FUNCTION public.get_my_company_id() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_my_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;

ALTER FUNCTION public.get_my_company_id_safe() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_my_company_id_safe() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_company_id_safe() TO authenticated;

ALTER FUNCTION public.handle_new_user() SET search_path = public;

ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

ALTER FUNCTION public.log_security_event(text, jsonb, uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_security_event(text, jsonb, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, jsonb, uuid) TO authenticated;

ALTER FUNCTION public.recalc_order_progress() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.recalc_order_progress() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recalc_order_progress() TO authenticated;

ALTER FUNCTION public.recalc_project_progress(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.recalc_project_progress(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recalc_project_progress(uuid) TO authenticated;

ALTER FUNCTION public.track_production_status_change() SET search_path = public;
ALTER FUNCTION public.validate_poi_token(text) SET search_path = public;
ALTER FUNCTION public.notify_new_lead() SET search_path = public;
ALTER FUNCTION public.notify_order_completed() SET search_path = public;
ALTER FUNCTION public.notify_proposal_approved() SET search_path = public;
ALTER FUNCTION public.seed_installer_companies(uuid, uuid) SET search_path = public;

-- 2. DATABASE INTEGRITY: Add Foreign Keys for company_id
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_clients_company') THEN
        ALTER TABLE public.clients ADD CONSTRAINT fk_clients_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_projects_company') THEN
        ALTER TABLE public.projects ADD CONSTRAINT fk_projects_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_leads_company') THEN
        ALTER TABLE public.leads ADD CONSTRAINT fk_leads_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_proposals_company') THEN
        ALTER TABLE public.proposals ADD CONSTRAINT fk_proposals_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_production_orders_company') THEN
        ALTER TABLE public.production_orders ADD CONSTRAINT fk_production_orders_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_production_history_company') THEN
        ALTER TABLE public.production_order_status_history ADD CONSTRAINT fk_production_history_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. PERFORMANCE: Add missing indexes on company_id
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_company_id ON public.pilot_feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_pilot_checklist_company_id ON public.pilot_checklist(company_id);
CREATE INDEX IF NOT EXISTS idx_team_roles_company_id ON public.team_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_company_id ON public.team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON public.invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_production_order_status_history_company_id ON public.production_order_status_history(company_id);
CREATE INDEX IF NOT EXISTS idx_security_events_company_id ON public.security_events(company_id);
CREATE INDEX IF NOT EXISTS idx_installers_company_id ON public.installers(company_id);
CREATE INDEX IF NOT EXISTS idx_production_steps_company_id ON public.production_steps(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_operation_templates_company_id ON public.operation_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_project_media_company_id ON public.project_media(company_id);
CREATE INDEX IF NOT EXISTS idx_project_closing_history_company_id ON public.project_closing_history(company_id);

-- 4. RLS HARDENING: Explicit roles
-- Pilot tables
DROP POLICY IF EXISTS "Admins can update pilot feedback for their company" ON public.pilot_feedback;
CREATE POLICY "Admins can update pilot feedback for their company" ON public.pilot_feedback FOR UPDATE TO authenticated USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)));

DROP POLICY IF EXISTS "Users can create pilot feedback for their company" ON public.pilot_feedback;
CREATE POLICY "Users can create pilot feedback for their company" ON public.pilot_feedback FOR INSERT TO authenticated WITH CHECK (company_id = get_my_company_id());

DROP POLICY IF EXISTS "Users can view pilot feedback for their company" ON public.pilot_feedback;
CREATE POLICY "Users can view pilot feedback for their company" ON public.pilot_feedback FOR SELECT TO authenticated USING (company_id = get_my_company_id());

DROP POLICY IF EXISTS "Admins can manage pilot checklist for their company" ON public.pilot_checklist;
CREATE POLICY "Admins can manage pilot checklist for their company" ON public.pilot_checklist FOR ALL TO authenticated USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)));

DROP POLICY IF EXISTS "Users can view pilot checklist for their company" ON public.pilot_checklist;
CREATE POLICY "Users can view pilot checklist for their company" ON public.pilot_checklist FOR SELECT TO authenticated USING (company_id = get_my_company_id());

-- Production history
DROP POLICY IF EXISTS "Users can insert production history" ON public.production_order_status_history;
CREATE POLICY "Users can insert production history" ON public.production_order_status_history FOR INSERT TO authenticated WITH CHECK (company_id = get_my_company_id());

DROP POLICY IF EXISTS "Users can view their company's production history" ON public.production_order_status_history;
CREATE POLICY "Users can view their company's production history" ON public.production_order_status_history FOR SELECT TO authenticated USING (company_id = get_my_company_id());

-- Proposals Public Token Access
DROP POLICY IF EXISTS "Public can view proposal by token match" ON public.proposals;
CREATE POLICY "Public can view proposal by token match" ON public.proposals FOR SELECT TO anon, authenticated USING (approval_token IS NOT NULL);

-- Audit Logs
DROP POLICY IF EXISTS "Admins can view company audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view company audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)));
