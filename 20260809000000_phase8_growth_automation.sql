-- Phase 8: Growth & Marketing Automation Infrastructure

-- 1. Marketing Campaigns Table
CREATE TABLE public.marketing_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text NOT NULL, -- 'email', 'push', 'sms', 'referral'
    status text DEFAULT 'draft', -- 'draft', 'active', 'completed'
    template_id text,
    targeting_criteria jsonb DEFAULT '{}',
    stats jsonb DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "converted": 0}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.marketing_campaigns TO service_role;

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their company marketing campaigns"
    ON public.marketing_campaigns
    FOR ALL
    TO authenticated
    USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Referral Program Table
CREATE TABLE public.referral_programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    reward_type text NOT NULL, -- 'discount', 'credit', 'gift'
    reward_value numeric NOT NULL,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_programs TO authenticated;
GRANT ALL ON public.referral_programs TO service_role;

ALTER TABLE public.referral_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their company referral programs"
    ON public.referral_programs
    FOR ALL
    TO authenticated
    USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- 3. Customer Referrals Tracking
CREATE TABLE public.customer_referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    referrer_customer_id uuid REFERENCES public.customers(id),
    referred_customer_id uuid REFERENCES public.customers(id),
    status text DEFAULT 'pending', -- 'pending', 'converted', 'rewarded'
    reward_applied boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_referrals TO authenticated;
GRANT ALL ON public.customer_referrals TO service_role;

ALTER TABLE public.customer_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their company customer referrals"
    ON public.customer_referrals
    FOR ALL
    TO authenticated
    USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Indexing for performance
CREATE INDEX idx_marketing_company ON public.marketing_campaigns(company_id);
CREATE INDEX idx_referrals_company ON public.customer_referrals(company_id);
