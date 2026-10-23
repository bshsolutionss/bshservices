"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Plus, Users } from "lucide-react";
import { Alert, Modal, SelectField, TextField, TextareaField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { formatMoney, type Currency } from "@/lib/invoices";
import { cn } from "@/lib/utils";

export interface PaymentProject {
  id: string;
  name: string;
  client: string;
  currency: Currency;
}
export interface OpenInvoice {
  id: string;
  number: string;
  project_id: string;
  balance: number;
  currency: Currency;
}

interface Props {
  projects: PaymentProject[];
  employees: { id: string; name: string }[];
  openInvoices: OpenInvoice[];
  today: string;
}

const TYPES = [
  { value: "advance", label: "Advance" },
  { value: "milestone", label: "Milestone" },
  { value: "regular", label: "Regular" },
  { value: "final", label: "Final" },
];

/** Record money in (from a client) or money out (to the team or anyone else) in one dialog. */
export default function AddPaymentModal({ projects, employees, openInvoices, today }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"received" | "paid_out">("received");
  const [payee, setPayee] = useState<"team" | "other">("team");
  const [projectId, setProjectId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [paymentType, setPaymentType] = useState("regular");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [vendor, setVendor] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const invoicesForProject = useMemo(() => openInvoices.filter((i) => i.project_id === projectId), [openInvoices, projectId]);

  const close = () => {
    setOpen(false);
    setProjectId("");
    setInvoiceId("");
    setAmount("");
    setDate(today);
    setPaymentType("regular");
    setNotes("");
    setTitle("");
    setEmployeeId("");
    setVendor("");
    setError(null);
  };

  async function save() {
    setError(null);
    if (!(Number(amount) > 0)) return setError("Enter an amount greater than zero.");
    if (tab === "received" && !projectId) return setError("Choose the project this payment is for.");
    if (tab === "paid_out" && !title.trim()) return setError("Add a title for this payout.");
    if (tab === "paid_out" && payee === "team" && !employeeId) return setError("Choose the team member who was paid.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tab === "received"
            ? { kind: "received", projectId, invoiceId: invoiceId || undefined, amount: Number(amount), date, paymentType, notes }
            : { kind: "paid_out", payee, title, projectId: projectId || undefined, employeeId: payee === "team" ? employeeId : undefined, vendor: payee === "other" ? vendor : undefined, amount: Number(amount), date }
        ),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not save the payment.");
      close();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const projectOptions = projects.map((p) => ({ value: p.id, label: `${p.name} - ${p.client}` }));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        <Plus className="h-4 w-4" /> Add payment
      </button>
      <Modal
        open={open}
        onClose={close}
        title="Add payment"
        footer={
          <>
            <button className={btnSecondary} onClick={close}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={save}>
              {busy ? "Saving..." : "Add payment"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F4F7FE] p-1">
            {(["received", "paid_out"] as const).map((t) => (
              <button key={t} type="button" onClick={() => (setTab(t), setError(null))} className={cn("rounded-lg py-2 text-sm font-semibold transition", tab === t ? "bg-white text-[#1A14A5] shadow-sm" : "text-[#231F20]/55")}>
                {t === "received" ? "Received" : "Paid out"}
              </button>
            ))}
          </div>

          {tab === "paid_out" && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">
                Paid to <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: "team", label: "Team member", icon: Users },
                  { v: "other", label: "Other payout", icon: Box },
                ] as const).map((o) => (
                  <button key={o.v} type="button" onClick={() => setPayee(o.v)} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold", payee === o.v ? "border-[#1A14A5] bg-[#E8E7FB] text-[#1A14A5]" : "border-[#1A14A5]/15 text-[#231F20]/70")}>
                    <o.icon className="h-4 w-4" /> {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "paid_out" && <TextField id="pay-title" label="Title" required value={title} onChange={setTitle} placeholder="e.g. January payment, Office supplies" />}

          <SelectField
            id="pay-project"
            label="Project"
            required={tab === "received"}
            value={projectId}
            onChange={(v) => (setProjectId(v), setInvoiceId(""))}
            options={projectOptions}
            placeholder="Select a project"
            error={projects.length === 0 && tab === "received" ? "No projects to record against yet." : undefined}
          />

          {tab === "paid_out" && payee === "team" && (
            <SelectField
              id="pay-team"
              label="Team member"
              required
              value={employeeId}
              onChange={setEmployeeId}
              options={employees.map((e) => ({ value: e.id, label: e.name }))}
              placeholder="Select a team member"
              error={employees.length === 0 ? "No active team members yet - add them under Team." : undefined}
            />
          )}
          {tab === "paid_out" && payee === "other" && <TextField id="pay-vendor" label="Paid to" value={vendor} onChange={setVendor} placeholder="Who received the money?" />}

          {tab === "received" && project && (
            <SelectField
              id="pay-invoice"
              label="Apply to"
              value={invoiceId}
              onChange={setInvoiceId}
              options={invoicesForProject.map((i) => ({ value: i.id, label: `${i.number} - ${formatMoney(i.balance, i.currency)} owed` }))}
              placeholder="New receipt (no invoice)"
              hint="Pick an open invoice to pay it off, or leave as a new receipt for money that wasn't invoiced."
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="pay-amount" label={tab === "received" ? "Amount received" : "Amount"} required type="number" min="0" step="0.01" value={amount} onChange={setAmount} placeholder="0.00" hint={tab === "received" && project ? `In ${project.currency} (the project's currency).` : undefined} />
            <TextField id="pay-date" label={tab === "received" ? "Date received" : "Date"} required type="date" value={date} onChange={setDate} />
          </div>

          {tab === "received" && (
            <>
              <SelectField id="pay-type" label="Payment type" value={paymentType} onChange={setPaymentType} options={TYPES} hideOptional />
              <TextareaField id="pay-notes" label="Notes" rows={2} value={notes} onChange={setNotes} placeholder="Optional notes..." />
              <p className="text-xs text-[#231F20]/50">This updates the project&apos;s paid total and appears in the client&apos;s portal as a receipt.</p>
            </>
          )}
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </Modal>
    </>
  );
}
