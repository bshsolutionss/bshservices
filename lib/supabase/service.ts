import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

/**
 * Privileged, server-only Supabase client using the service_role key, which
 * bypasses Row Level Security entirely. `leads` has RLS enabled with no
 * policies granted to `anon`/`authenticated`, so this is the ONLY client
 * that can read or write leads — used by /api/leads, the admin panel's data
 * pages, and the follow-up cron route.
 *
 * NEVER import this file from a "use client" component or anything that
 * could end up in the browser bundle — the service_role key grants full
 * database access with RLS bypassed.
 */
export function createServiceRoleClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable."
    );
  }

  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
