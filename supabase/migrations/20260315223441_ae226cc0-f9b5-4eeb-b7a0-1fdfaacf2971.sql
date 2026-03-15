
-- Platform audit logs for superadmin actions
CREATE TABLE public.platform_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action_type text NOT NULL,
  target_name text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: only superadmins can read and write
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin can view platform audit logs"
  ON public.platform_audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can insert platform audit logs"
  ON public.platform_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Index for fast chronological queries
CREATE INDEX idx_platform_audit_logs_created ON public.platform_audit_logs (created_at DESC);
