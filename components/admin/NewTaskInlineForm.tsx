"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, btnPrimary, inputBase } from "@/components/admin/ui";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, type TaskPriority } from "@/lib/tasks";

interface NewTaskInlineFormProps {
  projectId: string;
  /** Active employee names, for the assignee field's autocomplete — free text still works if empty/no match. */
  employeeNames?: string[];
}

/**
 * Quick-add row for a project's tasks. Deliberately inline rather than a
 * modal: adding several tasks in a row is the normal case, and a dialog that
 * has to be reopened each time gets in the way.
 */
export default function NewTaskInlineForm({ projectId, employeeNames = [] }: NewTaskInlineFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: title.trim(),
          assignee_name: assignee || undefined,
          priority,
          due_date: dueDate || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to add task.");

      setTitle("");
      setAssignee("");
      setDueDate("");
      setPriority("medium");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2 rounded-xl bg-[#F4F7FE] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Task title"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(inputBase, "min-w-[180px] flex-1")}
        />
        <input
          aria-label="Assignee"
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          list="task-assignee-suggestions"
          className={cn(inputBase, "w-36")}
        />
        {employeeNames.length > 0 && (
          <datalist id="task-assignee-suggestions">
            {employeeNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        )}
        <select
          aria-label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className={cn(inputBase, "w-32")}
        >
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {TASK_PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <input
          aria-label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={cn(inputBase, "w-40")}
        />
        <button type="submit" disabled={saving} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          {saving ? "Adding…" : "Add task"}
        </button>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
    </form>
  );
}
