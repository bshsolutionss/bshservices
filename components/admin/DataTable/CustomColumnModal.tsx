"use client";

import { useEffect, useState } from "react";
import { GripVertical, Trash2, Plus, X } from "lucide-react";

interface ColumnMeta {
  key: string;
  label: string;
}

interface CustomColumnModalProps {
  /** All columns, in the currently-applied display order (visible ones first, matching columnOrder). */
  columns: ColumnMeta[];
  hiddenKeys: Set<string>;
  onCancel: () => void;
  onSave: (order: string[], hidden: Set<string>) => void;
}

/**
 * "Setting" → column visibility + order editor. Two lists — Displayed
 * (drag to reorder, trash to hide) and Not Shown (click + to bring back) —
 * staged locally and only committed on Ok, same pattern as FilterPanel's
 * Apply/Clear.
 */
export default function CustomColumnModal({ columns, hiddenKeys, onCancel, onSave }: CustomColumnModalProps) {
  const [order, setOrder] = useState<string[]>(columns.map((c) => c.key));
  const [hidden, setHidden] = useState<Set<string>>(new Set(hiddenKeys));
  const [dragKey, setDragKey] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const byKey = new Map(columns.map((c) => [c.key, c]));
  const displayed = order.filter((key) => !hidden.has(key));
  const notShown = order.filter((key) => hidden.has(key));

  const hide = (key: string) => {
    // Always leave at least one column visible — an empty table is never useful.
    if (displayed.length <= 1) return;
    setHidden((prev) => new Set(prev).add(key));
  };

  const restore = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const reorder = (targetKey: string) => {
    if (!dragKey || dragKey === targetKey) return;
    setOrder((prev) => {
      const next = prev.filter((k) => k !== dragKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, dragKey);
      return next;
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A14A5]/10">
            <h2 className="text-lg font-bold text-[#231F20]">Custom Column</h2>
            <button type="button" onClick={onCancel} aria-label="Close" className="p-1 text-[#231F20]/40 hover:text-[#231F20]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-2 gap-6 overflow-y-auto">
            <div>
              <p className="text-sm font-semibold text-[#231F20]/70 mb-3">Displayed (drag and drop to sort)</p>
              <div className="space-y-1.5 min-h-[4rem] rounded-xl border border-dashed border-[#1A14A5]/15 p-2">
                {displayed.map((key) => {
                  const col = byKey.get(key);
                  if (!col) return null;
                  return (
                    <div
                      key={key}
                      draggable
                      onDragStart={() => setDragKey(key)}
                      onDragEnd={() => setDragKey(null)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        reorder(key);
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#EAF0FF] text-[#231F20] text-sm font-medium cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-4 h-4 text-[#1A14A5]/50 shrink-0" />
                      <span className="flex-1 truncate">{col.label}</span>
                      <button
                        type="button"
                        onClick={() => hide(key)}
                        aria-label={`Hide ${col.label}`}
                        className="p-1 text-[#231F20]/40 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#231F20]/70 mb-3">Not Shown</p>
              <div className="space-y-1.5 min-h-[4rem] rounded-xl border border-dashed border-[#1A14A5]/15 p-2">
                {notShown.length === 0 && (
                  <p className="text-xs text-[#231F20]/40 text-center py-4">Nothing hidden</p>
                )}
                {notShown.map((key) => {
                  const col = byKey.get(key);
                  if (!col) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#F4F7FE] text-[#231F20]/60 text-sm font-medium"
                    >
                      <span className="flex-1 truncate">{col.label}</span>
                      <button
                        type="button"
                        onClick={() => restore(key)}
                        aria-label={`Show ${col.label}`}
                        className="p-1 text-[#231F20]/40 hover:text-[#1A14A5] shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#1A14A5]/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-[#1A14A5]/15 text-[#231F20]/70 hover:bg-[#F4F7FE] text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(order, hidden)}
              className="px-5 py-2.5 rounded-xl bg-[#1A14A5] hover:bg-[#0e0a7a] text-white text-sm font-semibold transition"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
