-- Create system_heartbeats table
CREATE TABLE IF NOT EXISTS public.system_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    message TEXT,
    source TEXT DEFAULT 'cron',
    metadata JSONB DEFAULT '{}'
);

-- Index for cleanup optimization
CREATE INDEX IF NOT EXISTS idx_heartbeats_created_at ON public.system_heartbeats(created_at);

-- Enable RLS
ALTER TABLE public.system_heartbeats ENABLE ROW LEVEL SECURITY;

-- Policy for admins (using the app_role check if it exists, otherwise defaulting to authenticated)
-- Note: Checking if 'admin' role exists or just using authenticated for internal system health
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        EXECUTE 'CREATE POLICY "Admins can manage heartbeats" ON public.system_heartbeats FOR ALL USING (has_role(auth.uid(), ''admin''::app_role))';
    ELSE
        EXECUTE 'CREATE POLICY "Authenticated users can view heartbeats" ON public.system_heartbeats FOR SELECT USING (auth.role() = ''authenticated'')';
    END IF;
END $$;
