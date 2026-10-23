"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Pencil, Server } from "lucide-react";
import { Alert, Modal, SectionCard, TextField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  employees: { id: string; name: string }[];
  memberIds: string[];
  domainName: string | null;
  domainExpiresOn: string | null;
  hostingProvider: string | null;
  hostingExpiresOn: string | null;
}

const DAY = 86_400_000;

/** "in 12 days" / "expired 3 days ago" - red inside 30 days so a lapsing domain is hard to miss. */
function renewal(date: string | null): { text: string; urgent: boolean } | null {
  if (!date) return null;
  const days = Math.round((new Date(`${date}T00:00:00`).getTime() - Date.now()) / DAY);
  const when = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (days < 0) return { text: `Expired ${-days} day${days === -1 ? "" : "s"} ago (${when})`, urgent: true };
  return { text: `Renews ${when} (${days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`})`, urgent: days <= 30 };
}

/** Who is on the project and when its domain and hosting renew - editable in one dialog. */
export default function ProjectTeamCard({ projectId, employees, memberIds, domainName, domainExpiresOn, hostingProvider, hostingExpiresOn }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState(memberIds);
  const [domain, setDomain] = useState(domainName ?? "");
  const [domainExp, setDomainExp] = useState(domainExpiresOn ?? "");
  const [host, setHost] = useState(hostingProvider ?? "");
  const [hostExp, setHostExp] = useState(hostingExpiresOn ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function show() {
    setMembers(memberIds);
    setDomain(domainName ?? "");
    setDomainExp(domainExpiresOn ?? "");
    setHost(hostingProvider ?? "");
    setHostExp(hostingExpiresOn ?? "");
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_ids: members, domain_name: domain, domain_expires_on: domainExp || null, hosting_provider: host, hosting_expires_on: hostExp || null }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not save.");
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const team = employees.filter((e) => memberIds.includes(e.id));
  const domainInfo = renewal(domainExpiresOn);
  const hostInfo = renewal(hostingExpiresOn);

  return (
    <SectionCard
      title="Team & hosting"
      action={
        <button onClick={show} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A14A5] hover:underline">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/50">Team</p>
          {team.length === 0 ? (
            <p className="mt-1 text-[#231F20]/50">No team members assigned yet.</p>
          ) : (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {team.map((e) => (
                <span key={e.id} className="rounded-full bg-[#E8E7FB] px-2.5 py-1 text-xs font-semibold text-[#1A14A5]">
                  {e.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {[
            { icon: Globe, label: domainName || "No domain tracked", info: domainInfo },
            { icon: Server, label: hostingProvider || "No hosting tracked", info: hostInfo },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-2.5">
              <row.icon className="mt-0.5 h-4 w-4 text-[#231F20]/40" />
              <div>
                <p className="font-medium">{row.label}</p>
                {row.info && <p className={cn("text-xs", row.info.urgent ? "font-semibold text-red-600" : "text-[#231F20]/55")}>{row.info.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Team & hosting"
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={save}>
              {busy ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">Team members</p>
            {employees.length === 0 ? (
              <p className="text-sm text-[#231F20]/50">No active team members yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {employees.map((e) => {
                  const on = members.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setMembers(on ? members.filter((x) => x !== e.id) : [...members, e.id])}
                      className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", on ? "border-[#1A14A5] bg-[#E8E7FB] text-[#1A14A5]" : "border-[#1A14A5]/15 text-[#231F20]/70 hover:bg-[#F4F7FE]")}
                    >
                      {on ? "✓ " : "+ "}
                      {e.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="pt-domain" label="Domain" value={domain} onChange={setDomain} placeholder="example.com" />
            <TextField id="pt-domain-exp" label="Domain renews on" type="date" value={domainExp} onChange={setDomainExp} />
            <TextField id="pt-host" label="Hosting provider" value={host} onChange={setHost} placeholder="e.g. Hostinger" />
            <TextField id="pt-host-exp" label="Hosting renews on" type="date" value={hostExp} onChange={setHostExp} />
          </div>
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </Modal>
    </SectionCard>
  );
}
