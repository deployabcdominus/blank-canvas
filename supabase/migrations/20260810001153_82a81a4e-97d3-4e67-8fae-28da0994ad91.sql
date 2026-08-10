-- Phase 13: Autonomous Intelligence & Enterprise SSO Infrastructure

-- 1. Enterprise SSO Configurations
CREATE TABLE IF NOT EXISTS public.enterprise_sso_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    provider_type text NOT NULL, -- 'saml', 'okta', 'azure_ad'
    entity_id text NOT NULL,
    sso_url text NOT NULL,
    x509_certificate text,
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(company_id)
);

-- 2. AI Voice & Image Processing Transcriptions
CREATE TABLE IF NOT EXISTS public.ai_processing_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    source_type text NOT NULL, -- 'voice_note', 'blueprint_ocr', 'photo_analysis'
    source_id uuid NOT NULL, -- references lead_id or work_order_id
    raw_content_url text,
    transcription text,
    ai_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 3. App Performance Monitoring (PWA Hardening)
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    device_type text,
    os text,
    load_time_ms integer,
    offline_sync_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enterprise_sso_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_sso_configs TO authenticated;
GRANT ALL ON public.enterprise_sso_configs TO service_role;

GRANT SELECT, INSERT ON public.ai_processing_logs TO authenticated;
GRANT ALL ON public.ai_processing_logs TO service_role;

GRANT SELECT, INSERT ON public.performance_metrics TO authenticated;
GRANT ALL ON public.performance_metrics TO service_role;

-- Policies
CREATE POLICY "Users can see their company SSO config"
ON public.enterprise_sso_configs FOR SELECT TO authenticated
USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage SSO"
ON public.enterprise_sso_configs FOR ALL TO authenticated
USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can see their company AI logs"
ON public.ai_processing_logs FOR SELECT TO authenticated
USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can see their company performance metrics"
ON public.performance_metrics FOR SELECT TO authenticated
USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Audit Log
DO $$
DECLARE
    sys_admin_id uuid;
BEGIN
    SELECT id INTO sys_admin_id FROM auth.users LIMIT 1;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_audit_logs') THEN
        INSERT INTO public.platform_audit_logs (actor_id, action_type, target_name, details)
        VALUES (coalesce(sys_admin_id, '00000000-0000-0000-0000-000000000000'), 'SYSTEM_INIT', 'migrations', '{"phase": 13, "description": "Autonomous Intelligence & Enterprise SSO Infrastructure Initialized"}');
    END IF;
END $$;
