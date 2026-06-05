-- 1. HARDEN REMAINING FUNCTIONS
-- get_platform_health
ALTER FUNCTION public.get_platform_health() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_platform_health() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_health() TO authenticated;

-- get_weekly_report
ALTER FUNCTION public.get_weekly_report(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_weekly_report(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_weekly_report(uuid) TO authenticated;

-- get_invitation_by_token
ALTER FUNCTION public.get_invitation_by_token(uuid) SET search_path = public;
-- Public/Anon needs this to join a company via link, so we keep public access but ensure it's a safe query.

-- validate_purchase_by_token
ALTER FUNCTION public.validate_purchase_by_token(uuid) SET search_path = public;

-- seed_installer_companies
ALTER FUNCTION public.seed_installer_companies(uuid, uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.seed_installer_companies(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_installer_companies(uuid, uuid) TO authenticated;

-- track_production_status_change
ALTER FUNCTION public.track_production_status_change() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.track_production_status_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_production_status_change() TO authenticated;

-- auto_generate_production_steps
ALTER FUNCTION public.auto_generate_production_steps() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.auto_generate_production_steps() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_generate_production_steps() TO authenticated;

-- guard_project_delete
ALTER FUNCTION public.guard_project_delete() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.guard_project_delete() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guard_project_delete() TO authenticated;

-- guard_client_delete
ALTER FUNCTION public.guard_client_delete() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.guard_client_delete() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guard_client_delete() TO authenticated;

-- notify functions
REVOKE EXECUTE ON FUNCTION public.notify_new_lead() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_new_lead() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.notify_order_completed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_order_completed() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.notify_proposal_approved() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_proposal_approved() TO authenticated;

-- 2. RLS REFINEMENT: installer_companies & installers
DROP POLICY IF EXISTS "Admins can manage installers" ON public.installer_companies;
CREATE POLICY "Admins can manage installer companies" ON public.installer_companies 
FOR ALL TO authenticated 
USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)));

DROP POLICY IF EXISTS "Users can view their company's installers" ON public.installer_companies;
CREATE POLICY "Users can view their company's installer companies" ON public.installer_companies 
FOR SELECT TO authenticated 
USING (company_id = get_my_company_id());

DROP POLICY IF EXISTS "Admins can manage installers" ON public.installers;
CREATE POLICY "Admins can manage installers" ON public.installers 
FOR ALL TO authenticated 
USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)));

DROP POLICY IF EXISTS "Users can view their company's installers" ON public.installers;
CREATE POLICY "Users can view their company's installers" ON public.installers 
FOR SELECT TO authenticated 
USING (company_id = get_my_company_id());

-- Security events should be restricted
DROP POLICY IF EXISTS "Only superadmins view security events" ON public.security_events;
CREATE POLICY "Only superadmins view security events" ON public.security_events 
FOR SELECT TO authenticated 
USING (has_role(auth.uid(), 'superadmin'::app_role));
