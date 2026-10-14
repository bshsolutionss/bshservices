"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Target } from "lucide-react";
import {
  Alert,
  Modal,
  SelectField,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import { GOAL_METRICS, GOAL_METRIC_BY_KEY, periodLabel, type Goal, type GoalMetric, type GoalPeriodType } from "@/lib/goals";

interface GoalFormModalProps {
  /** Omit to create; pass a goal to edit it. */
  goal?: Goal;
  periodType: GoalPeriodType;
  periodKey: string;
  variant?: "solid" | "outline" | "link";
  label?: string;
}

/** Set a target for a month or a year - or edit one. Built-in metrics are measured from your real data automatically. */
export default function GoalFormModal({ goal, periodType, periodKey, variant = "solid", label }: GoalFormModalProps) {
  const router = useRouter();
  const editing = !!goal;

  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState<GoalMetric>(goal?.metric ?? "revenue");
  const [title, setTitle] = useState(goal?.title ?? "");
  const [target, setTarget] = useState(goal ? String(goal.target_value) : "");
  const [current, setCurrent] = useState(goal ? String(goal.current_value) : "0");
  const [unit, setUnit] = useState(goal?.unit ?? "");
  const [notes, setNotes] = useState(goal?.notes ?? "");
  const [spread, setSpread] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const info = GOAL_METRIC_BY_KEY[metric];
  const isCustom = metric === "custom";

  const close = () => {
    setOpen(false);
    setError(null);
    if (!editing) {
      setMetric("revenue");
      setTitle("");
      setTarget("");
      setCurrent("0");
      setUnit("");
      setNotes("");
      setSpread(false);
    }
  };

  const save = async () => {
    if (!Number.isFinite(Number(target)) || Number(target) <= 0) {
      setError("Enter a target greater than zero.");
      return;
    }
    if (isCustom && !title.trim()) {
      setError("Give the goal a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/admin/goals/${goal!.id}` : "/api/admin/goals", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing
            ? {
                title: title.trim() || info.label,
                target_value: Number(target),
                ...(isCustom ? { current_value: Number(current) || 0, unit } : {}),
                notes,
              }
            : {
                metric,
                title: title.trim() || undefined,
                period_type: periodType,
                period_key: periodKey,
                target_value: Number(target),
                unit: isCustom ? unit : undefined,
                notes: notes.trim() || undefined,
                repeat_through_year: periodType === "monthly" ? spread : undefined,
                split_into_months: periodType === "yearly" ? spread : undefined,
              }
        ),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the goal.");
      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the goal.");
    } finally {
      setSaving(false);
    }
  };

  const trigger =
    variant === "link" ? (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-[#1A14A5] hover:underline">
        {label ?? "Edit"}
      </button>
    ) : (
      <button type="button" onClick={() => setOpen(true)} className={variant === "solid" ? btnPrimary : btnSecondary}>
        {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (editing ? "Edit goal" : "Set a goal")}
      </button>
    );

  return (
    <>
      {trigger}
      <Modal
        open={open}
        onClose={close}
        title={editing ? "Edit goal" : `New goal - ${periodLabel(periodType, periodKey)}`}
        description={info.description}
        size="md"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              <Target className="h-4 w-4" />
              {saving ? "Saving…" : editing ? "Save goal" : "Set goal"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {!editing && (
            <SelectField
              id="goal-metric"
              label="What do you want to hit?"
              required
              className="sm:col-span-2"
              value={metric}
              onChange={(v) => setMetric(v as GoalMetric)}
              options={GOAL_METRICS.map((m) => ({ value: m.key, label: m.label }))}
            />
          )}
          {(isCustom || editing) && (
            <TextField
              id="goal-title"
              label="Name"
              required={isCustom}
              className="sm:col-span-2"
              value={title}
              onChange={setTitle}
              placeholder={isCustom ? "e.g. Publish 12 blog posts" : info.label}
            />
          )}
          <TextField
            id="goal-target"
            label={info.kind === "money" ? "Target (PKR)" : isCustom ? "Target" : "Target (number)"}
            type="number"
            min="0"
            step={info.kind === "money" ? "0.01" : "1"}
            required
            value={target}
            onChange={setTarget}
            autoFocus
          />
          {isCustom ? (
            <TextField id="goal-unit" label="Unit" value={unit} onChange={setUnit} placeholder="posts, calls, hours…" />
          ) : (
            <div />
          )}
          {isCustom && editing && (
            <TextField
              id="goal-current"
              label="Progress so far"
              type="number"
              min="0"
              step="1"
              className="sm:col-span-2"
              value={current}
              onChange={setCurrent}
            />
          )}
          <TextareaField id="goal-notes" label="Notes" className="sm:col-span-2" rows={2} value={notes} onChange={setNotes} />

          {!editing && periodType === "monthly" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1A14A5]/15 px-4 py-3 sm:col-span-2">
              <input type="checkbox" checked={spread} onChange={(e) => setSpread(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1A14A5]" />
              <span className="text-sm">
                <span className="font-semibold text-[#231F20]">Use the same target for the rest of the year</span>
                <span className="block text-xs text-[#231F20]/55">Creates this goal for every remaining month.</span>
              </span>
            </label>
          )}
          {!editing && periodType === "yearly" && !isCustom && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1A14A5]/15 px-4 py-3 sm:col-span-2">
              <input type="checkbox" checked={spread} onChange={(e) => setSpread(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1A14A5]" />
              <span className="text-sm">
                <span className="font-semibold text-[#231F20]">Also set monthly targets (yearly ÷ 12)</span>
                <span className="block text-xs text-[#231F20]/55">Splits this target evenly across all 12 months. Edit any month afterwards.</span>
              </span>
            </label>
          )}
        </div>
        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}
