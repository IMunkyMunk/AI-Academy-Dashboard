-- Migration: Predefined admin/mentor infrastructure
-- Date: 2026-02-04
-- Description: Create config table and trigger for predefined admins.
--              Admin emails are added via scripts/set-predefined-admin.mjs with env vars
--              (never hardcoded in migrations for security).

-- Config table for predefined admin/mentor emails (populated by setup script)
CREATE TABLE IF NOT EXISTS predefined_admin_emails (
  email TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger checks config table instead of hardcoded values
CREATE OR REPLACE FUNCTION auto_set_admin_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM predefined_admin_emails WHERE email = NEW.email) THEN
    NEW.is_admin := true;
    NEW.is_mentor := true;
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_set_admin ON participants;
CREATE TRIGGER trigger_auto_set_admin
  BEFORE INSERT OR UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_admin_on_insert();
