
-- 1) Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info', -- success, info, warning
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3) RLS: users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4) RLS: authenticated can insert notifications for their company
CREATE POLICY "Authenticated can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_my_company_id_safe());

-- 5) RLS: users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 6) RLS: service role / triggers can insert (for DB triggers)
CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 7) Index for fast lookups
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read) WHERE is_read = false;

-- 8) Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 9) Trigger function: auto-create notification when proposal is approved
CREATE OR REPLACE FUNCTION public.notify_proposal_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_admin_id uuid;
  v_company_id uuid;
BEGIN
  -- Only fire when status changes to 'Aprobada'
  IF NEW.status = 'Aprobada' AND (OLD.status IS DISTINCT FROM 'Aprobada') THEN
    v_company_id := NEW.company_id;
    
    -- Notify all admins in the company
    FOR v_admin_id IN
      SELECT ur.user_id FROM user_roles ur
      JOIN profiles p ON p.id = ur.user_id
      WHERE p.company_id = v_company_id
        AND ur.role IN ('admin', 'superadmin')
    LOOP
      INSERT INTO notifications (user_id, company_id, type, title, message, link)
      VALUES (
        v_admin_id,
        v_company_id,
        'success',
        '🚀 ¡Propuesta Aprobada!',
        'El cliente ' || NEW.client || ' ha firmado la propuesta.',
        '/proposals'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proposal_approved
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_proposal_approved();

-- 10) Trigger function: auto-create notification when a new lead is created
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_admin_id uuid;
  v_company_id uuid;
BEGIN
  v_company_id := NEW.company_id;
  IF v_company_id IS NULL THEN RETURN NEW; END IF;

  FOR v_admin_id IN
    SELECT ur.user_id FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    WHERE p.company_id = v_company_id
      AND ur.role IN ('admin', 'superadmin')
  LOOP
    INSERT INTO notifications (user_id, company_id, type, title, message, link)
    VALUES (
      v_admin_id,
      v_company_id,
      'info',
      '📥 Nuevo Lead',
      'Se ha registrado el lead: ' || NEW.name,
      '/leads'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_lead();
