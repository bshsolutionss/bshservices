"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Settings, Download, Search, Filter as FilterIcon, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataTableColumn } from "./types";
import FilterPanel from "./FilterPanel";
import CustomColumnModal from "./CustomColumnModal";

interface StoredLayout {
  order: string[];
  hidden: string[];
}

function loadLayout(tableId: string): StoredLayout | null {
  try {
    const raw = localStorage.getItem(`admin-table-${tableId}`);
    return raw ? (JSON.parse(raw) as StoredLayout) : null;
  } catch {
    return null;
  }
}

function saveLayout(tableId: string, layout: StoredLayout): void {
  try {
    localStorage.setItem(`admin-table-${tableId}`, JSON.stringify(layout));
  } catch {
    // Private browsing / storage full — the table still works, it just won't remember the layout next visit.
  }
}

/** CSV field escaping — wrap in quotes and double up any embedded quotes whenever the value needs it. */
function csvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

interface AdminDataTableProps<T> {
  /** Unique per page — namespaces the localStorage key that remembers this table's column layout. */
  tableId: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  newHref?: string;
  newLabel?: string;
  /** Slot for a page's own create-flow (e.g. an inline form) when a plain `newHref` link isn't enough. */
  toolbarExtra?: React.ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

/**
 * Reusable admin list table — sortable/filterable columns, a global search
 * box, CSV export, and a "Setting" → Custom Column editor for showing/
 * hiding/reordering columns (persisted per-table in localStorage). Layout
 * modeled on a reference screenshot the user provided.
 */
export default function AdminDataTable<T>({
  tableId,
  columns,
  rows,
  getRowKey,
  newHref,
  newLabel = "New",
  toolbarExtra,
  searchPlaceholder = "Search…",
  emptyMessage = "No records found.",
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = useState<Map<string, Set<string>>>(new Map());
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map((c) => c.key));
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  // Load any saved layout once on mount — reconciled against the columns
  // this render actually received, so a renamed/removed column key never
  // leaves the table stuck with nothing rendering.
  useEffect(() => {
    const saved = loadLayout(tableId);
    if (!saved) return;
    const validKeys = new Set(columns.map((c) => c.key));
    const restoredOrder = saved.order.filter((k) => validKeys.has(k));
    for (const c of columns) if (!restoredOrder.includes(c.key)) restoredOrder.push(c.key);
    setColumnOrder(restoredOrder);
    setHiddenKeys(new Set(saved.hidden.filter((k) => validKeys.has(k))));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally load once on mount only
  }, [tableId]);

  const columnsByKey = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);
  const visibleColumns = columnOrder.filter((key) => !hiddenKeys.has(key)).map((key) => columnsByKey.get(key)!).filter(Boolean);

  const filteredRows = useMemo(() => {
    let result = rows;

    for (const [key, values] of filters) {
      if (values.size === 0) continue;
      const column = columnsByKey.get(key);
      if (!column) continue;
      result = result.filter((row) => values.has(String(column.value(row) ?? "")));
    }

    const q = search.trim().toLowerCase();
    if (q) {
      const searchableColumns = columns.filter((c) => c.filterable !== false);
      result = result.filter((row) =>
        searchableColumns.some((c) => String(c.value(row) ?? "").toLowerCase().includes(q))
      );
    }

    if (sort) {
      const column = columnsByKey.get(sort.key);
      if (column) {
        result = [...result].sort((a, b) => {
          const av = column.value(a) ?? "";
          const bv = column.value(b) ?? "";
          const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
          return sort.direction === "asc" ? cmp : -cmp;
        });
      }
    }

    return result;
  }, [rows, filters, search, sort, columns, columnsByKey]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  const filterOptionsFor = (key: string): string[] => {
    const column = columnsByKey.get(key);
    if (!column) return [];
    const values = new Set(rows.map((row) => String(column.value(row) ?? "")));
    return [...values].sort((a, b) => a.localeCompare(b));
  };

  const handleExport = () => {
    const header = visibleColumns.map((c) => csvField(c.label)).join(",");
    const lines = filteredRows.map((row) =>
      visibleColumns.map((c) => csvField(String(c.value(row) ?? ""))).join(",")
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableId}-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openFilterColumn = openFilterKey ? columnsByKey.get(openFilterKey) : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-3 flex flex-wrap items-center gap-3">
        {newHref && (
          <Link
            href={newHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1A14A5]/15 text-sm font-semibold text-[#231F20] hover:bg-[#F4F7FE] transition"
          >
            <Plus className="w-4 h-4" /> {newLabel}
          </Link>
        )}
        {toolbarExtra}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1A14A5]/15 text-sm font-semibold text-[#231F20] hover:bg-[#F4F7FE] transition"
        >
          <Settings className="w-4 h-4" /> Setting
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1A14A5]/15 text-sm font-semibold text-[#231F20] hover:bg-[#F4F7FE] transition"
        >
          <Download className="w-4 h-4" /> Export
        </button>

        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#231F20]/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F7FE] border border-transparent focus:border-[#1A14A5]/30 focus:bg-white text-sm outline-none transition"
          />
        </div>
      </div>

      <p className="text-xs text-[#231F20]/50 px-1">
        Showing {filteredRows.length} of {rows.length}
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              {visibleColumns.map((column) => {
                const sortable = column.sortable !== false;
                const filterable = column.filterable !== false;
                const isSorted = sort?.key === column.key;
                const isFiltered = (filters.get(column.key)?.size ?? 0) > 0;
                return (
                  <th key={column.key} className={cn("px-6 py-3 font-medium whitespace-nowrap", column.className)}>
                    <div className="flex items-center gap-1.5">
                      <span>{column.label}</span>
                      {sortable && (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          aria-label={`Sort by ${column.label}`}
                          className={cn("p-0.5 rounded hover:bg-[#F4F7FE]", isSorted ? "text-[#1A14A5]" : "text-[#231F20]/30")}
                        >
                          {isSorted ? (
                            sort!.direction === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      {filterable && (
                        <button
                          type="button"
                          onClick={() => setOpenFilterKey(column.key)}
                          aria-label={`Filter by ${column.label}`}
                          className={cn("p-0.5 rounded hover:bg-[#F4F7FE]", isFiltered ? "text-[#1A14A5]" : "text-[#231F20]/30")}
                        >
                          <FilterIcon className={cn("w-3.5 h-3.5", isFiltered && "fill-current")} />
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length || 1} className="px-6 py-10 text-center text-[#231F20]/50">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-[#F4F7FE] transition">
                {visibleColumns.map((column) => (
                  <td key={column.key} className={cn("px-6 py-4 text-[#231F20]/70", column.className)}>
                    {column.render ? column.render(row) : String(column.value(row) ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openFilterColumn && (
        <FilterPanel
          columnLabel={openFilterColumn.label}
          options={filterOptionsFor(openFilterColumn.key)}
          selected={filters.get(openFilterColumn.key) ?? new Set()}
          onApply={(values) => {
            setFilters((prev) => {
              const next = new Map(prev);
              next.set(openFilterColumn.key, values);
              return next;
            });
          }}
          onClear={() => {
            setFilters((prev) => {
              const next = new Map(prev);
              next.delete(openFilterColumn.key);
              return next;
            });
          }}
          onClose={() => setOpenFilterKey(null)}
        />
      )}

      {settingsOpen && (
        <CustomColumnModal
          columns={columnOrder.map((key) => columnsByKey.get(key)).filter((c): c is DataTableColumn<T> => !!c)}
          hiddenKeys={hiddenKeys}
          onCancel={() => setSettingsOpen(false)}
          onSave={(order, hidden) => {
            setColumnOrder(order);
            setHiddenKeys(hidden);
            saveLayout(tableId, { order, hidden: [...hidden] });
            setSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
}
