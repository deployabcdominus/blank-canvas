-- 1. Mejorar políticas de production_steps
DROP POLICY IF EXISTS "Company members can view steps" ON public.production_steps;
CREATE POLICY "Company members or superadmin can view steps" 
ON public.production_steps FOR SELECT 
USING ((company_id = get_my_company_id()) OR has_role(auth.uid(), 'superadmin'::app_role));

DROP POLICY IF EXISTS "Assigned user or admin can update steps" ON public.production_steps;
CREATE POLICY "Assigned user or admin can update steps" 
ON public.production_steps FOR UPDATE 
USING (
  (company_id = get_my_company_id() AND (assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operations'::app_role)))
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS "Only admins can delete steps" ON public.production_steps;
CREATE POLICY "Admins or superadmin can delete steps" 
ON public.production_steps FOR DELETE 
USING (
  (company_id = get_my_company_id() AND has_role(auth.uid(), 'admin'::app_role))
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- 2. Mejorar políticas de worker_stats
DROP POLICY IF EXISTS "Company members can view stats" ON public.worker_stats;
CREATE POLICY "Company members or superadmin can view stats" 
ON public.worker_stats FOR SELECT 
USING ((company_id = get_my_company_id()) OR has_role(auth.uid(), 'superadmin'::app_role));

DROP POLICY IF EXISTS "Users can update own stats" ON public.worker_stats;
CREATE POLICY "Admins or superadmin can update stats" 
ON public.worker_stats FOR UPDATE 
USING (
  (company_id = get_my_company_id() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operations'::app_role)))
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

-- 3. Mejorar políticas de poi_photos
DROP POLICY IF EXISTS "poi_photos_select_own_company" ON public.poi_photos;
CREATE POLICY "poi_photos_select_policy" 
ON public.poi_photos FOR SELECT 
USING (
  (company_id = get_my_company_id_safe()) 
  OR has_role(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS "poi_photos_delete_admin" ON public.poi_photos;
CREATE POLICY "poi_photos_delete_policy" 
ON public.poi_photos FOR DELETE 
USING (
  (company_id = get_my_company_id_safe() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operations'::app_role)))
  OR has_role(auth.uid(), 'superadmin'::app_role)
);
