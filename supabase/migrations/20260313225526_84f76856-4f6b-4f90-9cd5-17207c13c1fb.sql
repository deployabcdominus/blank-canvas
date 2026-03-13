-- Create installation-photos bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'installation-photos',
  'installation-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Company members can upload photos (folder = company_id)
CREATE POLICY "Company members can upload installation photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'installation-photos'
  AND (storage.foldername(name))[1] = public.get_my_company_id()::text
);

-- Company members can view photos
CREATE POLICY "Company members can view installation photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'installation-photos'
  AND (storage.foldername(name))[1] = public.get_my_company_id()::text
);

-- Only admins can delete photos
CREATE POLICY "Only admins can delete installation photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'installation-photos'
  AND (storage.foldername(name))[1] = public.get_my_company_id()::text
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Add photos column to installations
ALTER TABLE installations ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';