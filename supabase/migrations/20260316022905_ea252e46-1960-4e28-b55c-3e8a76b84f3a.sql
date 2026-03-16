-- Performance indexes for CRM queries filtered by company_id, status, created_at
CREATE INDEX IF NOT EXISTS idx_leads_company_status ON public.leads (company_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_company_created ON public.leads (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_company_status ON public.proposals (company_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_company_created ON public.proposals (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_production_orders_company_status ON public.production_orders (company_id, status);
CREATE INDEX IF NOT EXISTS idx_production_orders_company_created ON public.production_orders (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_company_created ON public.payments (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_installations_company_status ON public.installations (company_id, status);
CREATE INDEX IF NOT EXISTS idx_installations_company_scheduled ON public.installations (company_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients (company_id, client_name);
CREATE INDEX IF NOT EXISTS idx_projects_company_status ON public.projects (company_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles (company_id);