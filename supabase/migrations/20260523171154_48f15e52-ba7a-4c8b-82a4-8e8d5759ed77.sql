-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add pilot_tag to leads and projects
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS pilot_tag TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pilot_tag TEXT;

-- Create pilot_feedback table
CREATE TABLE public.pilot_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL DEFAULT get_my_company_id() REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
    issue_type TEXT NOT NULL,
    module TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Pending',
    suggested_improvement TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pilot_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for pilot_feedback
CREATE POLICY "Users can view pilot feedback for their company"
    ON public.pilot_feedback FOR SELECT
    USING (company_id = get_my_company_id());

CREATE POLICY "Users can create pilot feedback for their company"
    ON public.pilot_feedback FOR INSERT
    WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "Admins can update pilot feedback for their company"
    ON public.pilot_feedback FOR UPDATE
    USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)));

-- Create pilot_checklist table to track completion of pilot steps
CREATE TABLE public.pilot_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL DEFAULT get_my_company_id() REFERENCES public.companies(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID DEFAULT auth.uid() REFERENCES auth.users(id),
    UNIQUE(company_id, item_key)
);

-- Enable RLS
ALTER TABLE public.pilot_checklist ENABLE ROW LEVEL SECURITY;

-- Create policies for pilot_checklist
CREATE POLICY "Users can view pilot checklist for their company"
    ON public.pilot_checklist FOR SELECT
    USING (company_id = get_my_company_id());

CREATE POLICY "Admins can manage pilot checklist for their company"
    ON public.pilot_checklist FOR ALL
    USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)));

-- Add triggers for updated_at
CREATE TRIGGER update_pilot_feedback_updated_at
    BEFORE UPDATE ON public.pilot_feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pilot_checklist_updated_at
    BEFORE UPDATE ON public.pilot_checklist
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
