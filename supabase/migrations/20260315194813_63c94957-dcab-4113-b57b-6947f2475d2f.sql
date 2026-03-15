
-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_label text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast queries
CREATE INDEX idx_audit_logs_company_created ON public.audit_logs (company_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admin/superadmin of the same company can read
CREATE POLICY "Admin can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  company_id = get_my_company_id_safe()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'))
);

-- Any authenticated user in the company can insert (logging happens from client)
CREATE POLICY "Authenticated can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (company_id = get_my_company_id_safe());
