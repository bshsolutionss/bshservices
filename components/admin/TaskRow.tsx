"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/tasks";
import TaskStatusInlineControl from "@/components/admin/TaskStatusInlineControl";

interface TaskRowProps {
  task: Task;
  /** Active employee names, for the assignee field's autocomplete when editing. */
  employeeNames?: string[];
  /** Shown + linked when this row appears on the cross-project /admin/tasks list. */
  projectName?: string;
}

/** Shared task row — display + inline edit toggle + delete. Used on both /admin/tasks and a project's detail page. */
export default function TaskRow({ task, employeeNames = [], projectName }: TaskRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee_name ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          assignee_name: assignee.trim() || null,
          priority,
          due_date: dueDate || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to save task.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task permanently? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      router.refresh();
    } catch {
      setError("Failed to delete task.");
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <li className="py-3 space-y-2 bg-[#F4F7FE] -mx-3 px-3 rounded-lg my-1">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
        <div className="flex flex-wrap gap-2">
          <Input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assignee"
            list={`task-row-assignee-${task.id}`}
            className="w-36"
          />
          {employeeNames.length > 0 && (
            <datalist id={`task-row-assignee-${task.id}`}>
              {employeeNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          )}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="text-sm rounded-lg border border-[#1A14A5]/20 px-2.5 py-2 bg-white"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl text-sm h-8 px-3"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(false)}
            className="rounded-xl text-sm h-8 px-3"
          >
            Cancel
          </Button>
          {error && <span className="text-sm text-red-600">❌ {error}</span>}
        </div>
      </li>
    );
  }

  return (
    <li className="py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-[#231F20] truncate">{task.title}</p>
        <p className="text-xs text-[#231F20]/50">
          {projectName && (
            <>
              <Link href={`/admin/projects/${task.project_id}`} className="hover:text-[#1A14A5] hover:underline">
                {projectName}
              </Link>{" "}
              &middot;{" "}
            </>
          )}
          {task.assignee_name || "Unassigned"} &middot; {TASK_PRIORITY_LABELS[task.priority as TaskPriority]}
          {task.due_date ? ` · Due ${new Date(task.due_date).toLocaleDateString()}` : ""}
        </p>
        {error && <p className="text-xs text-red-600 mt-0.5">❌ {error}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <TaskStatusInlineControl taskId={task.id} initialStatus={task.status as TaskStatus} />
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-[#1A14A5] hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </li>
  );
}
