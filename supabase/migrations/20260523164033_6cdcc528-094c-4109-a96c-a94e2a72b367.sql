-- Create production order status history for audit trail
CREATE TABLE public.production_order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE public.production_order_status_history ENABLE ROW LEVEL SECURITY;

-- Policies for history
CREATE POLICY "Users can view their company's production history"
  ON public.production_order_status_history FOR SELECT
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert production history"
  ON public.production_order_status_history FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Add detailed production fields to production_orders
ALTER TABLE public.production_orders 
  ADD COLUMN IF NOT EXISTS internal_status TEXT DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS prepared_by_department TEXT DEFAULT 'Sales',
  ADD COLUMN IF NOT EXISTS design_review_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS design_review_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS design_reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS design_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS final_width NUMERIC,
  ADD COLUMN IF NOT EXISTS final_height NUMERIC,
  ADD COLUMN IF NOT EXISTS measurement_unit TEXT DEFAULT 'in',
  ADD COLUMN IF NOT EXISTS single_or_double_sided TEXT DEFAULT 'Single',
  ADD COLUMN IF NOT EXISTS indoor_or_outdoor TEXT DEFAULT 'Outdoor',
  ADD COLUMN IF NOT EXISTS illuminated_or_non TEXT DEFAULT 'Illuminated',
  ADD COLUMN IF NOT EXISTS substrate_material TEXT,
  ADD COLUMN IF NOT EXISTS frame_material TEXT,
  ADD COLUMN IF NOT EXISTS mounting_method TEXT,
  ADD COLUMN IF NOT EXISTS installation_surface TEXT,
  ADD COLUMN IF NOT EXISTS electrical_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS permit_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fabrication_notes TEXT,
  ADD COLUMN IF NOT EXISTS production_warnings TEXT,
  -- Vinyl Specs
  ADD COLUMN IF NOT EXISTS vinyl_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vinyl_brand TEXT,
  ADD COLUMN IF NOT EXISTS vinyl_color TEXT,
  ADD COLUMN IF NOT EXISTS vinyl_finish TEXT,
  ADD COLUMN IF NOT EXISTS vinyl_notes TEXT,
  -- Print Specs
  ADD COLUMN IF NOT EXISTS print_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS print_material TEXT,
  ADD COLUMN IF NOT EXISTS print_quality TEXT,
  ADD COLUMN IF NOT EXISTS laminate_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS laminate_type TEXT,
  ADD COLUMN IF NOT EXISTS print_notes TEXT,
  -- Fabrication Flags
  ADD COLUMN IF NOT EXISTS cutting_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cnc_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS welding_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS painting_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS painting_color TEXT,
  -- Tracking
  ADD COLUMN IF NOT EXISTS target_completion_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS actual_completion_date TIMESTAMP WITH TIME ZONE;

-- Add trigger to automatically track status changes in history
CREATE OR REPLACE FUNCTION public.track_production_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR (TG_OP = 'INSERT') THEN
    INSERT INTO public.production_order_status_history (
      company_id,
      production_order_id,
      previous_status,
      new_status,
      changed_by_user_id
    ) VALUES (
      NEW.company_id,
      NEW.id,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_production_status_change
  AFTER INSERT OR UPDATE ON public.production_orders
  FOR EACH ROW EXECUTE FUNCTION public.track_production_status_change();
