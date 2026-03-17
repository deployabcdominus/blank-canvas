
-- 1. Trigger: Auto-generate production_steps when a production_order is inserted with a product_type
CREATE OR REPLACE FUNCTION public.auto_generate_production_steps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tpl record;
  step jsonb;
  i integer := 0;
BEGIN
  -- Only fire on INSERT or when product_type changes from NULL
  IF NEW.product_type IS NULL OR NEW.company_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if steps already exist for this order
  IF EXISTS (SELECT 1 FROM production_steps WHERE production_order_id = NEW.id LIMIT 1) THEN
    RETURN NEW;
  END IF;

  -- Find matching template
  SELECT * INTO tpl FROM operation_templates
  WHERE company_id = NEW.company_id AND product_type = NEW.product_type
  LIMIT 1;

  IF tpl.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Generate steps from template
  FOR step IN SELECT * FROM jsonb_array_elements(tpl.steps)
  LOOP
    INSERT INTO production_steps (
      production_order_id, company_id, name, department,
      description, tip, sort_order, status
    ) VALUES (
      NEW.id, NEW.company_id,
      step->>'name',
      COALESCE(step->>'department', 'general'),
      step->>'description',
      step->>'tip',
      COALESCE((step->>'sort_order')::integer, i),
      'pending'
    );
    i := i + 1;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_generate_steps
  AFTER INSERT ON production_orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_production_steps();

-- 2. Trigger: Recalculate work order progress when production_steps change
CREATE OR REPLACE FUNCTION public.recalc_order_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id uuid;
  v_total integer;
  v_completed integer;
  v_new_progress integer;
  v_project_id uuid;
BEGIN
  v_order_id := COALESCE(NEW.production_order_id, OLD.production_order_id);

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total, v_completed
  FROM production_steps
  WHERE production_order_id = v_order_id;

  IF v_total > 0 THEN
    v_new_progress := ROUND((v_completed::numeric / v_total::numeric) * 100);
  ELSE
    v_new_progress := 0;
  END IF;

  UPDATE production_orders
  SET progress = v_new_progress,
      status = CASE
        WHEN v_new_progress = 100 THEN 'Completada'
        WHEN v_new_progress > 0 THEN 'En Progreso'
        ELSE status
      END
  WHERE id = v_order_id
  RETURNING project_id INTO v_project_id;

  -- Cascade to project if linked
  IF v_project_id IS NOT NULL THEN
    PERFORM recalc_project_progress(v_project_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recalc_order_progress
  AFTER INSERT OR UPDATE OF status OR DELETE ON production_steps
  FOR EACH ROW
  EXECUTE FUNCTION recalc_order_progress();

-- 3. Function: Recalculate project progress from its work orders
CREATE OR REPLACE FUNCTION public.recalc_project_progress(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_avg integer;
  v_total integer;
  v_completed integer;
BEGIN
  SELECT COUNT(*), COALESCE(AVG(progress), 0)::integer,
         COUNT(*) FILTER (WHERE status = 'Completada')
  INTO v_total, v_avg, v_completed
  FROM production_orders
  WHERE project_id = p_project_id;

  UPDATE projects
  SET status = CASE
    WHEN v_total > 0 AND v_completed = v_total THEN 'Completed'
    WHEN v_avg > 0 THEN 'Production'
    ELSE status
  END,
  updated_at = now()
  WHERE id = p_project_id;
END;
$$;

-- 4. Trigger: Prevent hard-delete of clients with active projects
CREATE OR REPLACE FUNCTION public.guard_client_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM projects
    WHERE client_id = OLD.id
    AND status NOT IN ('Completed', 'Cancelled')
  ) THEN
    RAISE EXCEPTION 'No se puede eliminar el cliente: tiene proyectos activos. Archive los proyectos primero.';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_guard_client_delete
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION guard_client_delete();

-- 5. Trigger: Prevent hard-delete of projects with active work orders
CREATE OR REPLACE FUNCTION public.guard_project_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM production_orders
    WHERE project_id = OLD.id
    AND status NOT IN ('Completada', 'Cancelada')
  ) THEN
    RAISE EXCEPTION 'No se puede eliminar el proyecto: tiene órdenes de trabajo activas. Complete o cancele las órdenes primero.';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_guard_project_delete
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION guard_project_delete();
