
-- Trigger: Notify admins when a production_order status changes to 'Finalizada'
CREATE OR REPLACE FUNCTION public.notify_order_completed()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_admin_id uuid;
  v_company_id uuid;
BEGIN
  IF NEW.status = 'Finalizada' AND (OLD.status IS DISTINCT FROM 'Finalizada') THEN
    v_company_id := NEW.company_id;
    IF v_company_id IS NULL THEN RETURN NEW; END IF;

    FOR v_admin_id IN
      SELECT ur.user_id FROM user_roles ur
      JOIN profiles p ON p.id = ur.user_id
      WHERE p.company_id = v_company_id
        AND ur.role IN ('admin', 'superadmin', 'operations')
    LOOP
      INSERT INTO notifications (user_id, company_id, type, title, message, link)
      VALUES (
        v_admin_id,
        v_company_id,
        'order',
        '✅ Orden Finalizada',
        'La orden para ' || NEW.client || ' — ' || COALESCE(NEW.project, '') || ' se ha completado.',
        '/work-orders'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_notify_order_completed ON production_orders;
CREATE TRIGGER trg_notify_order_completed
  AFTER UPDATE ON production_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_completed();
