"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Globe, Inbox, Plug, Plus, RefreshCw, Store, Trash2, Webhook } from "lucide-react";
import { Alert, Badge, ConfirmButton, EmptyState, SectionCard, SelectField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { SOURCE_TYPES, type LeadSourceRow, type LeadSourceType } from "@/lib/lead-sources";
import type { LeadStage } from "@/lib/lead-stages";
import { cn } from "@/lib/utils";

interface Props {
  sources: LeadSourceRow[];
  leadCounts: Record<string, number>;
  stages: LeadStage[];
  siteUrl: string;
}

const ICONS: Record<LeadSourceType, typeof Globe> = { website: Globe, google_ads: Plug, indiamart: Store, webhook: Webhook };

function instructions(type: LeadSourceType, url: string): React.ReactNode {
  switch (type) {
    case "website":
      return (
        <div className="space-y-2 text-sm text-[#231F20]/70">
          <p>
            Point your website&apos;s contact form at this address (method <strong>POST</strong>). Plain HTML forms work as-is - name the fields <code>name</code>, <code>email</code>, <code>phone</code>, <code>company</code>, <code>message</code>:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-[#231F20] p-3 text-xs text-white">{`<form action="${url}" method="POST">
  <input name="name" required>
  <input name="phone">
  <input name="email" type="email">
  <textarea name="message"></textarea>
  <button>Send</button>
</form>`}</pre>
          <p>Or send JSON from your own code with <code>fetch(&quot;{url}&quot;, {"{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }"})</code>.</p>
        </div>
      );
    case "google_ads":
      return (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[#231F20]/70">
          <li>In Google Ads open your lead form asset and choose <strong>Lead delivery &gt; Webhook integration</strong>.</li>
          <li>Paste the URL below as the <strong>Webhook URL</strong>.</li>
          <li>For the <strong>Key</strong>, enter any text (the secret is already in the URL).</li>
          <li>Press <strong>Send test data</strong> - a test lead should appear on your board.</li>
        </ol>
      );
    case "indiamart":
      return (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[#231F20]/70">
          <li>Log in to IndiaMART Lead Manager and open <strong>Import/Export Leads &gt; Push API</strong>.</li>
          <li>Paste the URL below as your push URL and save.</li>
          <li>New buy-leads are delivered to this address the moment they arrive.</li>
        </ol>
      );
    default:
      return (
        <div className="space-y-2 text-sm text-[#231F20]/70">
          <p>
            In Zapier or Make, add a <strong>Webhooks &gt; POST</strong> step with this URL. Send fields named <code>name</code>, <code>phone</code>, <code>email</code>, <code>company</code>, <code>location</code>, <code>message</code> - anything else is saved on the lead as extra fields.
          </p>
          <p>Works for LinkedIn Lead Gen, TikTok, JustDial, Facebook Lead Ads (through Zapier/Make) and custom tools.</p>
        </div>
      );
  }
}

export default function LeadSourcesManager({ sources, leadCounts, stages, siteUrl }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const openStages = stages.filter((s) => s.kind === "open");
  const endpoint = (s: LeadSourceRow) => `${siteUrl}/api/lead-sources/${s.token}`;

  async function call(url: string, init: RequestInit, key: string): Promise<{ ok: boolean; [k: string]: unknown }> {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(url, init);
      const json = await res.json().catch(() => null);
      if (!json?.ok) setError(json?.error ?? "That didn't work.");
      else router.refresh();
      return json ?? { ok: false };
    } finally {
      setBusy(null);
    }
  }

  async function connect(type: LeadSourceType) {
    const json = await call("/api/admin/lead-sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) }, `new-${type}`);
    if (json.ok) setOpenId((json.source as LeadSourceRow).id);
  }

  const patch = (id: string, body: unknown) => call(`/api/admin/lead-sources/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, id);

  function copy(s: LeadSourceRow) {
    navigator.clipboard.writeText(endpoint(s)).then(() => {
      setCopied(s.id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <SectionCard title="Connected" padded={sources.length === 0}>
        {sources.length === 0 ? (
          <EmptyState icon={Inbox} title="No lead sources yet" description="Pick a platform below. Most take under two minutes to connect." />
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">
            {sources.map((s) => {
              const Icon = ICONS[s.type];
              const expanded = openId === s.id;
              return (
                <li key={s.id} className="p-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4F7FE] text-[#1A14A5]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-[#231F20]/50">
                        {leadCounts[s.id] ?? 0} lead{(leadCounts[s.id] ?? 0) === 1 ? "" : "s"}
                        {s.last_lead_at && ` · last ${new Date(s.last_lead_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                      </p>
                    </div>
                    <Badge label={s.active ? "Live" : "Paused"} colors={s.active ? { bg: "#D1FAE5", text: "#065F46" } : { bg: "#FEF3C7", text: "#92400E" }} />
                    <button onClick={() => setOpenId(expanded ? null : s.id)} className={btnSecondary}>
                      {expanded ? "Hide setup" : "Setup"}
                    </button>
                  </div>

                  {expanded && (
                    <div className="mt-4 space-y-4 rounded-xl bg-[#F4F7FE] p-4">
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">Your URL</p>
                        <div className="flex items-center gap-2">
                          <input readOnly value={endpoint(s)} onFocus={(e) => e.currentTarget.select()} aria-label="Endpoint URL" className="min-w-0 flex-1 rounded-lg border border-[#1A14A5]/15 bg-white px-3 py-2 text-sm" />
                          <button onClick={() => copy(s)} className={btnPrimary}>
                            {copied === s.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === s.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs text-[#231F20]/50">Treat this link like a password: anyone who has it can add leads.</p>
                      </div>
                      {instructions(s.type, endpoint(s))}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField
                          id={`src-stage-${s.id}`}
                          label="Add new leads to"
                          value={s.stage_key ?? ""}
                          onChange={(v) => patch(s.id, { stage_key: v })}
                          options={[{ value: "", label: "First stage of the pipeline" }, ...openStages.map((st) => ({ value: st.key, label: st.label }))]}
                          hideOptional
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => patch(s.id, { active: !s.active })} disabled={busy === s.id} className={btnSecondary}>
                          {s.active ? "Pause" : "Resume"}
                        </button>
                        <ConfirmButton
                          label="New URL"
                          icon={<RefreshCw className="h-4 w-4" />}
                          tone="primary"
                          title="Generate a new URL?"
                          message="The current URL stops working immediately. You'll need to paste the new one wherever the old one was used."
                          confirmLabel="Generate new URL"
                          onConfirm={async () => {
                            const res = await fetch(`/api/admin/lead-sources/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rotate: true }) });
                            if (!res.ok) throw new Error("Could not generate a new URL.");
                            router.refresh();
                          }}
                        />
                        <ConfirmButton
                          display="inline"
                          label="Disconnect"
                          icon={<Trash2 className="mr-1 inline h-3.5 w-3.5" />}
                          className="ml-auto"
                          title={`Disconnect ${s.name}?`}
                          message="Its URL stops working. Leads it already delivered stay on your board."
                          onConfirm={async () => {
                            const res = await fetch(`/api/admin/lead-sources/${s.id}`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Could not disconnect.");
                            router.refresh();
                          }}
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#231F20]/50">Add a source</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {SOURCE_TYPES.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <div key={t.type} className="flex flex-col rounded-2xl border border-[#1A14A5]/10 bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F4F7FE] text-[#1A14A5]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-[#231F20]/60">{t.blurb}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#231F20]/40">{t.hint}</span>
                  <button onClick={() => connect(t.type)} disabled={busy !== null} className={btnSecondary}>
                    <Plus className="h-4 w-4" /> {busy === `new-${t.type}` ? "Connecting..." : "Connect"}
                  </button>
                </div>
              </div>
            );
          })}
          <div className={cn("flex flex-col rounded-2xl border border-dashed border-[#1A14A5]/20 bg-white/60 p-4")}>
            <div className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1877F2] text-lg font-bold text-white">f</span>
              <div>
                <p className="font-semibold">Meta Lead Ads</p>
                <p className="text-sm text-[#231F20]/60">
                  Facebook &amp; Instagram instant forms. A one-click login needs a Meta developer app, which isn&apos;t set up yet - for now connect it through <strong>Zapier or Make</strong> using a Webhook source above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
