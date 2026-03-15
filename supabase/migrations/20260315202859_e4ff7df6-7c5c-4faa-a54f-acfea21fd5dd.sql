
-- Add approval_token to proposals for secure public access
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS approval_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS signer_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS signer_ip text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS signer_user_agent text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS signature_data text DEFAULT NULL;

-- Create unique index on approval_token
CREATE UNIQUE INDEX IF NOT EXISTS idx_proposals_approval_token ON public.proposals(approval_token);

-- Allow anonymous users to read a single proposal by approval_token
CREATE POLICY "Public can view proposal by approval_token"
  ON public.proposals
  FOR SELECT
  TO anon
  USING (approval_token IS NOT NULL);
