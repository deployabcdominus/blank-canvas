
-- Add mockup_url column to proposals
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS mockup_url text DEFAULT NULL;

-- Create proposal-mockups storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal-mockups', 'proposal-mockups', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload mockups
CREATE POLICY "Authenticated can upload mockups"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'proposal-mockups');

-- RLS: public can view mockups
CREATE POLICY "Public can view mockups"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'proposal-mockups');

-- RLS: authenticated can delete their mockups
CREATE POLICY "Authenticated can delete mockups"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'proposal-mockups');

-- RLS: authenticated can update mockups
CREATE POLICY "Authenticated can update mockups"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'proposal-mockups');
