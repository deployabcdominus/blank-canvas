
-- Add missing columns and tables

-- 1. Add accepted_at to invitations
ALTER TABLE public.invitations ADD COLUMN accepted_at TIMESTAMPTZ;

-- 2. Add is_active to companies
ALTER TABLE public.companies ADD COLUMN is_active BOOLEAN DEFAULT true;

-- 3. Create plans table
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable
CREATE POLICY "Anyone can view plans" ON public.plans FOR SELECT USING (true);

-- Seed default plans
INSERT INTO public.plans (name, description, price) VALUES
  ('Inicial', 'Plan básico para empezar', 0),
  ('Profesional', 'Para equipos en crecimiento', 49),
  ('Empresarial', 'Para grandes empresas', 99);
