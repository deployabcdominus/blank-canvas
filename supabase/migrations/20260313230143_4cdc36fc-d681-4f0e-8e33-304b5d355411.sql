ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'media';