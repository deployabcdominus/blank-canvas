-- 1. Hardening functions
DO $$
BEGIN
    -- get_invitation_by_token
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'get_invitation_by_token') THEN
        EXECUTE 'ALTER FUNCTION public.get_invitation_by_token(p_token uuid) SECURITY INVOKER';
    END IF;

    -- get_platform_health
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'get_platform_health') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_platform_health() FROM public';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_platform_health() TO authenticated';
    END IF;

    -- get_weekly_report
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'get_weekly_report') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_weekly_report(uuid) FROM public';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_weekly_report(uuid) TO authenticated';
    END IF;
END $$;

-- 2. Security Audit Logging
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES public.companies(id),
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 3. Policy for security events
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only superadmins view security events') THEN
        EXECUTE 'CREATE POLICY "Only superadmins view security events" 
        ON public.security_events FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = ''superadmin''::app_role
          )
        )';
    END IF;
END $$;

-- 4. Helper function for security logging
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_company_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO public.security_events (event_type, actor_id, company_id, details)
    VALUES (p_event_type, auth.uid(), COALESCE(p_company_id, (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)), p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
