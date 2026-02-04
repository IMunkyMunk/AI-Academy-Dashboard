#!/usr/bin/env node
/**
 * Add a predefined admin/mentor to the database.
 * Uses PREdefined_ADMIN_EMAIL and PREdefined_ADMIN_NAME from env - never in code.
 *
 * Usage:
 *   PREdefined_ADMIN_EMAIL=admin@example.com PREdefined_ADMIN_NAME="Admin" node scripts/set-predefined-admin.mjs
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.
 */
import { createClient } from '@supabase/supabase-js';

const email = process.env.PREdefined_ADMIN_EMAIL;
const name = process.env.PREdefined_ADMIN_NAME;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!email?.trim()) {
  console.error('Error: PREdefined_ADMIN_EMAIL is required');
  process.exit(1);
}
if (!supabaseUrl || !serviceKey) {
  console.error('Error: Load .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

try {
  const { error } = await supabase.rpc('add_predefined_admin', {
    p_email: email.trim(),
    p_name: name?.trim() || null,
  });
  if (error) throw error;
  console.log(`Predefined admin added: ${email}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
