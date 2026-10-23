"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, btnPrimary, inputBase } from "@/components/admin/ui";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, type AssigneeOption, type TaskPriority } from "@/lib/tasks";

interface NewTaskInlineFormProps {
  /** Fixed project - used on a project's own page. */
  projectId?: string;
  /** Fixed internal board - used on a board's own view. */
  boardId?: string;
  /** Selectable internal boards, offered next to the projects. */
  boards?: { id: string; name: string }[];
  /** Selectable projects - used on the global Tasks page (no fixed project). */
  projects?: { id: string; name: string }[];
  /** Active team members. Picking one emails them the assignment. */
  assignees?: AssigneeOption[];
}

/**
 * Quick-add row for tasks. Deliberately inline rather than a modal: adding
 * several tasks in a row is the normal case. Assigning to a team member sends
 * them an email (if they have one on file) - the confirmation under the form
 * says so, or warns when there's no address to send to.
 */
export default function NewTaskInlineForm({ projectId, boardId, boards, projects, assignees = [] }: NewTaskInlineFormProps) {
  const router = useRouter();
  // "p:<id>" is a client project, "b:<id>" an internal board.
  const [selectedProject, setSelectedProject] = useState(projectId ? `p:${projectId}` : boardId ? `b:${boardId}` : "");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [hours, setHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "warning"; text: string } | null>(null);

  const assignee = assignees.find((a) => a.id === assigneeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      setError("Choose a project or board for this task.");
      return;
    }
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject.startsWith("p:") ? selectedProject.slice(2) : undefined,
          board_id: selectedProject.startsWith("b:") ? selectedProject.slice(2) : undefined,
          title: title.trim(),
          description: details.trim() || undefined,
          assignee_id: assigneeId || undefined,
          priority,
          due_date: dueDate || undefined,
          estimated_hours: hours ? Number(hours) : undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to add task.");

      if (body.notify === "queued") {
        setNotice({ tone: "success", text: `Task added - ${body.assignee} is being emailed the details.` });
      } else if (body.notify === "no_email") {
        setNotice({
          tone: "warning",
          text: `Task added, but ${body.assignee} has no email address, so no email was sent. Add one on their Team profile.`,
        });
      }

      setTitle("");
      setDetails("");
      setAssigneeId("");
      setDueDate("");
      setHours("");
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
        {!projectId && !boardId && (projects || boards) && (
          <select
            aria-label="Project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className={cn(inputBase, "w-48")}
          >
            <option value="">Project or board…</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={`p:${p.id}`}>
                {p.name}
              </option>
            ))}
            {(boards ?? []).map((b) => (
              <option key={b.id} value={`b:${b.id}`}>
                Board: {b.name}
              </option>
            ))}
          </select>
        )}
        <input
          aria-label="Task title"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(inputBase, "min-w-[180px] flex-1")}
        />
        <select
          aria-label="Assign to"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className={cn(inputBase, "w-44")}
        >
          <option value="">Unassigned</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.email ? "" : " (no email)"}
            </option>
          ))}
        </select>
        <select
          aria-label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className={cn(inputBase, "w-28")}
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
        <input
          aria-label="Estimated hours"
          type="number"
          min="0"
          step="0.5"
          placeholder="Hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className={cn(inputBase, "w-24")}
        />
        <button type="submit" disabled={saving} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          {saving ? "Adding…" : "Add task"}
        </button>
      </div>
      <input
        aria-label="Task details"
        placeholder="Details / instructions for the assignee (optional - included in the email)"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        className={inputBase}
      />
      {assignee && (
        <p className="flex items-center gap-1.5 text-xs text-[#231F20]/55">
          <Mail className="h-3.5 w-3.5" />
          {assignee.email
            ? `${assignee.name} will be emailed at ${assignee.email}.`
            : `${assignee.name} has no email on file - they won't be notified.`}
        </p>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
    </form>
  );
}
