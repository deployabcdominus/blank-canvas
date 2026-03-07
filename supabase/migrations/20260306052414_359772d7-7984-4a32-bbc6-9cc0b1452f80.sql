
-- Nullify any existing data first
UPDATE installer_companies SET default_password = NULL WHERE default_password IS NOT NULL;
UPDATE team_members SET default_password = NULL WHERE default_password IS NOT NULL;
UPDATE user_settings SET default_password_suffix = NULL WHERE default_password_suffix IS NOT NULL;

-- Drop the columns
ALTER TABLE installer_companies DROP COLUMN IF EXISTS default_password;
ALTER TABLE team_members DROP COLUMN IF EXISTS default_password;
ALTER TABLE user_settings DROP COLUMN IF EXISTS default_password_suffix;
