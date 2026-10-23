"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, KeyRound, Power, Trash2 } from "lucide-react";
import { Alert, Badge, ConfirmButton, Modal, SectionCard, btnPrimary, btnSecondary } from "@/components/admin/ui";
import AccessFields from "@/components/admin/team/AccessFields";
import { describeAccess, type TeamAccess } from "@/lib/team-access";

interface Props {
  employeeId: string;
  /** null = this person has no login yet. */
  login: { email: string; active: boolean; mustChangePassword: boolean; access: TeamAccess } | null;
  loginUrl: string;
}

/** Their dashboard sign-in: status, what they can access, reset password, remove. */
export default function TeamAccessCard({ employeeId, login, loginUrl }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState<TeamAccess | null>(login?.access ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reset, setReset] = useState<{ password: string; emailSent: boolean } | null>(null);

  async function patch(body: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team/${employeeId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error ?? "That didn't work.");
        return null;
      }
      router.refresh();
      return json;
    } finally {
      setBusy(false);
    }
  }

  if (!login) {
    return (
      <SectionCard title="Dashboard login" subtitle="Lets this person sign in to their own team dashboard">
        <p className="text-sm text-[#231F20]/60">No login yet. Use <strong>Add team member</strong> on the Team page to create someone with a login and access.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Dashboard login"
      action={<Badge label={login.active ? (login.mustChangePassword ? "Invited" : "Active") : "Switched off"} colors={login.active ? { bg: "#D1FAE5", text: "#065F46" } : { bg: "#FEE2E2", text: "#991B1B" }} />}
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs text-[#231F20]/50">Signs in as</p>
          <p className="break-all font-medium">{login.email}</p>
          {login.mustChangePassword && <p className="mt-1 text-xs text-amber-700">Hasn&apos;t set their own password yet.</p>}
        </div>
        <div>
          <p className="text-xs text-[#231F20]/50">Access</p>
          <p className="leading-relaxed text-[#231F20]/75">{describeAccess(login.access)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btnSecondary} onClick={() => setOpen(true)}>
            Edit access
          </button>
          <ConfirmButton
            label="Reset password"
            icon={<KeyRound className="h-4 w-4" />}
            tone="primary"
            title="Issue a new temporary password?"
            message="Their current password stops working and they must choose a new one on next sign-in. The new details are emailed to them and shown to you once."
            confirmLabel="Reset password"
            onConfirm={async () => {
              const json = await patch({ action: "reset" });
              if (!json) throw new Error("Could not reset the password.");
              setReset({ password: json.password, emailSent: json.emailSent });
            }}
          />
          <button className={btnSecondary} disabled={busy} onClick={() => patch({ action: "active", active: !login.active })}>
            <Power className="h-4 w-4" /> {login.active ? "Switch off" : "Switch on"}
          </button>
        </div>
        <ConfirmButton
          display="inline"
          label="Remove login access"
          icon={<Trash2 className="mr-1 inline h-3.5 w-3.5" />}
          title="Remove their login access?"
          message="They can no longer sign in to the team dashboard. Their profile, tasks and pay history stay."
          onConfirm={async () => {
            const res = await fetch(`/api/admin/team/${employeeId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Could not remove access.");
            router.refresh();
          }}
        />
        {error && <Alert tone="error">{error}</Alert>}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit access"
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className={`${btnPrimary} ml-auto`}
              disabled={busy}
              onClick={async () => {
                if (await patch({ action: "access", access })) setOpen(false);
              }}
            >
              {busy ? "Saving..." : "Save access"}
            </button>
          </>
        }
      >
        {access && <AccessFields value={access} onChange={setAccess} />}
        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>

      <Modal open={!!reset} onClose={() => setReset(null)} title="New temporary password" size="sm" footer={<button className={`${btnPrimary} ml-auto`} onClick={() => setReset(null)}>Done</button>}>
        {reset && (
          <div className="space-y-3 text-sm">
            <Alert tone={reset.emailSent ? "success" : "warning"}>{reset.emailSent ? `Emailed to ${login.email}.` : "Email isn't connected - share this yourself. It's shown only now."}</Alert>
            <div className="flex items-center gap-2 rounded-xl bg-[#F4F7FE] px-3 py-2.5">
              <code className="flex-1 break-all font-mono">{reset.password}</code>
              <button onClick={() => navigator.clipboard.writeText(reset.password)} aria-label="Copy password" className="text-[#231F20]/50 hover:text-[#1A14A5]">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-[#231F20]/55">Login page: {loginUrl}</p>
          </div>
        )}
      </Modal>
    </SectionCard>
  );
}
