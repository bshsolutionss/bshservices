"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Users, Building2, FolderKanban } from "lucide-react";
import type { SearchResult } from "@/app/api/admin/search/route";

const TYPE_ICON = { lead: Users, client: Building2, project: FolderKanban } as const;
const TYPE_LABEL = { lead: "Lead", client: "Client", project: "Project" } as const;

/**
 * Global admin search — debounced query against /api/admin/search, results
 * grouped by type in a dropdown. Enter jumps to the first result; Escape
 * or a click outside closes it.
 */
export default function AdminSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((body) => setResults(body.ok ? body.results : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goTo = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      e.currentTarget.blur();
    } else if (e.key === "Enter" && results.length > 0) {
      goTo(results[0]);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#231F20]/40" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search leads, clients, projects…"
        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F7FE] border border-transparent focus:border-[#1A14A5]/30 focus:bg-white text-sm text-[#231F20] placeholder:text-[#231F20]/40 outline-none transition"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#1A14A5]/10 max-h-96 overflow-y-auto z-50">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-[#231F20]/50">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className="px-4 py-4 text-sm text-[#231F20]/50">No matches for &ldquo;{query}&rdquo;.</p>
          )}
          {!loading &&
            results.map((result) => {
              const Icon = TYPE_ICON[result.type];
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => goTo(result)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F4F7FE] text-left transition"
                >
                  <Icon className="w-4 h-4 text-[#1A14A5] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#231F20] truncate">{result.label}</p>
                    <p className="text-xs text-[#231F20]/50 truncate">{result.sublabel}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#231F20]/30 shrink-0">
                    {TYPE_LABEL[result.type]}
                  </span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
