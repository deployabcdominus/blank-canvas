
-- Add material specification columns and QC/staff tracking to production_orders
ALTER TABLE production_orders
  ADD COLUMN IF NOT EXISTS face_material_spec text DEFAULT '',
  ADD COLUMN IF NOT EXISTS returns_material_spec text DEFAULT '',
  ADD COLUMN IF NOT EXISTS backs_material_spec text DEFAULT '',
  ADD COLUMN IF NOT EXISTS trim_cap_spec text DEFAULT '',
  ADD COLUMN IF NOT EXISTS led_mfg_spec text DEFAULT '',
  ADD COLUMN IF NOT EXISTS power_supply_spec text DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsible_staff jsonb DEFAULT '{"pm":{"user_id":null,"name":"","is_verified":false,"status":"pending"},"cnc":{"user_id":null,"name":"","is_verified":false,"status":"pending"},"fabrication":{"user_id":null,"name":"","is_verified":false,"status":"pending"},"wiring":{"user_id":null,"name":"","is_verified":false,"status":"pending"},"qc":{"user_id":null,"name":"","is_verified":false,"status":"pending"}}'::jsonb,
  ADD COLUMN IF NOT EXISTS qc_checklist jsonb DEFAULT '{"design_verified":false,"material_specs_confirmed":false,"wiring_test_passed":false,"final_sign_cleaned":false,"qc_signature":"","qc_date":null}'::jsonb,
  ADD COLUMN IF NOT EXISTS wo_number text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contact_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS site_address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_name text DEFAULT '';

-- Generate WO numbers for existing orders that don't have one
UPDATE production_orders
SET wo_number = 'WO-' || UPPER(LEFT(id::text, 8))
WHERE wo_number IS NULL;
