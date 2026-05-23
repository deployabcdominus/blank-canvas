-- 1. Enhance Leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS broker_name TEXT,
ADD COLUMN IF NOT EXISTS broker_phone TEXT,
ADD COLUMN IF NOT EXISTS broker_email TEXT,
ADD COLUMN IF NOT EXISTS broker_notes TEXT,
ADD COLUMN IF NOT EXISTS informal_notes TEXT,
ADD COLUMN IF NOT EXISTS agreed_price DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS intake_quality TEXT DEFAULT 'partial',
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
ADD COLUMN IF NOT EXISTS created_by_role TEXT;

-- Update existing leads to have a default intake quality if missing
UPDATE public.leads SET intake_quality = 'complete' WHERE intake_quality IS NULL AND name IS NOT NULL AND email IS NOT NULL;

-- 2. Enhance Proposals table
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS sent_via TEXT,
ADD COLUMN IF NOT EXISTS external_sent_reference TEXT,
ADD COLUMN IF NOT EXISTS sent_notes TEXT,
ADD COLUMN IF NOT EXISTS client_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS client_approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS initial_payment_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS initial_payment_received BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS initial_payment_amount DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS admin_override_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_override_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS admin_override_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_for_production BOOLEAN DEFAULT false;

-- Create an index for lead_source and broker_name for better filtering later
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON public.leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_broker_name ON public.leads(broker_name);
CREATE INDEX IF NOT EXISTS idx_proposals_approved_production ON public.proposals(approved_for_production);
