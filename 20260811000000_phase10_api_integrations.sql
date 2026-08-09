-- Phase 10: Ecosystem Integrations and Open API
-- Tables for API management and external tool connections

-- 1. API Keys Management
CREATE TABLE public.api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    key_name text NOT NULL,
    key_prefix text NOT NULL, -- First 8 chars for identification
    hashed_key text NOT NULL UNIQUE, -- Store hashed version for security
    last_used_at timestamptz,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Webhook Configurations
CREATE TABLE public.webhook_endpoints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    url text NOT NULL,
    description text,
    secret_token text, -- For verification
    events text[] NOT NULL, -- e.g., ['lead.created', 'order.completed']
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Integration Settings (External Apps)
CREATE TABLE public.integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    provider text NOT NULL, -- 'quickbooks', 'stripe', 'slack', 'zapier'
    config jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'disconnected',
    last_sync_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(company_id, provider)
);

-- RLS Enablement
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_endpoints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;

GRANT ALL ON public.api_keys TO service_role;
GRANT ALL ON public.webhook_endpoints TO service_role;
GRANT ALL ON public.integrations TO service_role;

-- Policies
CREATE POLICY "Users can manage their company API keys"
ON public.api_keys FOR ALL TO authenticated
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company webhooks"
ON public.webhook_endpoints FOR ALL TO authenticated
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company integrations"
ON public.integrations FOR ALL TO authenticated
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX idx_api_keys_company ON public.api_keys(company_id);
CREATE INDEX idx_webhooks_company ON public.webhook_endpoints(company_id);
CREATE INDEX idx_integrations_company ON public.integrations(company_id);
