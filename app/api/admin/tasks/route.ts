import { after, NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { TASK_PRIORITIES, type TaskPriority } from "@/lib/tasks";
import { notifyTaskAssigned } from "@/lib/admin/task-notify";

interface CreatePayload {
  project_id: string;
  title: string;
  description?: string;
  /** Preferred: an employee id. Assigning this way also emails them. */
  assignee_id?: string | null;
  /** Legacy free-text assignee (no email). */
  assignee_name?: string;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  if (auth.user.role === "employee") {
    return NextResponse.json({ ok: false, error: "Only managers and admins can create tasks. Ask your manager to assign one to you." }, { status: 403 });
  }

  let payload: CreatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.project_id || !payload.title?.trim()) {
    return NextResponse.json({ ok: false, error: "Project and title are required." }, { status: 400 });
  }

  if (payload.priority && !TASK_PRIORITIES.includes(payload.priority)) {
    return NextResponse.json({ ok: false, error: "Invalid priority." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  let assigneeName = payload.assignee_name?.trim() || null;
  let assigneeEmail: string | null = null;
  if (payload.assignee_id) {
    const { data: employee } = await service
      .from("employees")
      .select("name, email")
      .eq("id", payload.assignee_id)
      .single<{ name: string; email: string | null }>();
    if (!employee) {
      return NextResponse.json({ ok: false, error: "That team member no longer exists." }, { status: 400 });
    }
    assigneeName = employee.name;
    assigneeEmail = employee.email;
  }

  const { data, error } = await service
    .from("tasks")
    .insert({
      project_id: payload.project_id,
      title: payload.title.trim().slice(0, 200),
      description: payload.description?.trim().slice(0, 5000) || null,
      assignee_id: payload.assignee_id || null,
      assignee_name: assigneeName,
      priority: payload.priority || "medium",
      due_date: payload.due_date || null,
      estimated_hours: payload.estimated_hours ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/tasks] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not create task." }, { status: 500 });
  }

  // The email goes out after the response is sent, so adding a task never waits on SMTP.
  const notify = payload.assignee_id ? (assigneeEmail ? "queued" : "no_email") : "none";
  if (notify === "queued") after(() => notifyTaskAssigned(data.id));

  return NextResponse.json({ ok: true, id: data.id, notify, assignee: assigneeName });
}
