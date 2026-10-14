"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, ConfirmButton, SectionCard, btnPrimary, inputBase } from "@/components/admin/ui";
import { invalidateOptions } from "@/lib/admin/use-options";
import { OPTION_LISTS, type AppOption, type OptionListKey } from "@/lib/option-lists";

/**
 * Edit the dropdown lists used across the panel (categories, sources, types…).
 * Renaming only changes what's displayed - records that already use an item
 * keep working - and switching an item off hides it from new forms without
 * touching old data.
 */
export default function OptionListManager() {
  const router = useRouter();
  const [active, setActive] = useState<OptionListKey>(OPTION_LISTS[0].key);
  const [items, setItems] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#1A14A5");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const meta = OPTION_LISTS.find((l) => l.key === active)!;

  const load = useCallback(async (key: OptionListKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/options?list=${key}&all=1`);
      const body = await res.json().catch(() => ({}));
      setItems(res.ok ? (body.options as AppOption[]) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(active);
  }, [active, load]);

  const changed = () => {
    invalidateOptions(active);
    router.refresh();
  };

  const call = async (url: string, init: RequestInit, failure: string): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || failure);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : failure);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    if (!newLabel.trim()) return;
    const ok = await call(
      "/api/admin/options",
      { method: "POST", body: JSON.stringify({ list: active, label: newLabel, color: meta.colored ? newColor : null }) },
      "Could not add."
    );
    if (ok) {
      setNewLabel("");
      await load(active);
      changed();
    }
  };

  const patch = async (item: AppOption, body: Partial<Pick<AppOption, "label" | "color" | "active">>) => {
    setItems((current) => current.map((i) => (i.id === item.id ? { ...i, ...body } : i)));
    const ok = await call(`/api/admin/options/${item.id}`, { method: "PATCH", body: JSON.stringify(body) }, "Update failed.");
    if (ok) changed();
    else await load(active);
  };

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    const ok = await call(
      "/api/admin/options",
      { method: "PUT", body: JSON.stringify({ list: active, ids: next.map((i) => i.id) }) },
      "Could not save the order."
    );
    if (ok) changed();
    else await load(active);
  };

  const remove = async (item: AppOption) => {
    const res = await fetch(`/api/admin/options/${item.id}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Could not delete.");
    await load(active);
    changed();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-[#1A14A5]/10 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
        {OPTION_LISTS.map((list) => (
          <button
            key={list.key}
            type="button"
            onClick={() => setActive(list.key)}
            className={cn(
              "whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-semibold transition",
              active === list.key ? "bg-[#1A14A5] text-white" : "text-[#231F20]/65 hover:bg-[#F4F7FE]"
            )}
          >
            {list.label}
          </button>
        ))}
      </nav>

      <SectionCard title={meta.label} subtitle={meta.description}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder={`Add to ${meta.label.toLowerCase()}…`}
              className={cn(inputBase, "min-w-[200px] flex-1")}
            />
            {meta.colored && (
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                aria-label="Colour"
                className="h-10 w-12 cursor-pointer rounded-lg border border-[#1A14A5]/15 bg-white p-1"
              />
            )}
            <button type="button" onClick={add} disabled={busy || !newLabel.trim()} className={btnPrimary}>
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          {loading ? (
            <p className="py-6 text-center text-sm text-[#231F20]/50">Loading…</p>
          ) : items.length === 0 ? (
            <Alert tone="info">
              This list is using the built-in defaults. Add your first item above to start your own list (run migration
              0013 if adding fails).
            </Alert>
          ) : (
            <ul className="divide-y divide-[#1A14A5]/5 rounded-xl border border-[#1A14A5]/10">
              {items.map((item, index) => (
                <li key={item.id} className={cn("flex flex-wrap items-center gap-3 px-3 py-2.5", !item.active && "opacity-55")}>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || busy}
                      aria-label="Move up"
                      className="text-[#231F20]/40 hover:text-[#1A14A5] disabled:opacity-20"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1 || busy}
                      aria-label="Move down"
                      className="text-[#231F20]/40 hover:text-[#1A14A5] disabled:opacity-20"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    defaultValue={item.label}
                    onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== item.label && patch(item, { label: e.target.value })}
                    aria-label="Name"
                    className={cn(inputBase, "min-w-[160px] flex-1 border-transparent bg-transparent font-medium hover:border-[#1A14A5]/15")}
                  />
                  {meta.colored && (
                    <input
                      type="color"
                      value={item.color ?? "#4B5563"}
                      onChange={(e) => patch(item, { color: e.target.value })}
                      aria-label="Colour"
                      className="h-8 w-10 cursor-pointer rounded-lg border border-[#1A14A5]/15 bg-white p-1"
                    />
                  )}
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[#231F20]/60">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(e) => patch(item, { active: e.target.checked })}
                      className="h-4 w-4 accent-[#1A14A5]"
                    />
                    Show in forms
                  </label>
                  <ConfirmButton
                    label=""
                    display="inline"
                    icon={<Trash2 className="h-4 w-4" />}
                    title={`Delete "${item.label}"?`}
                    confirmLabel="Delete"
                    message="It disappears from the dropdown. Records that already use it keep their value. To just hide it from new forms, untick “Show in forms” instead."
                    onConfirm={() => remove(item)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
