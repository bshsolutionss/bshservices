"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, type TaskPriority } from "@/lib/tasks";

interface NewTaskInlineFormProps {
  projectId: string;
  /** Active employee names, for the assignee field's autocomplete — free text still works if empty/no match. */
  employeeNames?: string[];
}

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
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title,
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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 bg-[#F4F7FE] rounded-xl p-3 mb-4">
      <Input
        placeholder="New task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="flex-1 min-w-[160px]"
      />
      <Input
        placeholder="Assignee"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        list="task-assignee-suggestions"
        className="w-32"
      />
      {employeeNames.length > 0 && (
        <datalist id="task-assignee-suggestions">
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
      <Button type="submit" disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
        {saving ? "Adding..." : "Add Task"}
      </Button>
      {error && <span className="text-sm text-red-600">❌ {error}</span>}
    </form>
  );
}
