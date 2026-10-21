"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Alert, Badge, SectionCard, inputBase } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { optionBadgeColors } from "@/lib/option-lists";
import type { StatusListKey } from "@/lib/status-config";

export interface StatusItemView {
  value: string;
  label: string;
  color: string;
  defaultLabel: string;
  defaultColor: string;
  customised: boolean;
}
export interface StatusListView {
  key: StatusListKey;
  label: string;
  description: string;
  items: StatusItemView[];
}

/** Rename and recolour statuses/stages. The key shown in grey is what reports use, so it stays fixed. */
export default function StatusLabelsManager({ lists }: { lists: StatusListView[] }) {
  const router = useRouter();
  const [data, setData] = useState(lists);
  const [error, setError] = useState<string | null>(null);

  const update = (listKey: StatusListKey, value: string, patch: Partial<StatusItemView>) =>
    setData((current) =>
      current.map((l) =>
        l.key === listKey ? { ...l, items: l.items.map((i) => (i.value === value ? { ...i, ...patch } : i)) } : l
      )
    );

  const save = async (listKey: StatusListKey, item: StatusItemView) => {
    setError(null);
    const res = await fetch("/api/admin/status-labels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ list: listKey, value: item.value, label: item.label, color: item.color }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Could not save.");
      return;
    }
    update(listKey, item.value, { customised: item.label !== item.defaultLabel || item.color !== item.defaultColor });
    router.refresh();
  };

  const reset = async (listKey: StatusListKey, item: StatusItemView) => {
    setError(null);
    const res = await fetch(`/api/admin/status-labels?list=${listKey}&value=${item.value}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not reset.");
      return;
    }
    update(listKey, item.value, { label: item.defaultLabel, color: item.defaultColor, customised: false });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Alert tone="info">
        You can change how each status is <strong>named and coloured</strong> everywhere in the panel. The grey key
        underneath is what reports and automations use (for example, “paid” counts as revenue), so it can&apos;t be
        renamed or removed.
      </Alert>
      {error && <Alert tone="error">{error}</Alert>}

      {data.map((list) => (
        <SectionCard key={list.key} title={list.label} subtitle={list.description}>
          <ul className="divide-y divide-[#1A14A5]/5">
            {list.items.map((item) => (
              <li key={item.value} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="w-32 shrink-0">
                  <Badge label={item.label || item.defaultLabel} colors={optionBadgeColors(item.color)} />
                </div>
                <input
                  value={item.label}
                  onChange={(e) => update(list.key, item.value, { label: e.target.value })}
                  onBlur={() => item.label.trim() && save(list.key, item)}
                  maxLength={40}
                  aria-label="Name"
                  className={cn(inputBase, "min-w-[160px] flex-1")}
                />
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => update(list.key, item.value, { color: e.target.value })}
                  onBlur={() => save(list.key, item)}
                  aria-label="Colour"
                  className="h-9 w-11 cursor-pointer rounded-lg border border-[#1A14A5]/15 bg-white p-1"
                />
                <code className="w-28 shrink-0 truncate text-xs text-[#231F20]/40" title="Fixed key">
                  {item.value}
                </code>
                <button
                  type="button"
                  onClick={() => reset(list.key, item)}
                  disabled={!item.customised}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A14A5] hover:underline disabled:pointer-events-none disabled:opacity-30"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>
      ))}
    </div>
  );
}
