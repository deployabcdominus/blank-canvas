
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS contact_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS website text DEFAULT '',
  ADD COLUMN IF NOT EXISTS service_type text DEFAULT '';
