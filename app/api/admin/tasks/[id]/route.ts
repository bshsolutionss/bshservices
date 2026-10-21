import { after, NextResponse, type NextRequest } from "next/server";
import { notifyTaskAssigned } from "@/lib/admin/task-notify";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { TASK_STATUSES, TASK_PRIORITIES, type TaskStatus, type TaskPriority } from "@/lib/tasks";

interface UpdatePayload {
  title?: string;
  description?: string;
  assignee_name?: string;
  /** Employee id, or null to unassign. Changing it emails the new assignee. */
  assignee_id?: string | null;
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

  // Employees can move their own tasks forward (status) and nothing else.
  if (auth.user.role === "employee") {
    const touched = Object.keys(payload).filter((k) => (payload as Record<string, unknown>)[k] !== undefined);
    if (touched.some((k) => k !== "status")) {
      return NextResponse.json({ ok: false, error: "You can update the status of your own tasks. Ask a manager to change anything else." }, { status: 403 });
    }
    const check = createServiceRoleClient();
    const { data: own } = await check.from("tasks").select("assignee_id").eq("id", id).single<{ assignee_id: string | null }>();
    if (!own || !auth.user.employeeId || own.assignee_id !== auth.user.employeeId) {
      return NextResponse.json({ ok: false, error: "This task is assigned to someone else, so only they or a manager can update it." }, { status: 403 });
    }
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

  const service = createServiceRoleClient();

  let notify: "none" | "queued" | "no_email" = "none";

  if (payload.assignee_id !== undefined) {
    const { data: current } = await service
      .from("tasks")
      .select("assignee_id")
      .eq("id", id)
      .single<{ assignee_id: string | null }>();
    if (!current) return NextResponse.json({ ok: false, error: "Task not found." }, { status: 404 });

    if (!payload.assignee_id) {
      updates.assignee_id = null;
      updates.assignee_name = null;
      updates.assigned_notified_at = null;
    } else {
      const { data: employee } = await service
        .from("employees")
        .select("name, email")
        .eq("id", payload.assignee_id)
        .single<{ name: string; email: string | null }>();
      if (!employee) {
        return NextResponse.json({ ok: false, error: "That team member no longer exists." }, { status: 400 });
      }
      updates.assignee_id = payload.assignee_id;
      updates.assignee_name = employee.name;
      if (payload.assignee_id !== current.assignee_id) {
        updates.assigned_notified_at = null;
        notify = employee.email ? "queued" : "no_email";
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await service.from("tasks").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/tasks] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  if (notify === "queued") after(() => notifyTaskAssigned(id, { reassigned: true }));

  return NextResponse.json({ ok: true, notify });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  if (auth.user.role === "employee") {
    return NextResponse.json({ ok: false, error: "Only managers and admins can delete tasks." }, { status: 403 });
  }

  const { id } = await params;
  const service = createServiceRoleClient();

  // Nothing else references tasks — safe unconditionally.
  const { error } = await service.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("[api/admin/tasks] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete task." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
