ALTER TABLE public.production_orders 
ADD COLUMN IF NOT EXISTS technical_details jsonb DEFAULT '{}'::jsonb;