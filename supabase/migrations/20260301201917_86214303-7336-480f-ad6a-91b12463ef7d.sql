
-- 1. Plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans (public)
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- Seed the 3 plans
INSERT INTO public.plans (name, price, features) VALUES
  ('Inicial', '$29/mes', '["Hasta 50 leads", "1 usuario", "Pipeline básico", "Soporte por email"]'::jsonb),
  ('Profesional', '$59/mes', '["Hasta 500 leads", "5 usuarios", "Pipeline avanzado", "Reportes", "Soporte prioritario"]'::jsonb),
  ('Empresarial', '$99/mes', '["Leads ilimitados", "Usuarios ilimitados", "Pipeline completo", "API Access", "Soporte 24/7", "Personalización"]'::jsonb);

-- 2. Purchases table
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.plans(id) NOT NULL,
  purchaser_email text NOT NULL,
  company_id uuid REFERENCES public.companies(id),
  access_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'paid',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert purchases (checkout before auth)
CREATE POLICY "Anyone can create purchases"
  ON public.purchases FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading by token (for /access page) - using anon too
CREATE POLICY "Anyone can read purchases by token"
  ON public.purchases FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow updating purchase to link company_id
CREATE POLICY "Authenticated users can update purchases"
  ON public.purchases FOR UPDATE
  TO authenticated
  USING (true);

-- 3. Invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage invitations for their company
CREATE POLICY "Company admins can manage invitations"
  ON public.invitations FOR ALL
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND is_company_admin(auth.uid()));

-- Anyone can read invitations by token (for /invite page validation)
CREATE POLICY "Anyone can read invitations by token"
  ON public.invitations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can accept invitations (update accepted_at)
CREATE POLICY "Authenticated can accept invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (true);

-- Add plan_id to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id);
