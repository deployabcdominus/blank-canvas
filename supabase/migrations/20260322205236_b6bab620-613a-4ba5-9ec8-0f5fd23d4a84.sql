DROP POLICY IF EXISTS anon_select_poi_photos ON poi_photos;

CREATE POLICY anon_select_poi_photos ON poi_photos
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM production_orders po
      WHERE po.id = poi_photos.production_order_id
        AND po.poi_token IS NOT NULL
        AND po.poi_token_exp > now()
    )
  );