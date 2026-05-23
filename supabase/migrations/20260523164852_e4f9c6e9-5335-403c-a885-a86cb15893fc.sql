-- Enhance installer_companies table
ALTER TABLE public.installer_companies 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS active_status TEXT DEFAULT 'active';

-- Create installers table
CREATE TABLE IF NOT EXISTS public.installers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  installer_company_id UUID NOT NULL REFERENCES public.installer_companies(id) ON DELETE CASCADE,
  installer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role_or_specialty TEXT,
  notes TEXT,
  active_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on installers
ALTER TABLE public.installers ENABLE ROW LEVEL SECURITY;

-- Policies for installers
DROP POLICY IF EXISTS "Users can view their company's installers" ON public.installers;
CREATE POLICY "Users can view their company's installers"
  ON public.installers FOR SELECT
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage installers" ON public.installers;
CREATE POLICY "Admins can manage installers"
  ON public.installers FOR ALL
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Enhance installations table (now installation_jobs in workflow)
ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS linked_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS linked_proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS installer_company_id UUID REFERENCES public.installer_companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_installer_id UUID REFERENCES public.installers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS installation_address TEXT,
  ADD COLUMN IF NOT EXISTS installation_time_window TEXT,
  ADD COLUMN IF NOT EXISTS site_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS site_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS access_notes TEXT,
  ADD COLUMN IF NOT EXISTS parking_notes TEXT,
  ADD COLUMN IF NOT EXISTS installation_notes TEXT,
  ADD COLUMN IF NOT EXISTS special_instructions TEXT,
  ADD COLUMN IF NOT EXISTS required_tools_or_equipment TEXT,
  ADD COLUMN IF NOT EXISTS permit_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS customer_presence_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS confirmed_by_admin_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS confirmation_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create project_media for final photos and evidence
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  installation_job_id UUID REFERENCES public.installations(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'before', 'during', 'final', 'issue', 'reference'
  file_url TEXT NOT NULL,
  storage_path TEXT,
  caption TEXT,
  uploaded_by_user_id UUID REFERENCES auth.users(id),
  uploaded_by_role TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visible_to_admin BOOLEAN DEFAULT true,
  notes TEXT
);

-- Enable RLS on project_media
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

-- Policies for project_media
DROP POLICY IF EXISTS "Users can view their company's project media" ON public.project_media;
CREATE POLICY "Users can view their company's project media"
  ON public.project_media FOR SELECT
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert project media" ON public.project_media;
CREATE POLICY "Users can insert project media"
  ON public.project_media FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete project media" ON public.project_media;
CREATE POLICY "Admins can delete project media"
  ON public.project_media FOR DELETE
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on installers
DROP TRIGGER IF EXISTS update_installers_updated_at ON public.installers;
CREATE TRIGGER update_installers_updated_at
BEFORE UPDATE ON public.installers
FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();

-- Seed function for default installer companies (Osvaldito and Norge)
CREATE OR REPLACE FUNCTION public.seed_installer_companies(target_company_id UUID, target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.installer_companies (company_id, user_id, name, contact, email)
  VALUES 
    (target_company_id, target_user_id, 'Osvaldito’s Company', 'Osvaldito', 'osvaldito@example.com'),
    (target_company_id, target_user_id, 'Norge’s Company', 'Norge', 'norge@example.com')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
