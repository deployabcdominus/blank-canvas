
-- Add blueprint and annotations columns to production_orders
ALTER TABLE public.production_orders
  ADD COLUMN IF NOT EXISTS blueprint_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS annotations jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for work order blueprints
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-order-blueprints', 'work-order-blueprints', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users in the same company can upload
CREATE POLICY "Authenticated can upload blueprints"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'work-order-blueprints');

-- RLS: public read access
CREATE POLICY "Public can view blueprints"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'work-order-blueprints');

-- RLS: authenticated can update/delete own uploads
CREATE POLICY "Authenticated can manage blueprints"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'work-order-blueprints');

CREATE POLICY "Authenticated can update blueprints"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'work-order-blueprints');
