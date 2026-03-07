
-- Add approved_total and approved_at to proposals
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS approved_total numeric NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone NULL;

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  method text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'received',
  paid_at timestamp with time zone NOT NULL DEFAULT now(),
  note text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments (multitenant)
CREATE POLICY "payments_select" ON public.payments
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "payments_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "payments_delete" ON public.payments
  FOR DELETE TO authenticated
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (is_company_admin(auth.uid()) OR created_by = auth.uid())
  );
