import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_PRIORITIES,
  LEAD_LOST_REASONS,
  type Lead,
  type LeadStatus,
  type LeadPriority,
  type LeadLostReason,
} from "@/lib/leads";

interface UpdatePayload {
  status?: LeadStatus;
  notes?: string;
  expected_value?: number | null;
  priority?: LeadPriority;
  lost_reason?: LeadLostReason;
  /** Only meaningful for source === "consultation_booking" — cancelling frees the slot back up. */
  booking_status?: "cancelled";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;

  let payload: UpdatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { data: existingLead } = await service
    .from("leads")
    .select("*")
    .eq("id", id)
    .single<Lead>();

  if (!existingLead) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  let statusChanged = false;

  if (payload.status !== undefined) {
    if (!LEAD_STATUSES.includes(payload.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }

    // "Lost requires a reason" (PRD 6.2 acceptance criteria).
    if (payload.status === "lost" && !payload.lost_reason && !existingLead.lost_reason) {
      return NextResponse.json(
        { ok: false, error: "A lost reason is required when marking a lead as lost." },
        { status: 400 }
      );
    }

    if (payload.status !== existingLead.status) {
      statusChanged = true;
      updates.status = payload.status;
      updates.status_updated_at = new Date().toISOString();
      // Anything past "contacted" stops the automated follow-up loop — the
      // cron route's query already excludes completed leads, so this is all
      // that's needed, no separate "cancel" branch.
      if (payload.status !== "new" && payload.status !== "contacted") {
        updates.follow_up_completed = true;
      }
    }
  }

  if (payload.notes !== undefined) {
    updates.notes = String(payload.notes).slice(0, 5000);
  }

  if (payload.expected_value !== undefined) {
    updates.expected_value = payload.expected_value === null ? null : Number(payload.expected_value);
  }

  if (payload.priority !== undefined) {
    if (!LEAD_PRIORITIES.includes(payload.priority)) {
      return NextResponse.json({ ok: false, error: "Invalid priority." }, { status: 400 });
    }
    updates.priority = payload.priority;
  }

  if (payload.lost_reason !== undefined) {
    if (!LEAD_LOST_REASONS.includes(payload.lost_reason)) {
      return NextResponse.json({ ok: false, error: "Invalid lost reason." }, { status: 400 });
    }
    updates.lost_reason = payload.lost_reason;
  }

  let bookingCancelled = false;
  if (payload.booking_status !== undefined) {
    if (payload.booking_status !== "cancelled") {
      return NextResponse.json({ ok: false, error: "Invalid booking status." }, { status: 400 });
    }
    if (existingLead.source !== "consultation_booking") {
      return NextResponse.json({ ok: false, error: "This lead has no booking to cancel." }, { status: 400 });
    }
    if (existingLead.booking_status !== "cancelled") {
      bookingCancelled = true;
      // The partial unique index on (booking_date, booking_time) only
      // covers status='confirmed' rows, so this frees the slot back up
      // for other visitors automatically.
      updates.booking_status = "cancelled";
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await service.from("leads").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/leads] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  if (bookingCancelled) {
    await logActivity({
      entityType: "lead",
      entityId: id,
      type: "booking_cancelled",
      description: `Consultation booking cancelled (was ${existingLead.booking_date} at ${existingLead.booking_time})`,
    });
  }

  if (statusChanged) {
    await logActivity({
      entityType: "lead",
      entityId: id,
      type: "status_change",
      description: `Status changed from ${LEAD_STATUS_LABELS[existingLead.status]} to ${LEAD_STATUS_LABELS[payload.status as LeadStatus]}`,
    });

    if (payload.status === "lost") {
      await logActivity({
        entityType: "lead",
        entityId: id,
        type: "lost",
        description: `Marked lost — reason: ${payload.lost_reason ?? existingLead.lost_reason}`,
      });
    }

    // "The backbone": marking a lead Won automatically creates the
    // downstream Client + Project. The Postgres function handles dedupe/
    // idempotency, so this is safe even if the lead is re-saved as "won".
    if (payload.status === "won") {
      const { data: conversion, error: conversionError } = await service
        .rpc("convert_lead_to_client_and_project", { p_lead_id: id })
        .single<{
          out_client_id: string;
          out_project_id: string;
          client_created: boolean;
          project_created: boolean;
        }>();

      if (conversionError) {
        console.error("[api/admin/leads] won-conversion failed:", conversionError);
      } else if (conversion) {
        await logActivity({
          entityType: "lead",
          entityId: id,
          type: "converted",
          description: "Converted to client and project",
        });
        if (conversion.client_created) {
          await logActivity({
            entityType: "client",
            entityId: conversion.out_client_id,
            type: "client_created",
            description: `Created from won lead: ${existingLead.name}`,
          });
        } else {
          await logActivity({
            entityType: "client",
            entityId: conversion.out_client_id,
            type: "client_linked",
            description: `Linked to won lead: ${existingLead.name}`,
          });
        }
        if (conversion.project_created) {
          await logActivity({
            entityType: "project",
            entityId: conversion.out_project_id,
            type: "project_created",
            description: `Created from won lead: ${existingLead.name}`,
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
