"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYEE_STATUSES, EMPLOYEE_STATUS_LABELS, type EmployeeStatus } from "@/lib/employees";

interface EmployeeEditControlProps {
  employeeId: string;
  initial: {
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    department: string | null;
    status: EmployeeStatus;
    hire_date: string | null;
    notes: string | null;
  };
}

export default function EmployeeEditControl({ employeeId, initial }: EmployeeEditControlProps) {
  const router = useRouter();
  const [fields, setFields] = useState({
    name: initial.name,
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    role: initial.role ?? "",
    department: initial.department ?? "",
    status: initial.status,
    hire_date: initial.hire_date ?? "",
    notes: initial.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof fields>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          hire_date: fields.hire_date || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save employee.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6 space-y-3">
      <h2 className="font-bold text-[#231F20] mb-1">Employee Profile</h2>
      <Input placeholder="Full name" value={fields.name} onChange={set("name")} />
      <Input placeholder="Role / Title" value={fields.role} onChange={set("role")} />
      <Input type="email" placeholder="Email" value={fields.email} onChange={set("email")} />
      <Input placeholder="Phone" value={fields.phone} onChange={set("phone")} />
      <Input placeholder="Department" value={fields.department} onChange={set("department")} />

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Status</label>
        <select
          value={fields.status}
          onChange={set("status")}
          className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
        >
          {EMPLOYEE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {EMPLOYEE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Hire Date</label>
        <Input type="date" value={fields.hire_date} onChange={set("hire_date")} />
      </div>

      <Textarea placeholder="Notes" rows={4} value={fields.notes} onChange={set("notes")} />

      <div className="flex items-center gap-3 pt-1">
        <Button onClick={handleSave} disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Saving..." : "Save"}
        </Button>
        {saved && <span className="text-sm text-green-600">✅ Saved</span>}
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </div>
  );
}
