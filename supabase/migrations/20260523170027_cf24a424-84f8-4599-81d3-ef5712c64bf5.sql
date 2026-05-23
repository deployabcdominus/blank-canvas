-- Enhance companies table for SaaS readiness
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS company_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS auto_create_production_orders BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS design_review_by_default BOOLEAN DEFAULT true;
