"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/admin/ui";
import { COMM_CHANNEL_COLORS, COMM_CHANNEL_LABELS, whatsAppLinkFor, type Communication } from "@/lib/communications";
import { formatDate } from "@/lib/invoices";

export type FollowUpItem = Communication & { clientName: string; clientPhone: string | null };

/** Clients you promised to get back to. Mark done when handled, or jump straight to WhatsApp. */
export default function FollowUpList({ items, today }: { items: FollowUpItem[]; today: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const markDone = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/communications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_done: true }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ul className="divide-y divide-[#1A14A5]/5">
      {items.map((item) => {
        const overdue = !!item.follow_up_on && item.follow_up_on < today;
        const dueToday = item.follow_up_on === today;
        const wa = whatsAppLinkFor(item.clientPhone);
        return (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {item.client_id ? (
                  <Link href={`/admin/clients/${item.client_id}`} className="font-semibold text-[#1A14A5] hover:underline">
                    {item.clientName}
                  </Link>
                ) : (
                  <span className="font-semibold">{item.clientName}</span>
                )}
                <Badge label={COMM_CHANNEL_LABELS[item.channel]} colors={COMM_CHANNEL_COLORS[item.channel]} />
              </div>
              <p className="mt-0.5 truncate text-sm text-[#231F20]/65">{item.subject || item.summary}</p>
              <p className={overdue ? "text-xs font-semibold text-red-600" : dueToday ? "text-xs font-semibold text-amber-700" : "text-xs text-[#231F20]/45"}>
                {overdue ? "Overdue · " : dueToday ? "Today · " : "Due "}
                {formatDate(item.follow_up_on)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  WhatsApp <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                type="button"
                onClick={() => markDone(item.id)}
                disabled={busyId === item.id}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1A14A5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0e0a7a] disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> {busyId === item.id ? "Saving…" : "Mark done"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
