import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureLeadStages } from "@/lib/admin/lead-stages";
import { applyStatusOverrides, isStatusListId, type StatusOverrideRow } from "@/lib/status-config";

const TTL_MS = 30_000;
let cache: { at: number; rows: StatusOverrideRow[] } | null = null;

async function fetchRows(): Promise<StatusOverrideRow[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase.from("app_options").select("list_key, value, label, color").like("list_key", "status:%");
    return ((data ?? []) as StatusOverrideRow[]).filter((r) => isStatusListId(r.list_key));
  } catch {
    return [];
  }
}

/**
 * Loads the custom status names/colours (cached for 30s per server instance) and
 * applies them to the shared label maps. Called by the admin layout and the
 * main list pages; returns the rows so the layout can hand the same values to
 * the browser. Never throws - on any problem the built-in names are used.
 */
export async function ensureStatusOverrides(): Promise<StatusOverrideRow[]> {
  // Lead stages live in their own table; applying them here means every page that already calls this follows them.
  await ensureLeadStages();
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const rows = await fetchRows();
  applyStatusOverrides(rows);
  cache = { at: Date.now(), rows };
  return rows;
}

/** Forces a reload on the next call - used right after the settings are edited. */
export async function refreshStatusOverrides(): Promise<StatusOverrideRow[]> {
  cache = null;
  return ensureStatusOverrides();
}
