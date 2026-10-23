"use client";

import { ShieldCheck } from "lucide-react";
import { ACCESS_FIELDS, ACCESS_PRESETS, NO_ACCESS, type TeamAccess } from "@/lib/team-access";
import { inputBase } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

interface Props {
  value: TeamAccess;
  onChange: (next: TeamAccess) => void;
}

/** The access matrix: pick a preset, then adjust each area. Used when adding a member and on their profile. */
export default function AccessFields({ value, onChange }: Props) {
  const none = ACCESS_FIELDS.every((f) => value[f.key] === NO_ACCESS[f.key]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-[#F4F7FE] px-4 py-3 text-sm text-[#231F20]/70">
        <p className="flex items-center gap-1.5 font-semibold text-[#231F20]">
          <ShieldCheck className="h-4 w-4" /> Access
        </p>
        <p className="mt-1">Team members start with no access. Everything you tick here shows up in their dashboard - money, billing and organisation settings always stay owner-only.</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Start from a preset</p>
        <div className="flex flex-wrap gap-2">
          {ACCESS_PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => onChange({ ...p.access })} className="rounded-full border border-[#1A14A5]/15 bg-white px-3 py-1.5 text-sm font-medium text-[#231F20]/80 transition hover:bg-[#F4F7FE]">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {ACCESS_FIELDS.map((f) => (
          <div key={f.key} className="grid gap-2 sm:grid-cols-[1fr_13rem] sm:items-start sm:gap-4">
            <div>
              <label htmlFor={`access-${f.key}`} className="text-sm font-semibold">
                {f.label}
              </label>
              <p className="mt-0.5 text-xs leading-relaxed text-[#231F20]/50">{f.description}</p>
            </div>
            <select
              id={`access-${f.key}`}
              value={value[f.key]}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value } as TeamAccess)}
              className={cn(inputBase, "appearance-none")}
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {none && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">No access granted. They&apos;ll see only their assigned projects and the tasks you give them.</p>
      )}
    </div>
  );
}
