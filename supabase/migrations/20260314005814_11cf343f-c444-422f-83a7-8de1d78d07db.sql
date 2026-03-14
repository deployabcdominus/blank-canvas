
-- ─── LEADS ───────────────────────────────────────────────
-- user_id, assigned_to_user_id, created_by_user_id exist
ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_user_id_fkey,
  DROP CONSTRAINT IF EXISTS leads_assigned_to_user_id_fkey,
  DROP CONSTRAINT IF EXISTS leads_created_by_user_id_fkey;

ALTER TABLE leads
  ADD CONSTRAINT leads_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT leads_assigned_to_user_id_fkey
    FOREIGN KEY (assigned_to_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT leads_created_by_user_id_fkey
    FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── PRODUCTION ORDERS ───────────────────────────────────
-- user_id, assigned_to_user_id, owner_user_id exist
ALTER TABLE production_orders
  DROP CONSTRAINT IF EXISTS production_orders_user_id_fkey,
  DROP CONSTRAINT IF EXISTS production_orders_assigned_to_user_id_fkey,
  DROP CONSTRAINT IF EXISTS production_orders_owner_user_id_fkey;

ALTER TABLE production_orders
  ADD CONSTRAINT production_orders_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT production_orders_assigned_to_user_id_fkey
    FOREIGN KEY (assigned_to_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT production_orders_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── PROPOSALS ───────────────────────────────────────────
-- user_id, owner_user_id exist
ALTER TABLE proposals
  DROP CONSTRAINT IF EXISTS proposals_user_id_fkey,
  DROP CONSTRAINT IF EXISTS proposals_owner_user_id_fkey;

ALTER TABLE proposals
  ADD CONSTRAINT proposals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT proposals_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── PROJECTS ────────────────────────────────────────────
-- owner_user_id, assigned_to_user_id exist
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_owner_user_id_fkey,
  DROP CONSTRAINT IF EXISTS projects_assigned_to_user_id_fkey;

ALTER TABLE projects
  ADD CONSTRAINT projects_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT projects_assigned_to_user_id_fkey
    FOREIGN KEY (assigned_to_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── PAYMENTS ────────────────────────────────────────────
-- created_by exists
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_created_by_fkey;

ALTER TABLE payments
  ADD CONSTRAINT payments_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── INSTALLATIONS ───────────────────────────────────────
-- user_id exists
ALTER TABLE installations
  DROP CONSTRAINT IF EXISTS installations_user_id_fkey;

ALTER TABLE installations
  ADD CONSTRAINT installations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── INVITATIONS ─────────────────────────────────────────
-- created_by_user_id exists
ALTER TABLE invitations
  DROP CONSTRAINT IF EXISTS invitations_created_by_user_id_fkey;

ALTER TABLE invitations
  ADD CONSTRAINT invitations_created_by_user_id_fkey
    FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── INSTALLER COMPANIES ────────────────────────────────
-- user_id exists
ALTER TABLE installer_companies
  DROP CONSTRAINT IF EXISTS installer_companies_user_id_fkey;

ALTER TABLE installer_companies
  ADD CONSTRAINT installer_companies_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── TEAM MEMBERS ────────────────────────────────────────
-- user_id exists
ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;

ALTER TABLE team_members
  ADD CONSTRAINT team_members_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── TEAM ROLES ──────────────────────────────────────────
-- user_id exists
ALTER TABLE team_roles
  DROP CONSTRAINT IF EXISTS team_roles_user_id_fkey;

ALTER TABLE team_roles
  ADD CONSTRAINT team_roles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── TEAM ALLOCATIONS ───────────────────────────────────
-- user_id exists
ALTER TABLE team_allocations
  DROP CONSTRAINT IF EXISTS team_allocations_user_id_fkey;

ALTER TABLE team_allocations
  ADD CONSTRAINT team_allocations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── USER ROLES ──────────────────────────────────────────
-- user_id exists — SET NULL so role record is preserved but unlinked
ALTER TABLE user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── USER SETTINGS ───────────────────────────────────────
-- user_id exists
ALTER TABLE user_settings
  DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

ALTER TABLE user_settings
  ADD CONSTRAINT user_settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── PROFILES ────────────────────────────────────────────
-- id references auth.users(id)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE SET NULL;
