import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import {
  PROJECT_BILLING_TYPES,
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
  type Project,
  type ProjectBillingType,
  type ProjectStage,
  type ProjectServiceCategory,
} from "@/lib/projects";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

interface UpdatePayload {
  name?: string;
  stage?: ProjectStage;
  budget?: number | null;
  currency?: Currency;
  start_date?: string | null;
  due_date?: string | null;
  service_category?: ProjectServiceCategory | null;
  description?: string | null;
  archived?: boolean;
  billing_type?: ProjectBillingType;
  monthly_fee?: number | null;
  billing_day?: number;
  auto_invoice?: boolean;
  recurring_active?: boolean;
  domain_name?: string | null;
  domain_expires_on?: string | null;
  hosting_provider?: string | null;
  hosting_expires_on?: string | null;
  /** Replaces the whole assigned team. */
  member_ids?: string[];
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

  const { data: existing } = await service.from("projects").select("*").eq("id", id).single<Project>();
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (payload.name !== undefined) {
    updates.name = String(payload.name).slice(0, 200);
  }
  if (payload.stage !== undefined) {
    if (!PROJECT_STAGES.includes(payload.stage)) {
      return NextResponse.json({ ok: false, error: "Invalid stage." }, { status: 400 });
    }
    updates.stage = payload.stage;
  }
  if (payload.budget !== undefined) {
    updates.budget = payload.budget === null ? null : Number(payload.budget);
  }
  if (payload.currency !== undefined) {
    if (!(CURRENCIES as string[]).includes(payload.currency)) {
      return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
    }
    updates.currency = payload.currency;
  }
  if (payload.start_date !== undefined) updates.start_date = payload.start_date || null;
  if (payload.due_date !== undefined) updates.due_date = payload.due_date || null;
  if (payload.service_category !== undefined) {
    if (payload.service_category !== null && String(payload.service_category).length > 80) {
      return NextResponse.json({ ok: false, error: "Invalid service category." }, { status: 400 });
    }
    updates.service_category = payload.service_category;
  }
  if (payload.description !== undefined) {
    updates.description = payload.description === null ? null : String(payload.description).slice(0, 5000);
  }
  if (payload.archived !== undefined) {
    updates.archived = Boolean(payload.archived);
  }
  if (payload.billing_type !== undefined) {
    if (!PROJECT_BILLING_TYPES.includes(payload.billing_type)) {
      return NextResponse.json({ ok: false, error: "Invalid billing type." }, { status: 400 });
    }
    updates.billing_type = payload.billing_type;
  }
  if (payload.monthly_fee !== undefined) {
    const fee = payload.monthly_fee === null ? null : Number(payload.monthly_fee);
    if (fee !== null && (!Number.isFinite(fee) || fee < 0)) {
      return NextResponse.json({ ok: false, error: "Monthly fee can't be negative." }, { status: 400 });
    }
    updates.monthly_fee = fee;
  }
  if (payload.billing_day !== undefined) {
    const day = Number(payload.billing_day);
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      return NextResponse.json({ ok: false, error: "Billing day must be between 1 and 28." }, { status: 400 });
    }
    updates.billing_day = day;
  }
  if (payload.domain_name !== undefined) updates.domain_name = cleanText(payload.domain_name, 200);
  if (payload.domain_expires_on !== undefined) updates.domain_expires_on = payload.domain_expires_on || null;
  if (payload.hosting_provider !== undefined) updates.hosting_provider = cleanText(payload.hosting_provider, 120);
  if (payload.hosting_expires_on !== undefined) updates.hosting_expires_on = payload.hosting_expires_on || null;
  if (payload.auto_invoice !== undefined) updates.auto_invoice = Boolean(payload.auto_invoice);
  if (payload.recurring_active !== undefined) updates.recurring_active = Boolean(payload.recurring_active);

  const effectiveType = (updates.billing_type as ProjectBillingType | undefined) ?? existing.billing_type;
  const effectiveFee = "monthly_fee" in updates ? (updates.monthly_fee as number | null) : existing.monthly_fee;
  if (effectiveType === "monthly" && (!effectiveFee || effectiveFee <= 0)) {
    return NextResponse.json({ ok: false, error: "A monthly project needs a monthly fee." }, { status: 400 });
  }

  const teamChange = Array.isArray(payload.member_ids);
  if (Object.keys(updates).length === 0 && !teamChange) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await service.from("projects").update(updates).eq("id", id);
    if (error) {
      console.error("[api/admin/projects] update failed:", error);
      return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
    }
  }

  if (teamChange) {
    const ids = [...new Set((payload.member_ids as string[]).filter(isUuid))].slice(0, 50);
    await service.from("project_members").delete().eq("project_id", id);
    if (ids.length) {
      const { error: memberError } = await service.from("project_members").insert(ids.map((employee_id) => ({ project_id: id, employee_id })));
      if (memberError) return NextResponse.json({ ok: false, error: "Could not save the team." }, { status: 500 });
    }
  }

  if (payload.stage && payload.stage !== existing.stage) {
    await logActivity({
      entityType: "project",
      entityId: id,
      type: "stage_change",
      description: `Stage changed from ${PROJECT_STAGE_LABELS[existing.stage]} to ${PROJECT_STAGE_LABELS[payload.stage]}`,
    });
  }

  if (payload.archived !== undefined && payload.archived !== existing.archived) {
    await logActivity({
      entityType: "project",
      entityId: id,
      type: "note",
      description: payload.archived ? "Project archived" : "Project unarchived",
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();

  // Safe unconditionally: tasks.project_id cascades (its tasks go with it)
  // and invoices.project_id is ON DELETE SET NULL (invoices survive, just
  // lose the project link) — the client-side confirm dialog warns about
  // the task cascade before this is ever called.
  const { error } = await service.from("projects").delete().eq("id", id);

  if (error) {
    console.error("[api/admin/projects] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete project." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
