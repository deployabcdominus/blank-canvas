ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS service_types JSONB DEFAULT '["General"]'::jsonb;