#!/usr/bin/env bash
# Seed admin user (admin@example.com) via Supabase Management API.
# Requires: SUPABASE_ACCESS_TOKEN, optional SUPABASE_PROJECT_REF (default: YOUR_PROJECT_REF)
# Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx ./scripts/seed-admin.sh

set -e
REF="${SUPABASE_PROJECT_REF:-YOUR_PROJECT_REF}"
TOKEN="${SUPABASE_ACCESS_TOKEN:?Set SUPABASE_ACCESS_TOKEN}"

curl -s -X POST "https://api.supabase.com/v1/projects/${REF}/database/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query": "INSERT INTO admin_users (user_id, email, name, is_active) SELECT id, '\''admin@example.com'\'', '\''Admin User'\'', true FROM auth.users WHERE email = '\''admin@example.com'\'' ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id, is_active = true, updated_at = NOW();"}' \
  | head -c 200
echo ""
