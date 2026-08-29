"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PROJECT_SERVICE_CATEGORIES, type ProjectServiceCategory } from "@/lib/projects";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface NewProjectInlineFormProps {
  /** Fixed client (used on a client's own detail page) — hides the client picker. */
  clientId?: string;
  /** Full client list (used on the projects list page) — shown as a picker when `clientId` isn't set. */
  clients?: { id: string; company_name: string }[];
  /** "outline" matches the client-detail-page usage; "solid" matches the Clients page's "+ New Client" style. */
  triggerVariant?: "solid" | "outline";
}

/** Manual project creation (won-lead conversion covers the automated path). */
export default function NewProjectInlineForm({ clientId, clients, triggerVariant = "outline" }: NewProjectInlineFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? "");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [serviceCategory, setServiceCategory] = useState<ProjectServiceCategory | "">("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          client_id: clientId ?? selectedClientId,
          budget: budget === "" ? undefined : Number(budget),
          currency,
          service_category: serviceCategory || undefined,
          description: description || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to create project.");

      setName("");
      setSelectedClientId(clientId ?? "");
      setBudget("");
      setCurrency("PKR");
      setServiceCategory("");
      setDescription("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant={triggerVariant === "solid" ? "default" : "outline"}
        className={cn(
          "rounded-xl",
          triggerVariant === "solid"
            ? "bg-[#1A14A5] hover:bg-[#0e0a7a] text-white"
            : "border-[#1A14A5]/20 text-[#1A14A5]"
        )}
      >
        + New Project
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#F4F7FE] rounded-xl p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 min-w-[160px]"
        />
        {!clientId && (
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            required
            className="text-sm rounded-lg border border-[#1A14A5]/20 px-2.5 py-2 bg-white"
          >
            <option value="">Select a client…</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        )}
        <select
          value={serviceCategory}
          onChange={(e) => setServiceCategory(e.target.value as ProjectServiceCategory)}
          className="text-sm rounded-lg border border-[#1A14A5]/20 px-2.5 py-2 bg-white"
        >
          <option value="">Select Service…</option>
          {PROJECT_SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-28"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="text-sm rounded-lg border border-[#1A14A5]/20 px-2.5 py-2 bg-white"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Saving..." : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
          Cancel
        </Button>
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </form>
  );
}
