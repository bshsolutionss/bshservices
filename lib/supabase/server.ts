import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

/**
 * Cookie-bound Supabase client for Server Components / Route Handlers that
 * need to know the *current logged-in admin's* session (e.g. the `/admin`
 * layout's auth check). Uses the public anon key — respects RLS, which is
 * default-deny on `leads` (see supabase/migrations/0001_leads.sql), so this
 * client can authenticate a user but can't read/write leads on its own.
 * For privileged data access use `lib/supabase/service.ts` instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that can't set cookies — safe to
          // ignore because `proxy.ts` already refreshes the session on every
          // request via lib/supabase/middleware.ts.
        }
      },
    },
  });
}
