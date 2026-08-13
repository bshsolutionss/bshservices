import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { TASK_PRIORITIES, type TaskPriority } from "@/lib/tasks";

interface CreatePayload {
  project_id: string;
  title: string;
  assignee_name?: string;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

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
  const { data, error } = await service
    .from("tasks")
    .insert({
      project_id: payload.project_id,
      title: payload.title.trim(),
      assignee_name: payload.assignee_name?.trim() || null,
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

  return NextResponse.json({ ok: true, id: data.id });
}
