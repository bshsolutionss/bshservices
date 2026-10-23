/**
 * One way for an outside system (a shared form link, Google Ads, IndiaMART, a
 * webhook) to put a lead on the board. Callers parse their own payload into
 * `InboundLead`; this validates, drops duplicates, places the lead in the right
 * stage, logs it and notifies the team.
 */
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { sendAdminPush } from "@/lib/push";
import { loadLeadStages } from "@/lib/admin/lead-stages";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 86_400_000;

export interface InboundLead {
  name: string;
  email?: string | null;
  phone?: string | null;
  business?: string | null;
  location?: string | null;
  message?: string | null;
  /** Everything else the sender provided, kept on the lead so nothing is lost. */
  extra?: Record<string, string>;
  source: "form" | "webhook";
  /** Shown on the lead as where it came from, e.g. the form or source name. */
  sourceDetail: string;
  formId?: string | null;
  sourceId?: string | null;
  /** Stage to land in; null = first stage. */
  stageKey?: string | null;
}

export type InboundResult = { ok: true; id: string; duplicate: boolean } | { ok: false; error: string };

const clip = (v: unknown, max: number): string | null => {
  if (v == null) return null;
  const s = String(v).trim().slice(0, max);
  return s || null;
};

/** Keeps digits and a leading plus, so "0325-905 9887" and "03259059887" compare equal. */
const digits = (phone: string) => phone.replace(/[^\d+]/g, "");

export async function createInboundLead(input: InboundLead): Promise<InboundResult> {
  const name = clip(input.name, 200);
  const email = clip(input.email, 320)?.toLowerCase() ?? null;
  const phone = clip(input.phone, 60);
  if (!name) return { ok: false, error: "A name is required." };
  if (!email && !phone) return { ok: false, error: "A phone number or email is required." };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: "That email address doesn't look right." };

  const service = createServiceRoleClient();

  // The same person submitting twice (or an ad platform retrying a webhook) must not create two leads.
  const since = new Date(Date.now() - 7 * DAY_MS).toISOString();
  const matches: string[] = [];
  // Commas/parentheses are PostgREST filter syntax - strip them so a crafted value can't widen the match.
  if (email) matches.push(`email.eq.${email.replace(/[(),]/g, "")}`);
  if (phone) matches.push(`phone.eq.${phone.replace(/[(),]/g, "")}`);
  const { data: existing } = await service.from("leads").select("id, phone").or(matches.join(",")).gte("created_at", since).limit(5);
  const dupe = (existing ?? []).find((l) => (email ? true : l.phone && phone && digits(l.phone) === digits(phone)));
  if (dupe) return { ok: true, id: dupe.id, duplicate: true };

  const stages = await loadLeadStages();
  const stage = (input.stageKey && stages.find((s) => s.key === input.stageKey && s.kind === "open")) || stages.find((s) => s.kind === "open") || stages[0];

  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.extra ?? {}).slice(0, 30)) {
    const value = clip(v, 1000);
    if (value) extra[k.slice(0, 80)] = value;
  }

  const { data, error } = await service
    .from("leads")
    .insert({
      name,
      email,
      phone,
      business: clip(input.business, 200),
      location: clip(input.location, 200),
      message: clip(input.message, 5000),
      extra,
      source: input.source,
      lead_source_detail: clip(input.sourceDetail, 100),
      form_id: input.formId ?? null,
      source_id: input.sourceId ?? null,
      status: stage.key,
      priority: "medium",
      expected_value_currency: "PKR",
      // Same Day-1 nurture timer website leads get - only meaningful with an email.
      next_follow_up_at: email ? new Date(Date.now() + DAY_MS).toISOString() : null,
      follow_up_stage: 0,
      follow_up_completed: !email,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[lead-intake] insert failed:", error);
    return { ok: false, error: "Could not save the lead." };
  }

  await logActivity({ entityType: "lead", entityId: data.id, type: "lead_created", description: `Arrived from ${input.sourceDetail}` });
  await sendAdminPush({ title: `New lead: ${name}`, body: `From ${input.sourceDetail}${phone ? ` - ${phone}` : ""}`, url: `/admin/leads/${data.id}` }).catch(() => {});
  return { ok: true, id: data.id, duplicate: false };
}
