"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputBase, labelBase } from "@/components/admin/ui";
import { RANGE_PRESETS, REVENUE_BASIS_HINTS, REVENUE_BASIS_LABELS, type RevenueBasis } from "@/lib/finance";

interface FinanceFiltersProps {
  from: string;
  to: string;
  /** Set when the range came from a preset rather than hand-picked months. */
  preset: string | null;
  basis: RevenueBasis;
  category: string;
  clientId: string;
  categories: string[];
  clients: { id: string; name: string }[];
}

/**
 * The finance filter bar. Every choice is written to the URL, so a filtered
 * P&L is a link someone can bookmark or send on — and the page stays a
 * server component that simply reads its own query string.
 */
export default function FinanceFilters({
  from,
  to,
  preset,
  basis,
  category,
  clientId,
  categories,
  clients,
}: FinanceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/admin/finance?${qs}` : "/admin/finance"));
  };

  /** Picking a preset clears any custom months, and vice versa — they'd otherwise contradict each other. */
  const applyPreset = (id: string) => apply({ preset: id, from: null, to: null });
  const applyMonth = (key: "from" | "to", value: string) =>
    apply({ [key]: value, [key === "from" ? "to" : "from"]: key === "from" ? to : from, preset: null });

  const isFiltered = !!preset || category !== "" || clientId !== "" || basis !== "cash";

  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-[#1A14A5]/10 bg-white p-4 shadow-sm sm:p-5",
        pending && "opacity-70"
      )}
    >
      {/* Range */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="space-y-1.5">
          <span className={labelBase}>Period</span>
          <div className="flex flex-wrap gap-1.5">
            {RANGE_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  preset === item.id
                    ? "bg-[#1A14A5] text-white shadow-sm"
                    : "border border-[#1A14A5]/10 bg-white text-[#231F20]/60 hover:border-[#1A14A5]/30"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <label htmlFor="finance-from" className={labelBase}>
              From
            </label>
            <input
              id="finance-from"
              type="month"
              value={from}
              max={to}
              onChange={(e) => applyMonth("from", e.target.value)}
              className={cn(inputBase, "w-[150px]")}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="finance-to" className={labelBase}>
              To
            </label>
            <input
              id="finance-to"
              type="month"
              value={to}
              min={from}
              onChange={(e) => applyMonth("to", e.target.value)}
              className={cn(inputBase, "w-[150px]")}
            />
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={() => startTransition(() => router.push("/admin/finance"))}
            className="ml-auto inline-flex items-center gap-1.5 self-end rounded-xl px-3 py-2 text-xs font-semibold text-[#231F20]/50 transition hover:bg-[#F4F7FE] hover:text-[#1A14A5]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset filters
          </button>
        )}
      </div>

      {/* Basis + dimension filters */}
      <div className="grid gap-4 border-t border-[#1A14A5]/10 pt-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <span className={labelBase}>Revenue basis</span>
          <div className="flex gap-1.5 rounded-xl bg-[#F4F7FE] p-1">
            {(Object.keys(REVENUE_BASIS_LABELS) as RevenueBasis[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => apply({ basis: option })}
                className={cn(
                  "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  basis === option ? "bg-white text-[#1A14A5] shadow-sm" : "text-[#231F20]/55 hover:text-[#231F20]"
                )}
              >
                {REVENUE_BASIS_LABELS[option]}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#231F20]/45">{REVENUE_BASIS_HINTS[basis]}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="finance-category" className={labelBase}>
            Expense category
          </label>
          <select
            id="finance-category"
            value={category}
            onChange={(e) => apply({ category: e.target.value })}
            className={inputBase}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="finance-client" className={labelBase}>
            Client
          </label>
          <select
            id="finance-client"
            value={clientId}
            onChange={(e) => apply({ client: e.target.value })}
            className={inputBase}
          >
            <option value="">All clients</option>
            {clients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
