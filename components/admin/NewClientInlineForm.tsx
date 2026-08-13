"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewClientInlineForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          contact_email: contactEmail,
          contact_name: contactName || undefined,
          contact_phone: contactPhone || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to create client.");

      setCompanyName("");
      setContactEmail("");
      setContactName("");
      setContactPhone("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
        + New Client
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[#1A14A5]/10 p-5 grid sm:grid-cols-2 gap-3"
    >
      <Input
        placeholder="Company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        required
      />
      <Input
        type="email"
        placeholder="Contact email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        required
      />
      <Input placeholder="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
      <Input placeholder="Contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Saving..." : "Create Client"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
          Cancel
        </Button>
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </form>
  );
}
