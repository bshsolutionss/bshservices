"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import {
  Alert,
  ChoiceField,
  Modal,
  MoneyField,
  SelectField,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import {
  EMPLOYEE_STATUSES,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  PAY_BASES,
  PAY_BASIS_LABELS,
  type Employee,
  type EmployeeStatus,
  type EmploymentType,
  type PayBasis,
} from "@/lib/employees";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface EmployeeFormModalProps {
  /** Omit to add a team member; pass one to edit. */
  employee?: Employee;
  /** Pre-selects the type for "Add freelancer" style buttons. */
  defaultType?: EmploymentType;
  label?: string;
  variant?: "solid" | "outline";
}

/**
 * Add or edit a team member in one form - staff on a salary ("job") or a
 * freelancer paid by the hour/project. The email matters: it's where task
 * assignment emails go.
 */
export default function EmployeeFormModal({
  employee,
  defaultType = "job",
  label,
  variant = "solid",
}: EmployeeFormModalProps) {
  const router = useRouter();
  const editing = !!employee;

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EmploymentType>(employee?.employment_type ?? defaultType);
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "");
  const [hireDate, setHireDate] = useState(employee?.hire_date ?? "");
  const [status, setStatus] = useState<EmployeeStatus>(employee?.status ?? "active");
  const [payBasis, setPayBasis] = useState<PayBasis>(employee?.pay_basis ?? (defaultType === "freelance" ? "hourly" : "monthly"));
  const [payAmount, setPayAmount] = useState(employee?.pay_amount != null ? String(employee.pay_amount) : "");
  const [payCurrency, setPayCurrency] = useState<Currency>(employee?.pay_currency ?? "PKR");
  const [notes, setNotes] = useState(employee?.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setNameError(null);
    setError(null);
    if (!editing) {
      setType(defaultType);
      setName("");
      setRole("");
      setEmail("");
      setPhone("");
      setDepartment("");
      setHireDate("");
      setPayAmount("");
      setNotes("");
    }
  };

  const changeType = (next: EmploymentType) => {
    setType(next);
    // Sensible default for the new type, without clobbering a deliberate choice.
    if (next === "freelance" && payBasis === "monthly") setPayBasis("hourly");
    if (next === "job" && payBasis !== "monthly") setPayBasis("monthly");
  };

  const save = async () => {
    if (!name.trim()) {
      setNameError("A name is required.");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("That email address doesn't look right.");
      return;
    }
    setNameError(null);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/admin/employees/${employee!.id}` : "/api/admin/employees", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          department: department.trim() || null,
          hire_date: hireDate || null,
          notes: notes.trim() || null,
          employment_type: type,
          pay_basis: payBasis,
          pay_amount: payAmount === "" ? null : Number(payAmount),
          pay_currency: payCurrency,
          ...(editing ? { status } : {}),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");

      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const noun = type === "freelance" ? "freelancer" : "team member";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={variant === "solid" ? btnPrimary : btnSecondary}>
        {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (editing ? "Edit profile" : "Add team member")}
      </button>

      <Modal
        open={open}
        onClose={close}
        title={editing ? `Edit ${employee!.name}` : "Add team member"}
        description="Their email is where task assignments are sent."
        size="lg"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : `Add ${noun}`}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ChoiceField
              label="Works as"
              value={type}
              onChange={(v) => changeType(v as EmploymentType)}
              options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: EMPLOYMENT_TYPE_LABELS[t] }))}
            />
          </div>
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
          <TextField id="employee-role" label="Role / skill" value={role} onChange={setRole} placeholder="e.g. UI designer" />
          <TextField id="employee-department" label="Department" value={department} onChange={setDepartment} />
          <TextField
            id="employee-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            hint="Task assignment emails go here."
          />
          <TextField id="employee-phone" label="Phone / WhatsApp" type="tel" value={phone} onChange={setPhone} />

          <SelectField
            id="employee-pay-basis"
            label="Paid"
            value={payBasis}
            onChange={(v) => setPayBasis(v as PayBasis)}
            options={PAY_BASES.map((b) => ({ value: b, label: PAY_BASIS_LABELS[b] }))}
          />
          <MoneyField
            id="employee-pay"
            label={type === "freelance" ? "Rate" : "Salary"}
            amount={payAmount}
            onAmountChange={setPayAmount}
            currency={payCurrency}
            onCurrencyChange={(v) => setPayCurrency(v as Currency)}
            currencies={CURRENCIES}
          />

          <TextField
            id="employee-hire-date"
            label={type === "freelance" ? "Working with us since" : "Hire date"}
            type="date"
            value={hireDate}
            onChange={setHireDate}
          />
          {editing && (
            <SelectField
              id="employee-status"
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as EmployeeStatus)}
              options={EMPLOYEE_STATUSES.map((s) => ({ value: s, label: EMPLOYEE_STATUS_LABELS[s] }))}
            />
          )}
          <TextareaField
            id="employee-notes"
            label="Notes"
            className="sm:col-span-2"
            value={notes}
            onChange={setNotes}
            rows={2}
            placeholder="Portfolio link, availability, payment details…"
          />
        </div>

        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}
