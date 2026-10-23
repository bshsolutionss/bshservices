"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Copy, Mail, UserPlus } from "lucide-react";
import { Alert, Modal, TextField, TextareaField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import AccessFields from "@/components/admin/team/AccessFields";
import { JOB_TITLES, NO_ACCESS, type TeamAccess } from "@/lib/team-access";

interface Created {
  email: string;
  password: string;
  loginUrl: string;
  emailSent: boolean;
  emailError?: string;
}

/** Add a team member with a login, their access, and a temporary password shown once. */
export default function TeamMemberModal({ label = "Add team member" }: { label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("Developer");
  const [displayName, setDisplayName] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [access, setAccess] = useState<TeamAccess>(NO_ACCESS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function reset() {
    setEmail("");
    setJobTitle("Developer");
    setDisplayName("");
    setSalary("");
    setNotes("");
    setAccess(NO_ACCESS);
    setError(null);
    setCreated(null);
    setSaved(false);
  }

  function close() {
    // Closing the credentials step without ticking the box would lose the only copy of the password.
    if (created && !saved) return;
    setOpen(false);
    reset();
    router.refresh();
  }

  async function submit() {
    setError(null);
    if (!email.trim()) return setError("Enter the team member's email.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, jobTitle, displayName, monthlySalary: salary, notes, access }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not create the team member.");
      setCreated(json);
    } finally {
      setBusy(false);
    }
  }

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const row = (key: string, label: string, value: string, mono = false) => (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border border-[#1A14A5]/10 bg-[#F4F7FE] px-3 py-2.5">
        <span className={`min-w-0 flex-1 break-all text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
        <button type="button" onClick={() => copy(key, value)} aria-label={`Copy ${label}`} className="text-[#231F20]/50 hover:text-[#1A14A5]">
          {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        <UserPlus className="h-4 w-4" /> {label}
      </button>
      <Modal
        open={open}
        onClose={close}
        title={created ? "Team member created" : "Add team member"}
        size={created ? "sm" : "md"}
        footer={
          created ? (
            <button className={`${btnPrimary} w-full`} disabled={!saved} onClick={close}>
              Done
            </button>
          ) : (
            <>
              <button className={btnSecondary} onClick={close}>
                Cancel
              </button>
              <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={submit}>
                {busy ? "Creating..." : "Add member"}
              </button>
            </>
          )
        }
      >
        {created ? (
          <div className="space-y-4">
            {created.emailSent ? (
              <Alert tone="success">
                <span className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" /> These login details were emailed to <strong>{created.email}</strong>. They can sign in right away, and you can copy them below too.
                </span>
              </Alert>
            ) : (
              <Alert tone="warning">Email isn&apos;t connected{created.emailError ? ` (${created.emailError})` : ""}, so nothing was sent. Share these details with them yourself - the password is shown only now.</Alert>
            )}
            {row("url", "Login URL", created.loginUrl)}
            {row("email", "Email", created.email)}
            {row("password", "Temporary password", created.password, true)}
            <p className="rounded-xl bg-[#F4F7FE] px-4 py-3 text-sm text-[#231F20]/65">
              This password is temporary. The first time they sign in they&apos;ll be asked to set their own before they can use the dashboard - after that, nobody else knows it.
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="h-4 w-4 accent-[#1A14A5]" />
              I&apos;ve saved or shared these credentials securely.
            </label>
          </div>
        ) : (
          <div className="space-y-5">
            <TextField id="tm-email" label="Email" type="email" required value={email} onChange={setEmail} placeholder="member@example.com" autoFocus />
            <div className="flex items-start gap-2 rounded-xl bg-[#EEF4FF] px-4 py-3 text-sm text-[#1E3A8A]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />A secure temporary password is generated automatically and shown to you once after the member is created. They&apos;ll be asked to set their own password the first time they sign in.
            </div>
            <TextField id="tm-role" label="Role" required value={jobTitle} onChange={setJobTitle} suggestions={JOB_TITLES} hint="Their job title. Pick one or type your own." />
            <TextField id="tm-name" label="Display name" value={displayName} onChange={setDisplayName} placeholder="John Doe" hint="Defaults to a name made from their email." />
            <TextField id="tm-salary" label="Monthly salary" type="number" min="0" step="0.01" value={salary} onChange={setSalary} placeholder="5000.00" hint="For team members on a monthly salary instead of project-based pay." />
            <TextareaField id="tm-notes" label="Notes" rows={3} value={notes} onChange={setNotes} placeholder="Any additional information..." />
            <hr className="border-[#1A14A5]/10" />
            <AccessFields value={access} onChange={setAccess} />
            {error && <Alert tone="error">{error}</Alert>}
          </div>
        )}
      </Modal>
    </>
  );
}
