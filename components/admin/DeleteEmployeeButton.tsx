"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ui";

export default function DeleteEmployeeButton({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete team member"
      display="block"
      icon={<Trash2 className="h-4 w-4" />}
      title={`Delete "${employeeName}"?`}
      confirmLabel="Delete team member"
      message="Their profile is removed and tasks assigned to them become unassigned (the name stays on the task for reference). This cannot be undone. If they have just left, set their status to Inactive instead."
      onConfirm={async () => {
        const res = await fetch(`/api/admin/employees/${employeeId}`, { method: "DELETE" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Could not delete the team member.");
        router.push("/admin/employees");
        router.refresh();
      }}
    />
  );
}
