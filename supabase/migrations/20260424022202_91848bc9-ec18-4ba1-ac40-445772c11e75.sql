-- Restringir listado público en buckets
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar public read" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Company logos public read" ON storage.objects;
CREATE POLICY "Company logos public read" ON storage.objects 
FOR SELECT USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Lead logos public read" ON storage.objects;
CREATE POLICY "Lead logos public read" ON storage.objects 
FOR SELECT USING (bucket_id = 'lead-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view mockups" ON storage.objects;
CREATE POLICY "Public can view mockups" ON storage.objects 
FOR SELECT USING (bucket_id = 'proposal-mockups' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view poi photos" ON storage.objects;
CREATE POLICY "Anyone can view poi photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'poi-photos' AND auth.role() = 'authenticated');
