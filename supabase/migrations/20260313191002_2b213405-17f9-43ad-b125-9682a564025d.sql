
CREATE TABLE public.catalog_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  catalog_type TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, catalog_type, value)
);

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view catalogs"
ON public.catalog_items FOR SELECT TO authenticated
USING (company_id = get_my_company_id());

CREATE POLICY "Only admins can insert catalogs"
ON public.catalog_items FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_my_company_id()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'))
);

CREATE POLICY "Only admins can update catalogs"
ON public.catalog_items FOR UPDATE TO authenticated
USING (
  company_id = get_my_company_id()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'))
);

CREATE POLICY "Only admins can delete catalogs"
ON public.catalog_items FOR DELETE TO authenticated
USING (
  company_id = get_my_company_id()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'))
);

CREATE INDEX idx_catalog_items_company_type 
ON public.catalog_items(company_id, catalog_type) 
WHERE is_active = true;
