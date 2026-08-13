"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from "@/lib/tasks";

interface TaskStatusInlineControlProps {
  taskId: string;
  initialStatus: TaskStatus;
}

/** Tiny per-row status select — tasks are high-churn, so no full detail page/Save button, just PATCH on change. */
export default function TaskStatusInlineControl({ taskId, initialStatus }: TaskStatusInlineControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    const previous = status;
    setStatus(newStatus);
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      setStatus(previous);
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className="text-xs font-semibold rounded-full border border-[#1A14A5]/20 px-2.5 py-1 bg-white disabled:opacity-50"
    >
      {TASK_STATUSES.map((s) => (
        <option key={s} value={s}>
          {TASK_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
