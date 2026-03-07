
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'sales', 'operations', 'member', 'viewer');

-- 2. Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  brand_color TEXT DEFAULT 'soft-blue',
  plan_id TEXT,
  enable_network_index BOOLEAN DEFAULT false,
  network_base_path TEXT,
  service_types TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 5. Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  primary_email TEXT,
  primary_phone TEXT,
  notes TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  install_address TEXT DEFAULT '',
  status TEXT DEFAULT 'Lead',
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  folder_relative_path TEXT,
  folder_full_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  service TEXT DEFAULT '',
  status TEXT DEFAULT 'Nuevo',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  location TEXT DEFAULT '',
  value TEXT DEFAULT '',
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client TEXT NOT NULL,
  project TEXT DEFAULT '',
  value NUMERIC DEFAULT 0,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'Borrador',
  sent_date TIMESTAMPTZ,
  sent_method TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  approved_total NUMERIC,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Production orders (work orders) table
CREATE TABLE public.production_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client TEXT NOT NULL,
  project TEXT DEFAULT '',
  status TEXT DEFAULT 'Pendiente',
  progress INTEGER DEFAULT 0,
  materials JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Installations table
CREATE TABLE public.installations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client TEXT NOT NULL,
  project TEXT DEFAULT '',
  status TEXT DEFAULT 'Scheduled',
  location TEXT DEFAULT '',
  scheduled_date TIMESTAMPTZ,
  team TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Installer companies table
CREATE TABLE public.installer_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT DEFAULT '',
  email TEXT DEFAULT '',
  logo_url TEXT,
  services TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. User settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'light',
  glass_effect BOOLEAN DEFAULT true,
  brand_logo TEXT,
  brand_color TEXT DEFAULT 'soft-blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Team roles table
CREATE TABLE public.team_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_id TEXT,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Team allocations table
CREATE TABLE public.team_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES public.installations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT,
  purchaser_email TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  access_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installer_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Companies: owner can manage, company members can view
CREATE POLICY "Owner can manage company" ON public.companies FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Members can view their company" ON public.companies FOR SELECT TO authenticated USING (
  id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- User roles: users can read their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Company-scoped tables: members of same company can access
-- Helper: get user's company_id
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Clients
CREATE POLICY "Company members can view clients" ON public.clients FOR SELECT TO authenticated USING (company_id = public.get_my_company_id());
CREATE POLICY "Company members can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (company_id = public.get_my_company_id());
CREATE POLICY "Company members can update clients" ON public.clients FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id());
CREATE POLICY "Company members can delete clients" ON public.clients FOR DELETE TO authenticated USING (company_id = public.get_my_company_id());

-- Projects
CREATE POLICY "Company members can view projects" ON public.projects FOR SELECT TO authenticated USING (company_id = public.get_my_company_id());
CREATE POLICY "Company members can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (company_id = public.get_my_company_id());
CREATE POLICY "Company members can update projects" ON public.projects FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id());
CREATE POLICY "Company members can delete projects" ON public.projects FOR DELETE TO authenticated USING (company_id = public.get_my_company_id());

-- Leads
CREATE POLICY "Company members can view leads" ON public.leads FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can update leads" ON public.leads FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Company members can delete leads" ON public.leads FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- Proposals
CREATE POLICY "Company members can view proposals" ON public.proposals FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert proposals" ON public.proposals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can update proposals" ON public.proposals FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Company members can delete proposals" ON public.proposals FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- Payments
CREATE POLICY "Company members can view payments" ON public.payments FOR SELECT TO authenticated USING (company_id = public.get_my_company_id());
CREATE POLICY "Company members can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (company_id = public.get_my_company_id());

-- Production orders
CREATE POLICY "Company members can view production_orders" ON public.production_orders FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert production_orders" ON public.production_orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can update production_orders" ON public.production_orders FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Company members can delete production_orders" ON public.production_orders FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- Installations
CREATE POLICY "Company members can view installations" ON public.installations FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert installations" ON public.installations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can update installations" ON public.installations FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Company members can delete installations" ON public.installations FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- Installer companies
CREATE POLICY "Company members can view installer_companies" ON public.installer_companies FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert installer_companies" ON public.installer_companies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can update installer_companies" ON public.installer_companies FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Company members can delete installer_companies" ON public.installer_companies FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- User settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Team roles
CREATE POLICY "Company members can view team_roles" ON public.team_roles FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert team_roles" ON public.team_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can update team_roles" ON public.team_roles FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Company members can delete team_roles" ON public.team_roles FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- Team members
CREATE POLICY "Company members can view team_members" ON public.team_members FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert team_members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can update team_members" ON public.team_members FOR UPDATE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Company members can delete team_members" ON public.team_members FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- Team allocations
CREATE POLICY "Company members can view team_allocations" ON public.team_allocations FOR SELECT TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert team_allocations" ON public.team_allocations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Company members can delete team_allocations" ON public.team_allocations FOR DELETE TO authenticated USING (company_id = public.get_my_company_id() OR user_id = auth.uid());

-- Invitations
CREATE POLICY "Company members can view invitations" ON public.invitations FOR SELECT TO authenticated USING (company_id = public.get_my_company_id());
CREATE POLICY "Company members can insert invitations" ON public.invitations FOR INSERT TO authenticated WITH CHECK (company_id = public.get_my_company_id());
-- Public access for token validation (anon)
CREATE POLICY "Anyone can validate invitation by token" ON public.invitations FOR SELECT TO anon USING (true);

-- Purchases (public read for token validation)
CREATE POLICY "Anyone can view purchases by token" ON public.purchases FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can update purchases" ON public.purchases FOR UPDATE TO authenticated USING (true);

-- Auto-create profile and settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- has_role helper function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
