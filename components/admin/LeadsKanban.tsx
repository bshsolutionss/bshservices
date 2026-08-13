"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type LeadStatus } from "@/lib/leads";

export interface KanbanLead {
  id: string;
  name: string;
  business: string | null;
  email: string;
  status: LeadStatus;
  priority: string;
  expected_value: number | null;
  selected_service: string | null;
  service_category: string | null;
}

function KanbanCard({ lead }: { lead: KanbanLead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-xl border border-[#1A14A5]/10 p-3 shadow-sm cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Link
        href={`/admin/leads/${lead.id}`}
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-sm text-[#231F20] hover:text-[#1A14A5] block"
      >
        {lead.name}
      </Link>
      <p className="text-xs text-[#231F20]/50 mt-0.5 truncate">
        {lead.selected_service || lead.service_category || lead.business || "—"}
      </p>
      {lead.expected_value !== null && (
        <p className="text-xs font-semibold text-[#1A14A5] mt-1.5">
          ${Number(lead.expected_value).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function KanbanColumn({ status, leads }: { status: LeadStatus; leads: KanbanLead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const colors = LEAD_STATUS_COLORS[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-64 rounded-2xl p-3 ${isOver ? "bg-[#1A14A5]/10" : "bg-[#F4F7FE]"}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: colors.bg, color: colors.text }}
        >
          {LEAD_STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-[#231F20]/40">{leads.length}</span>
      </div>
      <div className="space-y-2 min-h-[60px]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

interface LeadsKanbanProps {
  leads: KanbanLead[];
}

export default function LeadsKanban({ leads: initialLeads }: LeadsKanbanProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const newStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // "Lost" requires a reason — handled on the detail page, not a drop-time
    // modal, so don't optimistically move the card into a state the server
    // will reject.
    if (newStatus === "lost") {
      router.push(`/admin/leads/${leadId}`);
      return;
    }

    const previousStatus = lead.status;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    setError(null);

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Update failed");
      router.refresh();
    } catch (err) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: previousStatus } : l)));
      setError(err instanceof Error ? err.message : "Failed to move lead.");
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          ❌ {error}
        </div>
      )}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STATUSES.map((status) => (
            <KanbanColumn key={status} status={status} leads={leads.filter((l) => l.status === status)} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
