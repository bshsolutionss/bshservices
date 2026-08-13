"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ClientEditControlProps {
  clientId: string;
  initial: {
    company_name: string;
    contact_name: string | null;
    contact_email: string;
    contact_phone: string | null;
    industry: string | null;
    account_manager: string | null;
    notes: string | null;
  };
}

export default function ClientEditControl({ clientId, initial }: ClientEditControlProps) {
  const router = useRouter();
  const [fields, setFields] = useState({
    company_name: initial.company_name,
    contact_name: initial.contact_name ?? "",
    contact_email: initial.contact_email,
    contact_phone: initial.contact_phone ?? "",
    industry: initial.industry ?? "",
    account_manager: initial.account_manager ?? "",
    notes: initial.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6 space-y-3">
      <h2 className="font-bold text-[#231F20] mb-1">Client Profile</h2>
      <Input placeholder="Company name" value={fields.company_name} onChange={set("company_name")} />
      <Input placeholder="Contact name" value={fields.contact_name} onChange={set("contact_name")} />
      <Input type="email" placeholder="Contact email" value={fields.contact_email} onChange={set("contact_email")} />
      <Input placeholder="Contact phone" value={fields.contact_phone} onChange={set("contact_phone")} />
      <Input placeholder="Industry" value={fields.industry} onChange={set("industry")} />
      <Input placeholder="Account manager" value={fields.account_manager} onChange={set("account_manager")} />
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
