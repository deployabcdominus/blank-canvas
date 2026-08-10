-- Phase 12: Global Scaling & Multi-Region Infrastructure

-- 1. Create regions table
CREATE TABLE IF NOT EXISTS public.regions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    code text NOT NULL, -- e.g., 'us-east', 'eu-west'
    timezone text DEFAULT 'UTC',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(company_id, code)
);

-- 2. Create localized_settings for region-specific overrides (currency, date formats)
CREATE TABLE IF NOT EXISTS public.region_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id uuid REFERENCES public.regions(id) ON DELETE CASCADE NOT NULL,
    currency_code text DEFAULT 'USD',
    date_format text DEFAULT 'MM/DD/YYYY',
    language_code text DEFAULT 'en',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(region_id)
);

-- 4. Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_settings ENABLE ROW LEVEL SECURITY;

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.regions TO authenticated;
GRANT ALL ON public.regions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.region_settings TO authenticated;
GRANT ALL ON public.region_settings TO service_role;

-- 6. Policies (Isolation by company_id)
-- Note: Using the established get_my_company_id_safe() helper if available, or simple subquery
CREATE POLICY "Users can see regions from their company"
ON public.regions
FOR SELECT
TO authenticated
USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage regions"
ON public.regions
FOR ALL
TO authenticated
USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()) 
    AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can see region settings"
ON public.region_settings
FOR SELECT
TO authenticated
USING (
    region_id IN (
        SELECT id FROM public.regions 
        WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
);

-- 7. Audit Logging for scaling events (Using correct columns identified in schema)
-- We skip this if company_id cannot be determined in a system context, 
-- but for migration records we usually log system events to platform_audit_logs if it exists
DO $$
DECLARE
    sys_admin_id uuid;
BEGIN
    SELECT id INTO sys_admin_id FROM auth.users LIMIT 1;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_audit_logs') THEN
        INSERT INTO public.platform_audit_logs (actor_id, action_type, target_name, details)
        VALUES (coalesce(sys_admin_id, '00000000-0000-0000-0000-000000000000'), 'SYSTEM_INIT', 'migrations', '{"phase": 12, "description": "Global Scaling Infrastructure Initialized"}');
    END IF;
END $$;
