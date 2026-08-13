"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAY_NAMES, type AvailabilityRule, type AvailabilityBlock } from "@/lib/availability";

interface ScheduleRow {
  day_of_week: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

function buildInitialSchedule(rules: AvailabilityRule[]): ScheduleRow[] {
  return DAY_NAMES.map((_, day) => {
    const existing = rules.find((r) => r.day_of_week === day);
    return {
      day_of_week: day,
      is_active: Boolean(existing),
      start_time: existing?.start_time?.slice(0, 5) ?? "09:00",
      end_time: existing?.end_time?.slice(0, 5) ?? "17:00",
      slot_duration_minutes: existing?.slot_duration_minutes ?? 30,
    };
  });
}

interface AvailabilityManagerProps {
  initialRules: AvailabilityRule[];
  initialBlocks: AvailabilityBlock[];
}

export default function AvailabilityManager({ initialRules, initialBlocks }: AvailabilityManagerProps) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleRow[]>(buildInitialSchedule(initialRules));
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [blocks, setBlocks] = useState(initialBlocks);
  const [blockDate, setBlockDate] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  const updateRow = (day: number, patch: Partial<ScheduleRow>) => {
    setSchedule((prev) => prev.map((row) => (row.day_of_week === day ? { ...row, ...patch } : row)));
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    setScheduleSaved(false);
    setScheduleError(null);

    try {
      const res = await fetch("/api/admin/availability/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: schedule }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to save.");
      setScheduleSaved(true);
      router.refresh();
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : "Failed to save schedule.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBlock(true);
    setBlockError(null);

    try {
      const res = await fetch("/api/admin/availability/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block_date: blockDate,
          start_time: blockStart || undefined,
          end_time: blockEnd || undefined,
          reason: blockReason || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to add block.");

      setBlockDate("");
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
      router.refresh();
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : "Failed to add block.");
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`/api/admin/availability/blocks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setBlocks(initialBlocks); // revert on failure
    }
  };

  return (
    <div className="space-y-8">
      {/* Weekly schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
        <h2 className="font-bold text-[#231F20] mb-1">Weekly Schedule</h2>
        <p className="text-sm text-[#231F20]/60 mb-5">
          Set which days you&apos;re open for consultations, and the time range + slot length for each.
        </p>

        <div className="space-y-3">
          {schedule.map((row) => (
            <div
              key={row.day_of_week}
              className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[#F4F7FE]"
            >
              <label className="flex items-center gap-2 w-32 shrink-0">
                <input
                  type="checkbox"
                  checked={row.is_active}
                  onChange={(e) => updateRow(row.day_of_week, { is_active: e.target.checked })}
                  className="accent-[#1A14A5] w-4 h-4"
                />
                <span className="font-medium text-[#231F20] text-sm">{DAY_NAMES[row.day_of_week]}</span>
              </label>

              <Input
                type="time"
                value={row.start_time}
                disabled={!row.is_active}
                onChange={(e) => updateRow(row.day_of_week, { start_time: e.target.value })}
                className="w-32 bg-white"
              />
              <span className="text-[#231F20]/40 text-sm">to</span>
              <Input
                type="time"
                value={row.end_time}
                disabled={!row.is_active}
                onChange={(e) => updateRow(row.day_of_week, { end_time: e.target.value })}
                className="w-32 bg-white"
              />

              <select
                value={row.slot_duration_minutes}
                disabled={!row.is_active}
                onChange={(e) => updateRow(row.day_of_week, { slot_duration_minutes: Number(e.target.value) })}
                className="text-sm rounded-lg border border-[#1A14A5]/20 px-2.5 py-2 bg-white disabled:opacity-50"
              >
                <option value={15}>15 min slots</option>
                <option value={30}>30 min slots</option>
                <option value={60}>60 min slots</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <Button
            onClick={handleSaveSchedule}
            disabled={savingSchedule}
            className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl"
          >
            {savingSchedule ? "Saving..." : "Save Schedule"}
          </Button>
          {scheduleSaved && <span className="text-sm text-green-600">✅ Saved</span>}
          {scheduleError && <span className="text-sm text-red-600">❌ {scheduleError}</span>}
        </div>
      </div>

      {/* Date blocks */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
        <h2 className="font-bold text-[#231F20] mb-1">Blocked Dates</h2>
        <p className="text-sm text-[#231F20]/60 mb-5">
          Close specific dates entirely (holidays), or block part of a day. Leave times blank to block the whole day.
        </p>

        <form onSubmit={handleAddBlock} className="flex flex-wrap items-end gap-2 mb-6">
          <div>
            <label className="text-xs text-[#231F20]/60 block mb-1">Date</label>
            <Input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} required className="w-40" />
          </div>
          <div>
            <label className="text-xs text-[#231F20]/60 block mb-1">Start (optional)</label>
            <Input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} className="w-32" />
          </div>
          <div>
            <label className="text-xs text-[#231F20]/60 block mb-1">End (optional)</label>
            <Input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} className="w-32" />
          </div>
          <Input
            placeholder="Reason (optional)"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="flex-1 min-w-[160px]"
          />
          <Button type="submit" disabled={savingBlock} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
            {savingBlock ? "Adding..." : "Add Block"}
          </Button>
        </form>
        {blockError && <p className="text-sm text-red-600 mb-4">❌ {blockError}</p>}

        {blocks.length === 0 ? (
          <p className="text-sm text-[#231F20]/50">No upcoming blocked dates.</p>
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">
            {blocks.map((block) => (
              <li key={block.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#231F20] text-sm">
                    {new Date(block.block_date + "T00:00:00Z").toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                    {block.start_time && block.end_time && (
                      <span className="text-[#231F20]/50 font-normal"> &middot; {block.start_time.slice(0, 5)}–{block.end_time.slice(0, 5)}</span>
                    )}
                    {!block.start_time && <span className="text-[#231F20]/50 font-normal"> &middot; Whole day</span>}
                  </p>
                  {block.reason && <p className="text-xs text-[#231F20]/50">{block.reason}</p>}
                </div>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
