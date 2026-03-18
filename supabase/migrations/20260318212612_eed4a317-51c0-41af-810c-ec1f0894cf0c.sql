
-- Add qc_signature_url column to production_orders
ALTER TABLE public.production_orders
  ADD COLUMN IF NOT EXISTS qc_signature_url text DEFAULT NULL;

-- Create signatures storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for signatures bucket: company members can upload
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Anyone can view signatures"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'signatures');

CREATE POLICY "Authenticated users can update signatures"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'signatures');
