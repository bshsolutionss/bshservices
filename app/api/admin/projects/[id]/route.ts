import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import {
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
  PROJECT_SERVICE_CATEGORIES,
  type Project,
  type ProjectStage,
  type ProjectServiceCategory,
} from "@/lib/projects";

interface UpdatePayload {
  name?: string;
  stage?: ProjectStage;
  budget?: number | null;
  start_date?: string | null;
  due_date?: string | null;
  service_category?: ProjectServiceCategory | null;
  description?: string | null;
  archived?: boolean;
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
  if (payload.start_date !== undefined) updates.start_date = payload.start_date || null;
  if (payload.due_date !== undefined) updates.due_date = payload.due_date || null;
  if (payload.service_category !== undefined) {
    if (payload.service_category !== null && !PROJECT_SERVICE_CATEGORIES.includes(payload.service_category)) {
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

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await service.from("projects").update(updates).eq("id", id);
  if (error) {
    console.error("[api/admin/projects] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
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
