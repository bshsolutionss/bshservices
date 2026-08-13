"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/invoices";

interface NewInvoiceInlineFormProps {
  clients: { id: string; company_name: string }[];
  projects: { id: string; name: string; client_id: string }[];
  /** Pre-fill + lock the client/project pickers — used when opened from a project's own page. */
  defaultClientId?: string;
  defaultProjectId?: string;
  defaultAmount?: number;
  lockSelection?: boolean;
  /** "+ New Invoice" by default; project pages want "+ Create Invoice". */
  triggerLabel?: string;
}

export default function NewInvoiceInlineForm({
  clients,
  projects,
  defaultClientId,
  defaultProjectId,
  defaultAmount,
  lockSelection = false,
  triggerLabel = "+ New Invoice",
}: NewInvoiceInlineFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [amount, setAmount] = useState(defaultAmount !== undefined ? String(defaultAmount) : "");
  const [tax, setTax] = useState("");
  const [discount, setDiscount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableProjects = projects.filter((p) => !clientId || p.client_id === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          project_id: projectId || undefined,
          amount: Number(amount),
          tax: tax === "" ? undefined : Number(tax),
          discount: discount === "" ? undefined : Number(discount),
          currency,
          due_date: dueDate || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to create invoice.");

      router.push(`/admin/invoices/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice.");
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
        {triggerLabel}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1A14A5]/10 p-5 grid sm:grid-cols-2 gap-3">
      <select
        value={clientId}
        onChange={(e) => {
          setClientId(e.target.value);
          setProjectId("");
        }}
        required
        disabled={lockSelection}
        className="rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:text-[#231F20]/60"
      >
        <option value="">Select a client…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.company_name}
          </option>
        ))}
      </select>
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        disabled={lockSelection}
        className="rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:text-[#231F20]/60"
      >
        <option value="">No linked project</option>
        {availableProjects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        required
        className="rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {CURRENCY_LABELS[c]}
          </option>
        ))}
      </select>
      <Input type="number" min="0" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <Input type="number" min="0" step="0.01" placeholder="Tax" value={tax} onChange={(e) => setTax(e.target.value)} />
      <Input type="number" min="0" step="0.01" placeholder="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
      <Input type="date" placeholder="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Creating..." : "Create Invoice"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
          Cancel
        </Button>
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </form>
  );
}
