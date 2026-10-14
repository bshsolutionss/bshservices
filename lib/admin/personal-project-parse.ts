import { PERSONAL_PROJECT_STATUSES, type PersonalProjectStatus } from "@/lib/personal-projects";
import { CURRENCIES, type Currency } from "@/lib/invoices";

export interface PersonalProjectPayload {
  name?: string;
  description?: string | null;
  status?: PersonalProjectStatus;
  url?: string | null;
  currency?: Currency;
  start_date?: string | null;
  target_date?: string | null;
  notes?: string | null;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Shared by create and update. `partial` = update (every field optional). */
export function parsePersonalProject(
  payload: PersonalProjectPayload,
  partial: boolean
): { error: string } | { values: Record<string, unknown> } {
  const values: Record<string, unknown> = {};
  if (payload.name !== undefined || !partial) {
    const name = payload.name?.trim().slice(0, 150);
    if (!name) return { error: "A name is required." };
    values.name = name;
  }
  if (payload.description !== undefined) values.description = payload.description?.trim().slice(0, 5000) || null;
  if (payload.status !== undefined) {
    if (!PERSONAL_PROJECT_STATUSES.includes(payload.status)) return { error: "Invalid status." };
    values.status = payload.status;
  }
  if (payload.url !== undefined) values.url = payload.url?.trim().slice(0, 300) || null;
  if (payload.currency !== undefined) {
    if (!(CURRENCIES as string[]).includes(payload.currency)) return { error: "Invalid currency." };
    values.currency = payload.currency;
  }
  for (const field of ["start_date", "target_date"] as const) {
    if (payload[field] !== undefined) {
      if (payload[field] && !DATE.test(payload[field]!)) return { error: "Invalid date." };
      values[field] = payload[field] || null;
    }
  }
  if (payload.notes !== undefined) values.notes = payload.notes?.trim().slice(0, 5000) || null;
  return { values };
}
