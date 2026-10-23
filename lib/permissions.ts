/**
 * Who can open and change what. One table drives the sidebar, the page guard
 * and the API guard, so a screen is never visible to someone whose requests
 * would then be rejected (or the other way round).
 *
 * "view"  = can open the page and read.
 * "write" = can also create / edit / delete there.
 */

export type Role = "admin" | "manager" | "employee";

export type ModuleKey =
  | "dashboard"
  | "goals"
  | "leads"
  | "bookings"
  | "clients"
  | "communication"
  | "projects"
  | "tasks"
  | "personal_projects"
  | "invoices"
  | "expenses"
  | "finance"
  | "investments"
  | "team"
  | "availability"
  | "settings"
  | "users";

type Access = "none" | "view" | "write";

const MATRIX: Record<Role, Record<ModuleKey, Access>> = {
  admin: {
    dashboard: "write", goals: "write", leads: "write", bookings: "write", clients: "write", communication: "write",
    projects: "write", tasks: "write", personal_projects: "write", invoices: "write", expenses: "write", finance: "write",
    investments: "write", team: "write", availability: "write", settings: "write", users: "write",
  },
  // Runs the team and the client work; does not see company money, investments or settings.
  manager: {
    dashboard: "view", goals: "view", leads: "write", bookings: "write", clients: "write", communication: "write",
    projects: "write", tasks: "write", personal_projects: "none", invoices: "view", expenses: "none", finance: "none",
    investments: "none", team: "view", availability: "write", settings: "none", users: "none",
  },
  // Sees their own work only: their tasks and deadlines. No client, money or project-budget screens.
  employee: {
    dashboard: "view", goals: "none", leads: "none", bookings: "none", clients: "none", communication: "none",
    projects: "none", tasks: "write", personal_projects: "none", invoices: "none", expenses: "none", finance: "none",
    investments: "none", team: "none", availability: "none", settings: "none", users: "none",
  },
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Full access: money, investments, team, settings and users.",
  manager: "Runs leads, clients, projects, tasks and approvals. No access to expenses, finance, investments or settings.",
  employee: "Sees their own tasks and deadlines, and can update their progress.",
};

export const ROLES: Role[] = ["admin", "manager", "employee"];

export function accessFor(role: Role, module: ModuleKey): Access {
  return MATRIX[role][module];
}
export const canView = (role: Role, module: ModuleKey) => accessFor(role, module) !== "none";
export const canWrite = (role: Role, module: ModuleKey) => accessFor(role, module) === "write";

/** Which module a page path belongs to (null = no restriction, e.g. the login page). */
export function moduleForPath(pathname: string): ModuleKey | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/admin") return "dashboard";
  const rules: [string, ModuleKey][] = [
    ["/admin/settings/users", "users"],
    ["/admin/settings", "settings"],
    ["/admin/goals", "goals"],
    ["/admin/leads", "leads"],
    ["/admin/bookings", "bookings"],
    ["/admin/clients", "clients"],
    ["/admin/communication", "communication"],
    ["/admin/messages", "communication"],
    ["/admin/portal", "clients"],
    ["/admin/projects", "projects"],
    ["/admin/tasks", "tasks"],
    ["/admin/personal-projects", "personal_projects"],
    ["/admin/invoices", "invoices"],
    ["/admin/expenses", "expenses"],
    ["/admin/finance", "finance"],
    ["/admin/payments", "finance"],
    ["/admin/retainers", "projects"],
    ["/admin/investments", "investments"],
    ["/admin/employees", "team"],
    ["/admin/availability", "availability"],
  ];
  for (const [prefix, module] of rules) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return module;
  }
  return null;
}

/** API prefix -> module. Same idea as moduleForPath, for /api/admin/*. */
export function moduleForApi(pathname: string): ModuleKey | null {
  const rest = pathname.replace(/^\/api\/admin\/?/, "").split("/");
  const head = rest[0];
  const map: Record<string, ModuleKey> = {
    availability: "availability",
    clients: "clients",
    communications: "communication",
    messages: "communication",
    portal: "clients",
    "message-templates": "communication",
    employees: "team",
    team: "team",
    expenses: "expenses",
    goals: "goals",
    invoices: "invoices",
    payments: "finance",
    investments: "investments",
    leads: "leads",
    "lead-forms": "leads",
    "lead-stages": "leads",
    "lead-sources": "leads",
    "personal-projects": "personal_projects",
    projects: "projects",
    tasks: "tasks",
    "task-boards": "tasks",
    recurring: "invoices",
    users: "users",
    settings: "settings",
    search: "clients",
    options: "settings",
    "status-labels": "settings",
  };
  return map[head] ?? null;
}

/** Plain-words reason shown instead of a page or a disabled button the person can't use. */
export function restrictionReason(role: Role, module: ModuleKey, action: "view" | "write" = "view"): string {
  if (action === "write" && canView(role, module)) return `${ROLE_LABELS[role]}s can view this but only a manager or admin can change it.`;
  if (module === "settings" || module === "users") return "Only admins can open Settings and manage users.";
  if (role === "employee") return "This area is for managers and admins. Your tasks and deadlines are under My work.";
  return "Only admins can open this area (it contains company money or private data).";
}
