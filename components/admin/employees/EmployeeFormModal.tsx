"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Alert, Modal, TextField, btnGhost, btnPrimary } from "@/components/admin/ui";

/** Add a team member. Salary expenses pick employees from this list, so names matter. */
export default function EmployeeFormModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setName("");
    setRole("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setHireDate("");
    setNameError(null);
    setError(null);
  };

  const save = async () => {
    if (!name.trim()) {
      setNameError("A name is required.");
      return;
    }
    setNameError(null);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          department: department.trim() || undefined,
          hire_date: hireDate || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not add the employee.");

      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the employee.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        <Plus className="h-4 w-4" /> New employee
      </button>

      <Modal
        open={open}
        onClose={close}
        title="New employee"
        description="Added as active. Salary expenses can be tagged to them straight away."
        size="md"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              {saving ? "Adding…" : "Add employee"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="employee-name"
            label="Full name"
            required
            className="sm:col-span-2"
            value={name}
            onChange={setName}
            error={nameError}
            autoFocus
          />
          <TextField id="employee-role" label="Role / title" value={role} onChange={setRole} />
          <TextField id="employee-department" label="Department" value={department} onChange={setDepartment} />
          <TextField id="employee-email" label="Email" type="email" value={email} onChange={setEmail} />
          <TextField id="employee-phone" label="Phone" type="tel" value={phone} onChange={setPhone} />
          <TextField
            id="employee-hire-date"
            label="Hire date"
            type="date"
            className="sm:col-span-2"
            value={hireDate}
            onChange={setHireDate}
          />
        </div>

        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}
