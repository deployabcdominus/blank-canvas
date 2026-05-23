ALTER TABLE public.production_orders
ADD COLUMN IF NOT EXISTS closing_checklist JSONB DEFAULT '{"site_cleaned": false, "final_photos_reviewed": false, "permit_closed": false, "tools_returned": false}'::jsonb;
