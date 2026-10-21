import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Role } from "@/lib/permissions";

export interface RoleRow {
  id: string;
  created_at: string;
  email: string;
  role: Role;
  employee_id: string | null;
  active: boolean;
}

export interface RoleInfo {
  role: Role;
  employeeId: string | null;
  /** True while no roles are configured yet - everyone signed in is treated as admin, as before roles existed. */
  implicit: boolean;
}

const TTL_MS = 30_000;
let cache: { at: number; rows: RoleRow[] | null } | null = null;

async function loadRows(): Promise<RoleRow[] | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  let rows: RoleRow[] | null = null;
  try {
    const { data, error } = await createServiceRoleClient().from("admin_roles").select("*");
    rows = error ? null : ((data ?? []) as RoleRow[]);
  } catch {
    rows = null;
  }
  cache = { at: Date.now(), rows };
  return rows;
}

export function invalidateRoleCache() {
  cache = null;
}

export async function listRoleRows(): Promise<RoleRow[]> {
  invalidateRoleCache();
  return (await loadRows()) ?? [];
}

/**
 * The role for a signed-in email, or null when roles are configured and this
 * person isn't in them (or has been switched off). With no roles configured
 * (or before migration 0014) everyone is an admin, which is how the panel
 * behaved before roles existed.
 */
export async function lookupRole(email: string | null | undefined): Promise<RoleInfo | null> {
  const rows = await loadRows();
  if (!rows || rows.length === 0) return { role: "admin", employeeId: null, implicit: true };
  const match = rows.find((r) => r.email.toLowerCase() === (email ?? "").toLowerCase() && r.active);
  return match ? { role: match.role, employeeId: match.employee_id, implicit: false } : null;
}
