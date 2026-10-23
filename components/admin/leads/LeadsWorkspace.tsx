"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { BellRing, CheckSquare, Columns3, Download, MoreVertical, Phone, Plug, Plus, Search, Table2, Target, Trash2, Trophy, TrendingUp, Users, X } from "lucide-react";
import { Alert, EmptyState, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from "@/lib/leads";
import { formatMoney, type Currency } from "@/lib/invoices";
import type { LeadStage } from "@/lib/lead-stages";
import { cn } from "@/lib/utils";
import LeadsTable, { type LeadListItem } from "@/components/admin/leads/LeadsTable";
import LeadFormModal from "@/components/admin/leads/LeadFormModal";
import StagesModal from "@/components/admin/leads/StagesModal";
import ImportLeadsModal from "@/components/admin/leads/ImportLeadsModal";
import CollectFormModal from "@/components/admin/leads/CollectFormModal";

export interface WorkspaceLead extends LeadListItem {
  assigned_to: string | null;
  location: string | null;
  reminder_at: string | null;
}

interface Props {
  leads: WorkspaceLead[];
  stages: LeadStage[];
  employees: { id: string; name: string }[];
  stats: { open: number; pipeline: string; wonThisMonth: number; winRate: number | null };
  siteUrl: string;
}

type View = "board" | "person" | "table";

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function LeadsWorkspace({ leads, stages, employees, stats, siteUrl }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>("board");
  const [search, setSearch] = useState("");
  const [person, setPerson] = useState<string>("all");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [menu, setMenu] = useState(false);
  const [addFor, setAddFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const nameOf = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees]);
  const stageByKey = useMemo(() => new Map(stages.map((s) => [s.key, s])), [stages]);

  // Optimistic stage moves live in `local` until the server refresh lands.
  const rows = useMemo(() => leads.map((l) => (local[l.id] ? { ...l, status: local[l.id] } : l)), [leads, local]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((l) => {
      if (!q) return true;
      return [l.name, l.business, l.email, l.phone, l.location, l.selected_service].some((v) => v?.toLowerCase().includes(q));
    });
  }, [rows, search]);

  async function patchStatus(id: string, status: string) {
    const previous = local[id];
    setLocal((m) => ({ ...m, [id]: status }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not move the lead.");
      router.refresh();
    } catch (err) {
      setLocal((m) => {
        const next = { ...m };
        if (previous) next[id] = previous;
        else delete next[id];
        return next;
      });
      setError(err instanceof Error ? err.message : "Could not move the lead.");
    }
  }

  function onDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const id = String(e.active.id);
    const status = String(e.over.id);
    const lead = rows.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    // "Lost" needs a reason, collected on the lead's page rather than guessed at drop time.
    if (stageByKey.get(status)?.kind === "lost") return router.push(`/admin/leads/${id}`);
    patchStatus(id, status);
  }

  async function bulk(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selected, ...body }) });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "That didn't work.");
      setSelected([]);
      setSelecting(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
    };
    const header = ["Name", "Company", "Phone", "Email", "Location", "Stage", "Source", "Value", "Currency", "Assigned to", "Added"];
    const lines = [header.join(",")].concat(
      filtered.map((l) =>
        [l.name, l.business, l.phone, l.email, l.location, LEAD_STATUS_LABELS[l.status] ?? l.status, (l as { lead_source_detail?: string }).lead_source_detail ?? l.source, l.expected_value, l.expected_value ? l.expected_value_currency : "", l.assigned_to ? nameOf.get(l.assigned_to) : "", l.created_at.slice(0, 10)]
          .map(esc)
          .join(",")
      )
    );
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMenu(false);
  }

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const toggles: { key: View; label: string; icon: typeof Columns3 }[] = [
    { key: "board", label: "Board", icon: Columns3 },
    { key: "person", label: "By person", icon: Users },
    { key: "table", label: "Table", icon: Table2 },
  ];

  const visibleStages = stages;
  const peopleGroups = [
    ...employees.map((e) => ({ id: e.id, name: e.name })),
    { id: "none", name: "Unassigned" },
  ].map((p) => ({ ...p, leads: filtered.filter((l) => (p.id === "none" ? !l.assigned_to : l.assigned_to === p.id)) }));

  return (
    <div className="space-y-4">
      {/* header: title, live numbers, primary actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-2 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8E7FB] text-[#1A14A5]">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#231F20]">Leads</h1>
            <p className="text-sm text-[#231F20]/55">Your sales pipeline</p>
          </div>
        </div>
        <Stat icon={Target} label="Open" value={String(stats.open)} />
        <Stat icon={TrendingUp} label="Pipeline" value={stats.pipeline} />
        <Stat icon={Trophy} label="Won / mo" value={String(stats.wonThisMonth)} extra={{ label: "Win rate", value: stats.winRate === null ? "-" : `${stats.winRate}%` }} />
        <div className="ml-auto flex items-center gap-2">
          <StagesModal stages={stages} />
          <LeadFormModal stages={stages} employees={employees} label="New lead" />
        </div>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-[#1A14A5]/10 bg-white p-1">
          {toggles.map((t) => (
            <button key={t.key} onClick={() => setView(t.key)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition", view === t.key ? "bg-[#F4F7FE] text-[#1A14A5]" : "text-[#231F20]/60 hover:text-[#1A14A5]")}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-xl border border-[#1A14A5]/10 bg-white px-3">
          <Search className="h-4 w-4 text-[#231F20]/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…" className="w-full bg-transparent py-2 text-sm outline-none" />
        </div>
        {view === "board" && (
          <button onClick={() => (setSelecting((s) => !s), setSelected([]))} className={cn(btnSecondary, selecting && "border-[#1A14A5] text-[#1A14A5]")}>
            <CheckSquare className="h-4 w-4" /> {selecting ? "Done" : "Select"}
          </button>
        )}
        <ImportLeadsModal />
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} aria-label="More" className={cn(btnSecondary, "px-2.5")}>
            <MoreVertical className="h-4 w-4" />
          </button>
          {menu && (
            <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-[#1A14A5]/10 bg-white py-1 shadow-lg">
              <button onClick={exportCsv} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#F4F7FE]">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          )}
        </div>
        <CollectFormModal stages={stages} siteUrl={siteUrl} />
        <Link href="/admin/leads/sources" className={btnPrimary}>
          <Plug className="h-4 w-4" /> Lead sources
        </Link>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {view === "board" && (
        <DndContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {visibleStages.map((stage) => (
              <Column
                key={stage.key}
                stage={stage}
                leads={filtered.filter((l) => l.status === stage.key)}
                selecting={selecting}
                selected={selected}
                onToggle={toggleSelect}
                onAdd={() => setAddFor(stage.key)}
                nameOf={nameOf}
              />
            ))}
          </div>
        </DndContext>
      )}

      {view === "person" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", name: "Everyone", count: filtered.length }, ...peopleGroups.filter((g) => g.id !== "none" || g.leads.length > 0).map((g) => ({ id: g.id, name: g.name, count: g.leads.length }))].map((p) => (
              <button key={p.id} onClick={() => setPerson(p.id)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold", person === p.id ? "border-[#1A14A5] bg-[#E8E7FB] text-[#1A14A5]" : "border-[#1A14A5]/10 bg-white text-[#231F20]/70")}>
                {p.name} <span className="rounded-full bg-white/80 px-1.5 text-xs">{p.count}</span>
              </button>
            ))}
          </div>
          {peopleGroups
            .filter((g) => person === "all" || person === g.id)
            .filter((g) => g.id !== "none" || g.leads.length > 0 || person === "none")
            .map((g) => (
              <div key={g.id} className="overflow-hidden rounded-2xl border border-[#1A14A5]/10 bg-white">
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E8E7FB] text-sm font-bold text-[#1A14A5]">{initials(g.name)}</span>
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-[#231F20]/50">{g.leads.length === 0 ? "No leads assigned yet" : `${g.leads.length} lead${g.leads.length === 1 ? "" : "s"}`}</p>
                  </div>
                </div>
                {g.leads.length > 0 && (
                  <ul className="divide-y divide-[#1A14A5]/5 border-t border-[#1A14A5]/10">
                    {g.leads.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                        <div className="min-w-0">
                          <Link href={`/admin/leads/${l.id}`} className="font-medium text-[#1A14A5] hover:underline">
                            {l.name}
                          </Link>
                          <p className="truncate text-xs text-[#231F20]/50">{[l.business, l.phone].filter(Boolean).join(" · ") || "-"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {l.expected_value != null && <span className="text-sm font-semibold">{formatMoney(Number(l.expected_value), l.expected_value_currency as Currency)}</span>}
                          <StageBadge stageKey={l.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}

      {view === "table" && <LeadsTable leads={filtered} emptyTitle="No leads yet" />}

      {leads.length === 0 && view !== "table" && (
        <EmptyState icon={Target} title="No leads yet" description="Add one by hand, import a CSV, share a form link, or connect a lead source." />
      )}

      {selecting && selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[95vw] flex-wrap items-center gap-2 rounded-2xl border border-[#1A14A5]/15 bg-white px-4 py-3 shadow-2xl">
          <span className="text-sm font-semibold">{selected.length} selected</span>
          <select
            disabled={busy}
            defaultValue=""
            onChange={(e) => e.target.value && bulk({ action: "move", status: e.target.value })}
            className="rounded-lg border border-[#1A14A5]/15 px-2 py-1.5 text-sm"
            aria-label="Move to stage"
          >
            <option value="">Move to…</option>
            {stages.filter((s) => s.kind === "open").map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            disabled={busy}
            defaultValue=""
            onChange={(e) => e.target.value && bulk({ action: "assign", assigned_to: e.target.value === "none" ? null : e.target.value })}
            className="rounded-lg border border-[#1A14A5]/15 px-2 py-1.5 text-sm"
            aria-label="Assign to"
          >
            <option value="">Assign to…</option>
            <option value="none">Unassigned</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            disabled={busy}
            onClick={() => window.confirm(`Delete ${selected.length} lead${selected.length === 1 ? "" : "s"}? This can't be undone.`) && bulk({ action: "delete" })}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button onClick={() => setSelected([])} aria-label="Clear selection" className="rounded-lg p-1.5 text-[#231F20]/50 hover:bg-[#F4F7FE]">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <LeadFormModal stages={stages} employees={employees} open={addFor !== null} onClose={() => setAddFor(null)} defaultStatus={addFor ?? undefined} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, extra }: { icon: typeof Target; label: string; value: string; extra?: { label: string; value: string } }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1A14A5]/10 bg-white px-3.5 py-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F4F7FE] text-[#231F20]/40">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] text-[#231F20]/50">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
      {extra && (
        <div className="border-l border-[#1A14A5]/10 pl-3">
          <p className="text-[11px] text-[#231F20]/50">{extra.label}</p>
          <p className="text-sm font-bold">{extra.value}</p>
        </div>
      )}
    </div>
  );
}

function StageBadge({ stageKey }: { stageKey: string }) {
  const colors = LEAD_STATUS_COLORS[stageKey] ?? { bg: "#F1F1F1", text: "#4B5563" };
  return (
    <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: colors.bg, color: colors.text }}>
      {LEAD_STATUS_LABELS[stageKey] ?? stageKey}
    </span>
  );
}

function Column({
  stage,
  leads,
  selecting,
  selected,
  onToggle,
  onAdd,
  nameOf,
}: {
  stage: LeadStage;
  leads: WorkspaceLead[];
  selecting: boolean;
  selected: string[];
  onToggle: (id: string) => void;
  onAdd: () => void;
  nameOf: Map<string, string>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[420px] w-64 shrink-0 flex-col rounded-2xl border p-3 transition"
      style={{ background: `${stage.color}${isOver ? "33" : "14"}`, borderColor: `${stage.color}${isOver ? "99" : "40"}` }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
          {stage.label}
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#231F20]/60">{leads.length}</span>
        </span>
        {stage.kind === "open" && (
          <button onClick={onAdd} aria-label={`Add a lead to ${stage.label}`} className="rounded-md p-1 text-[#231F20]/40 hover:bg-white hover:text-[#1A14A5]">
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 space-y-2">
        {leads.length === 0 && <p className="pt-3 text-center text-sm text-[#231F20]/35">No leads</p>}
        {leads.map((l) => (
          <Card key={l.id} lead={l} selecting={selecting} checked={selected.includes(l.id)} onToggle={() => onToggle(l.id)} assignee={l.assigned_to ? nameOf.get(l.assigned_to) : undefined} />
        ))}
      </div>
    </div>
  );
}

function Card({ lead, selecting, checked, onToggle, assignee }: { lead: WorkspaceLead; selecting: boolean; checked: boolean; onToggle: () => void; assignee?: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id, disabled: selecting });
  const overdue = lead.reminder_at && new Date(lead.reminder_at).getTime() < Date.now();
  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 } : undefined}
      {...(selecting ? {} : listeners)}
      {...attributes}
      onClick={selecting ? onToggle : undefined}
      className={cn(
        "touch-none rounded-xl border bg-white p-3 shadow-sm",
        selecting ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        checked ? "border-[#1A14A5] ring-2 ring-[#1A14A5]/20" : "border-[#1A14A5]/10",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {selecting ? (
          <span className="text-sm font-semibold">{lead.name}</span>
        ) : (
          <Link href={`/admin/leads/${lead.id}`} onClick={(e) => e.stopPropagation()} className="text-sm font-semibold text-[#231F20] hover:text-[#1A14A5]">
            {lead.name}
          </Link>
        )}
        {selecting && <input type="checkbox" readOnly checked={checked} className="mt-0.5 h-4 w-4 accent-[#1A14A5]" aria-label={`Select ${lead.name}`} />}
      </div>
      <p className="mt-0.5 truncate text-xs text-[#231F20]/50">{lead.business || lead.selected_service || lead.service_category || lead.location || "-"}</p>
      {lead.phone && (
        <p className="mt-1 flex items-center gap-1 text-xs text-[#231F20]/60">
          <Phone className="h-3 w-3" /> {lead.phone}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {lead.expected_value != null && <span className="text-xs font-bold text-[#1A14A5]">{formatMoney(Number(lead.expected_value), lead.expected_value_currency as Currency)}</span>}
        {lead.reminder_at && (
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700")}>
            <BellRing className="h-3 w-3" /> {new Date(lead.reminder_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
        {assignee && (
          <span title={assignee} className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-[#E8E7FB] text-[9px] font-bold text-[#1A14A5]">
            {initials(assignee)}
          </span>
        )}
      </div>
    </div>
  );
}
