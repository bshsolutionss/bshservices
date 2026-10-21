"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Undo2 } from "lucide-react";
import { Badge } from "@/components/admin/ui";
import { TASK_PRIORITY_LABELS, type TaskPriority } from "@/lib/tasks";
import { formatDate } from "@/lib/invoices";

export interface ReviewItem {
  id: string;
  title: string;
  projectName: string;
  project_id: string;
  assignee_name: string | null;
  priority: TaskPriority;
  due_date: string | null;
}

/** Work waiting for sign-off: approve it, or send it back with one click. */
export default function ReviewQueue({
  items,
  canApprove,
  linkProjects = true,
}: {
  items: ReviewItem[];
  canApprove: boolean;
  linkProjects?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const move = async (id: string, status: "completed" | "in_progress") => {
    setBusy(id + status);
    try {
      await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <ul className="divide-y divide-[#1A14A5]/5">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#231F20]">{item.title}</p>
            <p className="text-xs text-[#231F20]/55">
              {linkProjects ? (
                <Link href={`/admin/projects/${item.project_id}`} className="hover:text-[#1A14A5] hover:underline">
                  {item.projectName}
                </Link>
              ) : (
                item.projectName
              )}
              {" · "}Owner: {item.assignee_name ?? "Unassigned"}
              {item.due_date ? ` · Due ${formatDate(item.due_date)}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge label={`${TASK_PRIORITY_LABELS[item.priority]} priority`} colors={{ bg: "#F4F7FE", text: "#231F20" }} />
            {canApprove ? (
              <>
                <button
                  type="button"
                  onClick={() => move(item.id, "in_progress")}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#1A14A5]/15 px-3 py-1.5 text-xs font-semibold text-[#231F20] hover:bg-[#F4F7FE] disabled:opacity-50"
                >
                  <Undo2 className="h-3.5 w-3.5" /> Send back
                </button>
                <button
                  type="button"
                  onClick={() => move(item.id, "completed")}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> {busy === item.id + "completed" ? "Approving…" : "Approve"}
                </button>
              </>
            ) : (
              <span className="text-xs text-[#231F20]/50" title="Only managers and admins can approve work.">
                Waiting for a manager
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
