-- Add client_id to production_orders for proper client linking
ALTER TABLE public.production_orders
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_production_orders_client_id ON public.production_orders (client_id);