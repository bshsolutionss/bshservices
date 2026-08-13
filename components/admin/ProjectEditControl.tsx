"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
  PROJECT_SERVICE_CATEGORIES,
  type ProjectStage,
  type ProjectServiceCategory,
} from "@/lib/projects";

interface ProjectEditControlProps {
  projectId: string;
  initialStage: ProjectStage;
  initialBudget: number | null;
  initialStartDate: string | null;
  initialDueDate: string | null;
  initialServiceCategory: ProjectServiceCategory | null;
  initialDescription: string | null;
  initialArchived: boolean;
  taskCount?: number;
}

export default function ProjectEditControl({
  projectId,
  initialStage,
  initialBudget,
  initialStartDate,
  initialDueDate,
  initialServiceCategory,
  initialDescription,
  initialArchived,
  taskCount = 0,
}: ProjectEditControlProps) {
  const router = useRouter();
  const [stage, setStage] = useState<ProjectStage>(initialStage);
  const [budget, setBudget] = useState(initialBudget !== null ? String(initialBudget) : "");
  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [serviceCategory, setServiceCategory] = useState<ProjectServiceCategory | "">(initialServiceCategory ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage,
          budget: budget === "" ? null : Number(budget),
          start_date: startDate || null,
          due_date: dueDate || null,
          service_category: serviceCategory || null,
          description: description || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveToggle = async () => {
    setArchiving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !initialArchived }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setError("Failed to update archive status.");
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    const taskWarning = taskCount > 0 ? ` This will also delete its ${taskCount} task${taskCount === 1 ? "" : "s"}.` : "";
    if (!confirm(`Delete this project permanently?${taskWarning} This cannot be undone.`)) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      router.push("/admin/projects");
      router.refresh();
    } catch {
      setError("Failed to delete project.");
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#231F20]">Project Status</h2>
        {initialArchived && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Archived</span>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Service</label>
        <select
          value={serviceCategory}
          onChange={(e) => setServiceCategory(e.target.value as ProjectServiceCategory)}
          className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
        >
          <option value="">Not set</option>
          {PROJECT_SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Stage</label>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as ProjectStage)}
          className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
        >
          {PROJECT_STAGES.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Amount</label>
        <Input type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Due Date</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Project scope, notes..."
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Saving..." : "Save"}
        </Button>
        {saved && <span className="text-sm text-green-600">✅ Saved</span>}
      </div>
      {error && <p className="text-sm text-red-600">❌ {error}</p>}

      <div className="pt-3 border-t border-[#1A14A5]/10 space-y-2">
        <Button
          onClick={handleArchiveToggle}
          disabled={archiving}
          variant="outline"
          className="w-full rounded-xl border-[#1A14A5]/20 text-[#1A14A5]"
        >
          {archiving ? "Updating..." : initialArchived ? "Unarchive Project" : "Archive Project"}
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleting}
          variant="outline"
          className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
        >
          {deleting ? "Deleting..." : "Delete Project"}
        </Button>
      </div>
    </div>
  );
}
