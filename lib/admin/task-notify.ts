import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/send";
import { resolveEmailConfig } from "@/lib/email/settings";
import { taskAssignedEmail } from "@/lib/email/templates";
import { logActivity } from "@/lib/activity";
import { TASK_PRIORITY_LABELS, type Task } from "@/lib/tasks";
import { formatDate } from "@/lib/invoices";

/**
 * Emails a team member about a task assigned to them. Reads everything it
 * needs by task id so callers (create / reassign) stay one line, and is
 * designed to run inside `after()` - the HTTP response never waits on SMTP.
 * Failures land in email_log (visible under Settings > Email), never in the
 * user's way.
 */
export async function notifyTaskAssigned(taskId: string, options: { reassigned?: boolean } = {}): Promise<void> {
  try {
    const config = await resolveEmailConfig();
    const wantsEmail = options.reassigned ? config.settings.notify_task_updated : config.settings.notify_task_assigned;
    if (!wantsEmail) return;

    const supabase = createServiceRoleClient();
    const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single<Task>();
    if (!task?.assignee_id) return;

    const [{ data: employee }, { data: project }] = await Promise.all([
      supabase
        .from("employees")
        .select("name, email")
        .eq("id", task.assignee_id)
        .single<{ name: string; email: string | null }>(),
      supabase
        .from("projects")
        .select("name, client_id")
        .eq("id", task.project_id)
        .single<{ name: string; client_id: string }>(),
    ]);
    if (!employee?.email) return;

    const { data: client } = project
      ? await supabase
          .from("clients")
          .select("company_name")
          .eq("id", project.client_id)
          .single<{ company_name: string }>()
      : { data: null };

    const template = taskAssignedEmail({
      assigneeName: employee.name,
      taskTitle: task.title,
      description: task.description,
      projectName: project?.name ?? null,
      clientName: client?.company_name ?? null,
      priorityLabel: TASK_PRIORITY_LABELS[task.priority],
      dueDate: task.due_date ? formatDate(task.due_date) : null,
      estimatedHours: task.estimated_hours,
      reassigned: options.reassigned,
    });

    const result = await sendEmail({
      to: employee.email,
      ...template,
      kind: "task_assigned",
      entityType: "task",
      entityId: task.id,
    });

    if (result.ok) {
      await supabase.from("tasks").update({ assigned_notified_at: new Date().toISOString() }).eq("id", task.id);
    }
    await logActivity({
      entityType: "project",
      entityId: task.project_id,
      type: "note",
      description: result.ok
        ? `Task "${task.title}" assigned to ${employee.name} - email sent to ${employee.email}`
        : `Task "${task.title}" assigned to ${employee.name} - email failed: ${result.error}`,
    });
  } catch (err) {
    console.error("[task-notify] failed:", err);
  }
}
