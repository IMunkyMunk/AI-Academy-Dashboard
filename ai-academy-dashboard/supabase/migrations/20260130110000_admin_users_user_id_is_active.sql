-- Add user_id (auth.users) and is_active to admin_users for dashboard admin checks
-- Date: 2026-01-30

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
