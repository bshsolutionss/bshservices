import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { TASK_STATUSES, TASK_PRIORITIES, type TaskStatus, type TaskPriority } from "@/lib/tasks";

interface UpdatePayload {
  title?: string;
  description?: string;
  assignee_name?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  status?: TaskStatus;
  estimated_hours?: number | null;
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

  const updates: Record<string, unknown> = {};

  if (payload.status !== undefined) {
    if (!TASK_STATUSES.includes(payload.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    updates.status = payload.status;
  }
  if (payload.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(payload.priority)) {
      return NextResponse.json({ ok: false, error: "Invalid priority." }, { status: 400 });
    }
    updates.priority = payload.priority;
  }
  if (payload.title !== undefined) updates.title = String(payload.title).slice(0, 200);
  if (payload.description !== undefined) updates.description = String(payload.description).slice(0, 5000) || null;
  if (payload.assignee_name !== undefined) updates.assignee_name = String(payload.assignee_name).slice(0, 200) || null;
  if (payload.due_date !== undefined) updates.due_date = payload.due_date || null;
  if (payload.estimated_hours !== undefined) {
    updates.estimated_hours = payload.estimated_hours === null ? null : Number(payload.estimated_hours);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("tasks").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/tasks] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
