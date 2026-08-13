import { createServiceRoleClient } from "@/lib/supabase/service";

export type ActivityEntityType = "lead" | "client" | "project" | "invoice";

export type ActivityType =
  | "status_change"
  | "note"
  | "converted"
  | "client_created"
  | "client_linked"
  | "project_created"
  | "stage_change"
  | "invoice_created"
  | "payment_received"
  | "lost"
  | "booking_cancelled";

export interface Activity {
  id: string;
  created_at: string;
  entity_type: ActivityEntityType;
  entity_id: string;
  type: ActivityType;
  description: string;
}

/**
 * Best-effort activity log write — never throws into the caller (same
 * reliability principle as lib/email/resend.ts's sendLeadEmails). A missed
 * timeline entry is a minor UX gap; a failed request is not acceptable.
 */
export async function logActivity(input: {
  entityType: ActivityEntityType;
  entityId: string;
  type: ActivityType;
  description: string;
}): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("activities").insert({
      entity_type: input.entityType,
      entity_id: input.entityId,
      type: input.type,
      description: input.description,
    });
  } catch (err) {
    console.error("[activity] failed to log:", err);
  }
}
