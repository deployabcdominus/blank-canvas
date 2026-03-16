
-- Add proposal_id to production_orders for traceability
ALTER TABLE public.production_orders
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL;

-- Create unique index so only one order per proposal
CREATE UNIQUE INDEX IF NOT EXISTS idx_production_orders_proposal_id_unique
  ON public.production_orders (proposal_id) WHERE proposal_id IS NOT NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_production_orders_proposal_id
  ON public.production_orders (proposal_id) WHERE proposal_id IS NOT NULL;
