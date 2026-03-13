ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'media';
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS installer_company_id UUID REFERENCES public.installer_companies(id);