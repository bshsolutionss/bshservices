import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
// Prefer the new sb_publishable_... key format first — see the comment in
// lib/supabase/service.ts: this project's legacy *_ANON_KEY JWTs are the
// same vintage as the confirmed-stale legacy service_role JWT.
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

/**
 * Refreshes the Supabase auth session cookie for the current request and
 * returns the logged-in user (if any). Called from `proxy.ts` (this
 * project's Next.js 16 middleware entry point — renamed from middleware.ts).
 *
 * Uses `getUser()`, not `getSession()`: `getUser()` revalidates the JWT
 * against the Supabase auth server on every call, which is the
 * documented-safe check to run in middleware (a cookie-decoded session
 * alone can't be trusted without this).
 *
 * Takes `requestHeaders` (rather than building its own) so proxy.ts's
 * existing region-detection header forwarding survives — every
 * `NextResponse.next()` created here (including the one rebuilt inside
 * `setAll`, which Supabase calls whenever it needs to refresh cookies)
 * carries the same headers, so the final response never silently drops one
 * or the other.
 */
export async function updateSession(
  request: NextRequest,
  requestHeaders: Headers
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
