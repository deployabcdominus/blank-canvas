
-- Add logo_url column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage bucket for lead logos
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-logos', 'lead-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to lead-logos bucket
CREATE POLICY "Users can upload lead logos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'lead-logos');

-- Allow public read access
CREATE POLICY "Public read access for lead logos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'lead-logos');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own lead logos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'lead-logos');
