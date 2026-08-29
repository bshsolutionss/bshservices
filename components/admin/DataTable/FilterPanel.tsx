"use client";

import { useEffect, useState } from "react";
import { Search, Filter as FilterIcon, X } from "lucide-react";

interface FilterPanelProps {
  columnLabel: string;
  /** Every distinct value currently in that column, already deduped/sorted. */
  options: string[];
  /** Values currently applied (from the parent's committed filter state). */
  selected: Set<string>;
  onApply: (values: Set<string>) => void;
  onClear: () => void;
  onClose: () => void;
}

/**
 * Right-side slide-over — "Filter by '<Column>'" with an in-panel search
 * box over a checkbox list of that column's distinct values. Selections
 * are staged locally and only committed on Apply, matching the reference's
 * explicit Apply/Clear buttons rather than filtering live per checkbox.
 */
export default function FilterPanel({ columnLabel, options, selected, onApply, onClear, onClose }: FilterPanelProps) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Set<string>>(new Set(selected));

  useEffect(() => setDraft(new Set(selected)), [selected]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const visibleOptions = options.filter((o) => o.toLowerCase().includes(search.trim().toLowerCase()));

  const toggle = (value: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A14A5]/10">
          <h2 className="font-bold text-[#231F20]">
            Filter by &lsquo;{columnLabel}&rsquo;
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-[#231F20]/40 hover:text-[#231F20]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#231F20]/40" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F7FE] border border-transparent focus:border-[#1A14A5]/30 text-sm outline-none"
            />
          </div>

          <div className="space-y-0.5">
            {visibleOptions.length === 0 && <p className="text-sm text-[#231F20]/50 py-4 text-center">No values found.</p>}
            {visibleOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#F4F7FE] cursor-pointer text-sm text-[#231F20]"
              >
                <input
                  type="checkbox"
                  checked={draft.has(option)}
                  onChange={() => toggle(option)}
                  className="w-4 h-4 rounded border-[#1A14A5]/30 text-[#1A14A5] focus:ring-[#1A14A5]/30"
                />
                <span className="truncate">{option || "(empty)"}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-[#1A14A5]/10">
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A14A5] hover:bg-[#0e0a7a] text-white text-sm font-semibold py-2.5 transition"
          >
            <FilterIcon className="w-4 h-4" /> Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(new Set());
              onClear();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#1A14A5]/15 text-[#231F20]/70 hover:bg-[#F4F7FE] text-sm font-semibold py-2.5 transition"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>
    </>
  );
}
