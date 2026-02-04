-- ============================================================================
-- Migration: Refactor predefined admin - use config table instead of hardcoded email
-- Date: 2026-02-04
-- Description: Store admin emails in predefined_admin_emails table for security.
--              No credentials or emails in migration files.
-- ============================================================================

-- Create config table for predefined admin/mentor emails (no hardcoded data)
CREATE TABLE IF NOT EXISTS predefined_admin_emails (
  email TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill from existing admins (from previous migration or manual setup)
INSERT INTO predefined_admin_emails (email, name)
SELECT email, name FROM participants WHERE is_admin = true
ON CONFLICT (email) DO NOTHING;

-- Replace trigger to check config table instead of hardcoded email
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

-- SECURITY DEFINER function for script to add predefined admins (parameterized, no SQL injection)
CREATE OR REPLACE FUNCTION add_predefined_admin(p_email TEXT, p_name TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO predefined_admin_emails (email, name)
  VALUES (p_email, COALESCE(p_name, split_part(p_email, '@', 1)))
  ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, predefined_admin_emails.name);

  INSERT INTO participants (email, name, is_admin, is_mentor, status)
  VALUES (p_email, COALESCE(p_name, split_part(p_email, '@', 1)), true, true, 'approved')
  ON CONFLICT (email) DO UPDATE SET
    is_admin = true,
    is_mentor = true,
    status = 'approved',
    name = COALESCE(EXCLUDED.name, participants.name);

  INSERT INTO admin_users (email, name)
  VALUES (p_email, COALESCE(p_name, split_part(p_email, '@', 1)))
  ON CONFLICT (email) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION add_predefined_admin IS 'Adds email to predefined admins. Call from setup script with env vars - never commit credentials.';
