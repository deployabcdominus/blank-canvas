
-- Create poi-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('poi-photos', 'poi-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for poi-photos bucket
CREATE POLICY "Anyone can upload poi photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'poi-photos');

CREATE POLICY "Anyone can view poi photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'poi-photos');

CREATE POLICY "Admin can delete poi photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'poi-photos' AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin', 'operations')
));

-- Allow anon to insert poi_photos rows (installers aren't authenticated)
CREATE POLICY "anon_insert_poi_photos"
ON public.poi_photos FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon to update production_orders for POI completion (only specific columns via app logic)
CREATE POLICY "anon_update_poi_completion"
ON public.production_orders FOR UPDATE
TO anon
USING (poi_token IS NOT NULL)
WITH CHECK (poi_token IS NOT NULL);

-- Allow anon to select poi_photos
CREATE POLICY "anon_select_poi_photos"
ON public.poi_photos FOR SELECT
TO anon
USING (true);
