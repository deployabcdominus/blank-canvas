-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the daily heartbeat
-- We use the service_role key for internal system tasks
-- Since we are in a migration, we can't easily get the vault secrets here
-- but we can use the net.http_post to call our function.
-- Replacing the URL with the project's specific function URL.

SELECT cron.schedule(
  'daily-keep-alive',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT value FROM net._http_settings WHERE name = 'url') || '/functions/v1/keep-alive',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Note: If vault is not available or the query above fails due to permissions, 
-- the user might need to manually set the service_role_key in the cron job 
-- via the Supabase Dashboard SQL Editor for security reasons.
