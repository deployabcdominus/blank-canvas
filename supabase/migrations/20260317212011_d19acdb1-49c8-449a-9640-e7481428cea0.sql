
-- Operation Templates: predefined step sequences per product type
CREATE TABLE public.operation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_type text NOT NULL,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.operation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view templates"
  ON public.operation_templates FOR SELECT TO authenticated
  USING (company_id = get_my_company_id());

CREATE POLICY "Admin can insert templates"
  ON public.operation_templates FOR INSERT TO authenticated
  WITH CHECK (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations')));

CREATE POLICY "Admin can update templates"
  ON public.operation_templates FOR UPDATE TO authenticated
  USING (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations')));

CREATE POLICY "Admin can delete templates"
  ON public.operation_templates FOR DELETE TO authenticated
  USING (company_id = get_my_company_id() AND has_role(auth.uid(), 'admin'));

-- Add department column to production_steps for filtering
ALTER TABLE public.production_steps ADD COLUMN IF NOT EXISTS department text DEFAULT 'general';

-- Add product_type to production_orders for template linking
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS product_type text;
