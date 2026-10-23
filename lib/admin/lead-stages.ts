import { createServiceRoleClient } from "@/lib/supabase/service";
import { applyLeadStages, DEFAULT_LEAD_STAGES, type LeadStage } from "@/lib/lead-stages";

const TTL_MS = 30_000;
let cache: { at: number; stages: LeadStage[] } | null = null;

async function fetchStages(): Promise<LeadStage[]> {
  try {
    const { data, error } = await createServiceRoleClient().from("lead_stages").select("key, label, color, position, kind").order("position");
    if (error || !data || data.length === 0) return DEFAULT_LEAD_STAGES;
    return data as LeadStage[];
  } catch {
    return DEFAULT_LEAD_STAGES;
  }
}

/** Stages in order (cached 30s) and applied to the shared lead lists. Never throws - falls back to the old fixed pipeline. */
export async function ensureLeadStages(): Promise<LeadStage[]> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    applyLeadStages(cache.stages);
    return cache.stages;
  }
  const stages = await fetchStages();
  applyLeadStages(stages);
  cache = { at: Date.now(), stages };
  return stages;
}

/** Fresh read for validation in API routes (never the cache - a stage may have just been added). */
export async function loadLeadStages(): Promise<LeadStage[]> {
  cache = null;
  return ensureLeadStages();
}

export function invalidateLeadStages() {
  cache = null;
}
