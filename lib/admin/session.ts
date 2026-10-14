import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface AdminSession {
  id: string;
  email: string | null;
}

/**
 * The signed-in admin, or null. Uses `getClaims()`, which verifies the JWT
 * locally against the project's cached JWKS instead of round-tripping to the
 * Supabase auth server like `getUser()` does — that network hop used to be
 * paid on every page load, every layout render and every API call. (Projects
 * still on a symmetric JWT secret make `getClaims()` fall back to `getUser()`
 * internally, so this is never less safe than before.)
 *
 * Wrapped in React `cache` so the layout and the page share one check per request.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
});
