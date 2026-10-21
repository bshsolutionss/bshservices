"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Alert,
  Badge,
  ConfirmButton,
  Modal,
  SectionCard,
  SelectField,
  TextField,
  btnGhost,
  btnPrimary,
  inputBase,
} from "@/components/admin/ui";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/permissions";

export interface UserRowView {
  id: string;
  email: string;
  role: Role;
  employee_id: string | null;
  active: boolean;
}
interface EmployeeOption {
  id: string;
  name: string;
}

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  admin: { bg: "#E8E7FB", text: "#1A14A5" },
  manager: { bg: "#DBEAFE", text: "#1E40AF" },
  employee: { bg: "#D1FAE5", text: "#065F46" },
};

function AddUserModal({ employees, onClose }: { employees: EmployeeOption[]; onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [employeeId, setEmployeeId] = useState("");
  const [createLogin, setCreateLogin] = useState(true);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!email.trim()) return setError("Enter their email address.");
    if (role === "employee" && !employeeId) return setError("Choose which team member this login belongs to.");
    if (createLogin && password.length < 8) return setError("Use a password of at least 8 characters.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          employee_id: role === "employee" ? employeeId : null,
          password: createLogin ? password : undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not add the user.");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add user"
      description="Give someone access to the panel with the right level of permission."
      size="md"
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
            {saving ? "Adding…" : "Add user"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField id="user-email" label="Email" type="email" required value={email} onChange={setEmail} autoFocus />
        <SelectField
          id="user-role"
          label="Role"
          required
          value={role}
          onChange={(v) => setRole(v as Role)}
          options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          hint={ROLE_DESCRIPTIONS[role]}
        />
        {role === "employee" && (
          <SelectField
            id="user-employee"
            label="Which team member?"
            required
            value={employeeId}
            onChange={setEmployeeId}
            options={employees.map((e) => ({ value: e.id, label: e.name }))}
            placeholder="Select…"
            hint="Their assigned tasks appear on their My work page."
          />
        )}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1A14A5]/15 px-4 py-3">
          <input
            type="checkbox"
            checked={createLogin}
            onChange={(e) => setCreateLogin(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#1A14A5]"
          />
          <span className="text-sm">
            <span className="font-semibold text-[#231F20]">Create their sign-in now</span>
            <span className="block text-xs text-[#231F20]/55">
              Untick if they already have a login (their password stays as it is).
            </span>
          </span>
        </label>
        {createLogin && (
          <TextField
            id="user-password"
            label="Temporary password"
            required
            value={password}
            onChange={setPassword}
            hint="At least 8 characters. Share it with them privately and ask them to keep it safe."
          />
        )}
        {error && <Alert tone="error">{error}</Alert>}
      </div>
    </Modal>
  );
}

/** Who can sign in, and what each person is allowed to do. */
export default function UsersManager({
  users,
  employees,
  implicit,
  currentEmail,
}: {
  users: UserRowView[];
  employees: EmployeeOption[];
  implicit: boolean;
  currentEmail: string | null;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const employeeName = (id: string | null) => employees.find((e) => e.id === id)?.name ?? "—";

  const patch = async (id: string, body: Record<string, unknown>) => {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const parsed = await res.json().catch(() => ({}));
    if (!res.ok) setError(parsed.error || "Could not update.");
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6">
        {implicit && (
          <Alert tone="info" title="Roles are not set up yet">
            Right now everyone who signs in is an admin. Add your first user below to switch roles on - you stay admin
            automatically.
          </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}

        <SectionCard
          title="People with access"
          subtitle={`${users.length} user${users.length === 1 ? "" : "s"}`}
          action={
            <button type="button" onClick={() => setAdding(true)} className={btnPrimary}>
              <Plus className="h-4 w-4" /> Add user
            </button>
          }
        >
          {users.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#231F20]/55">
              No users yet. Add the first one to start using roles.
            </p>
          ) : (
            <ul className="divide-y divide-[#1A14A5]/5">
              {users.map((user) => (
                <li key={user.id} className={cn("flex flex-wrap items-center gap-3 py-3", !user.active && "opacity-55")}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#231F20]">
                      {user.email}
                      {user.email.toLowerCase() === currentEmail?.toLowerCase() && (
                        <span className="ml-2 text-xs font-medium text-[#231F20]/45">(you)</span>
                      )}
                    </p>
                    {user.role === "employee" && (
                      <p className="text-xs text-[#231F20]/50">Team member: {employeeName(user.employee_id)}</p>
                    )}
                  </div>
                  <Badge label={ROLE_LABELS[user.role]} colors={ROLE_COLORS[user.role]} />
                  <select
                    value={user.role}
                    onChange={(e) => patch(user.id, { role: e.target.value, employee_id: user.employee_id })}
                    aria-label={`Role for ${user.email}`}
                    className={cn(inputBase, "w-36")}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[#231F20]/60">
                    <input
                      type="checkbox"
                      checked={user.active}
                      onChange={(e) => patch(user.id, { active: e.target.checked })}
                      className="h-4 w-4 accent-[#1A14A5]"
                    />
                    Can sign in
                  </label>
                  <ConfirmButton
                    label=""
                    display="inline"
                    icon={<Trash2 className="h-4 w-4" />}
                    title={`Remove ${user.email}?`}
                    confirmLabel="Remove access"
                    message="They can no longer open the admin panel. Their sign-in account itself is kept, and you can give them access again later."
                    onConfirm={async () => {
                      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(body.error || "Could not remove.");
                      router.refresh();
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="What each role can do">
          <dl className="grid gap-3 sm:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r} className="rounded-xl bg-[#F4F7FE] p-3">
                <dt>
                  <Badge label={ROLE_LABELS[r]} colors={ROLE_COLORS[r]} />
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-[#231F20]/65">{ROLE_DESCRIPTIONS[r]}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>
      {adding && <AddUserModal employees={employees} onClose={() => setAdding(false)} />}
    </>
  );
}
