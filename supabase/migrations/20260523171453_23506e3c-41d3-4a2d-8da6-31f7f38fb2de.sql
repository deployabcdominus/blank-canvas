ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS pilot_tag TEXT;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS pilot_tag TEXT;
