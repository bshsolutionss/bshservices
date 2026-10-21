import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { lookupRole } from "@/lib/admin/roles";
import type { Role } from "@/lib/permissions";

export interface AdminSession {
  id: string;
  email: string | null;
  role: Role;
  /** The team member this login belongs to (employees see their own tasks through it). */
  employeeId: string | null;
}

/**
 * The signed-in user with their role, or null (signed out, or signed in but
 * not allowed - roles are configured and this email isn't in them). Uses
 * `getClaims()`, which verifies the JWT locally against the project's cached
 * JWKS instead of round-tripping to the Supabase auth server like `getUser()`
 * does. Wrapped in React `cache` so the layout and the page share one check
 * per request; the role table itself is cached for 30s.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const email = typeof claims.email === "string" ? claims.email : null;
  const info = await lookupRole(email);
  if (!info) return null;
  return { id: claims.sub, email, role: info.role, employeeId: info.employeeId };
});
