
-- 1) Add enable_network_index and network_base_path to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS enable_network_index boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS network_base_path text;

-- 2) Create clients table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  primary_email text,
  primary_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS: All tenant members can SELECT
CREATE POLICY "clients_select" ON public.clients FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- RLS: All tenant members can INSERT
CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS: Admin can update any, members can update own
CREATE POLICY "clients_update" ON public.clients FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- RLS: Only admin can delete
CREATE POLICY "clients_delete" ON public.clients FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3) Create projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  install_address text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Lead',
  owner_user_id uuid NOT NULL,
  assigned_to_user_id uuid,
  folder_relative_path text,
  folder_full_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS: All tenant members can SELECT (everyone sees all projects for tracking)
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- Admin can update any; non-admin only own projects
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (is_company_admin(auth.uid()) OR owner_user_id = auth.uid()));

CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()));

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4) Add client_id and project_id to existing tables
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.production_orders
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
