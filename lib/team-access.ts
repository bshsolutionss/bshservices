/**
 * What a team member can see and do in their own /team area.
 *
 * Team members start with NO access: they always see their own tasks, their
 * assigned projects and their own pay. Everything else is ticked per person
 * when they are added (or later on their profile). Money, billing and settings
 * stay owner-only no matter what is ticked here.
 */

export type ProgressAccess = "none" | "internal" | "client";
export type LeadsAccess = "none" | "view" | "edit";
export type FinancialAccess = "hidden" | "visible";
export type ClientsAccess = "none" | "view";
export type FilesAccess = "none" | "view" | "upload" | "share";
export type MeetingsAccess = "none" | "view" | "create";
export type VisibilityAccess = "assigned" | "all";

export interface TeamAccess {
  progress: ProgressAccess;
  leads: LeadsAccess;
  financials: FinancialAccess;
  clients: ClientsAccess;
  files: FilesAccess;
  meetings: MeetingsAccess;
  visibility: VisibilityAccess;
}

export const NO_ACCESS: TeamAccess = {
  progress: "none",
  leads: "none",
  financials: "hidden",
  clients: "none",
  files: "none",
  meetings: "none",
  visibility: "assigned",
};

interface FieldDef {
  key: keyof TeamAccess;
  label: string;
  description: string;
  options: { value: string; label: string }[];
}

export const ACCESS_FIELDS: FieldDef[] = [
  {
    key: "progress",
    label: "Progress updates",
    description: "Post updates on the projects they're assigned to. \"Internal only\" means anything client-facing needs your approval first.",
    options: [
      { value: "none", label: "No access" },
      { value: "internal", label: "Internal only" },
      { value: "client", label: "Can post to the client" },
    ],
  },
  {
    key: "leads",
    label: "Leads",
    description: "Your pipeline is shared - anything they change here shows up on your leads board straight away.",
    options: [
      { value: "none", label: "No access" },
      { value: "view", label: "View only" },
      { value: "edit", label: "View and update" },
    ],
  },
  {
    key: "financials",
    label: "Financial figures",
    description: "Deal values on other people's leads, client project values and client totals. They always see their own leads' values and their own pay.",
    options: [
      { value: "hidden", label: "Hidden" },
      { value: "visible", label: "Visible" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    description: "A Clients page listing the clients of the projects they can see (set by Project visibility below).",
    options: [
      { value: "none", label: "No access" },
      { value: "view", label: "View" },
    ],
  },
  {
    key: "files",
    label: "Files & deliverables",
    description: "Uploads land on the project. Sharing with the client publishes them to the client portal.",
    options: [
      { value: "none", label: "No access" },
      { value: "view", label: "View" },
      { value: "upload", label: "View and upload" },
      { value: "share", label: "Upload and share with client" },
    ],
  },
  {
    key: "meetings",
    label: "Meetings",
    description: "Meetings with the clients of projects they can see. Creating one also notifies the client.",
    options: [
      { value: "none", label: "No access" },
      { value: "view", label: "View" },
      { value: "create", label: "View and create" },
    ],
  },
  {
    key: "visibility",
    label: "Project visibility",
    description: "By default they only see projects you've assigned them to on the project's Team card.",
    options: [
      { value: "assigned", label: "Assigned projects only" },
      { value: "all", label: "All client projects" },
    ],
  },
];

export const ACCESS_PRESETS: { label: string; access: TeamAccess }[] = [
  {
    label: "Project Manager",
    access: { progress: "client", leads: "view", financials: "hidden", clients: "view", files: "share", meetings: "create", visibility: "all" },
  },
  {
    label: "Salesperson",
    access: { progress: "none", leads: "edit", financials: "visible", clients: "view", files: "none", meetings: "create", visibility: "assigned" },
  },
  {
    label: "Designer",
    access: { progress: "internal", leads: "none", financials: "hidden", clients: "none", files: "upload", meetings: "none", visibility: "assigned" },
  },
  {
    label: "Read-only collaborator",
    access: { progress: "none", leads: "view", financials: "hidden", clients: "view", files: "view", meetings: "view", visibility: "assigned" },
  },
  { label: "Clear all", access: NO_ACCESS },
];

/** Always returns a complete, valid object - unknown keys/values fall back to "no access". */
export function normalizeAccess(input: unknown): TeamAccess {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: TeamAccess = { ...NO_ACCESS };
  for (const field of ACCESS_FIELDS) {
    const value = raw[field.key];
    if (typeof value === "string" && field.options.some((o) => o.value === value)) {
      (out as unknown as Record<string, string>)[field.key] = value;
    }
  }
  return out;
}

/** One line for the admin: what this person can do beyond the basics. */
export function describeAccess(access: TeamAccess): string {
  const parts: string[] = [];
  for (const field of ACCESS_FIELDS) {
    const value = access[field.key];
    if (value === NO_ACCESS[field.key]) continue;
    parts.push(`${field.label}: ${field.options.find((o) => o.value === value)?.label ?? value}`);
  }
  return parts.length ? parts.join(" · ") : "No extra access - tasks, assigned projects and own pay only.";
}

export const JOB_TITLES = ["Developer", "Designer", "Project Manager", "Salesperson", "Marketer", "Content Writer", "QA Tester", "Support", "Editor", "Other"];
