"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, KeyRound, Power } from "lucide-react";
import { Alert, Badge, SectionCard, TextField, btnPrimary, btnSecondary, btnDangerOutline } from "@/components/admin/ui";

interface Props {
  clientId: string;
  defaultEmail: string;
  defaultName: string;
  portalUrl: string;
  user: {
    email: string;
    name: string | null;
    active: boolean;
    lastSignIn: string | null;
    checklistDone: number;
    checklistTotal: number;
  } | null;
}

interface Result {
  tone: "success" | "warning" | "error";
  text: string;
  password?: string;
}

export default function PortalAccessCard({ clientId, defaultEmail, defaultName, portalUrl, user }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function run(action: "invite" | "resend" | "disable" | "enable") {
    setBusy(action);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email, name: defaultName }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setResult({ tone: "error", text: json?.error ?? "Something went wrong." });
        return;
      }
      if (action === "invite" || action === "resend") {
        setResult(
          json.emailSent
            ? { tone: "success", text: `Login details emailed to ${json.email}.` }
            : { tone: "warning", text: `Email could not be sent (${json.emailError}). Share these login details yourself - this password is shown only once.`, password: json.password }
        );
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(`${portalUrl}/login`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <SectionCard
      title="Client portal"
      subtitle="Lets this client follow projects, invoices and messages on their own."
      action={user && <Badge label={user.active ? "Active" : "Disabled"} colors={user.active ? { bg: "#D1FAE5", text: "#065F46" } : { bg: "#FEE2E2", text: "#991B1B" }} />}
    >
      {!user ? (
        <div className="space-y-3">
          <TextField
            id="portal-email"
            label="Client's login email"
            type="email"
            value={email}
            onChange={setEmail}
            hint="We email them a temporary password. Use the client's own address, not a team member's."
            required
          />
          <button onClick={() => run("invite")} disabled={busy !== null || !email.trim()} className={btnPrimary}>
            {busy === "invite" ? "Creating login..." : "Give portal access"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-[#231F20]/50">Signs in as</dt>
              <dd className="break-all font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#231F20]/50">Last sign-in</dt>
              <dd className="font-medium">{user.lastSignIn ? new Date(user.lastSignIn).toLocaleString("en-GB") : "Never"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#231F20]/50">Welcome checklist</dt>
              <dd className="font-medium">
                {user.checklistDone} of {user.checklistTotal} done
              </dd>
            </div>
          </dl>
          <div className="flex items-center gap-2 rounded-xl bg-[#F4F7FE] px-3 py-2 text-xs">
            <code className="min-w-0 flex-1 truncate">{portalUrl}/login</code>
            <button onClick={copyAddress} className="inline-flex items-center gap-1 font-semibold text-[#1A14A5]">
              <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
            </button>
            <a href={`${portalUrl}/login`} target="_blank" rel="noopener noreferrer" aria-label="Open portal" className="text-[#1A14A5]">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => run("resend")} disabled={busy !== null} className={btnSecondary}>
              <KeyRound className="h-4 w-4" /> {busy === "resend" ? "Sending..." : "Resend invite (new password)"}
            </button>
            <button onClick={() => run(user.active ? "disable" : "enable")} disabled={busy !== null} className={user.active ? btnDangerOutline : btnSecondary}>
              <Power className="h-4 w-4" /> {user.active ? "Disable access" : "Enable access"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="mt-4">
          <Alert tone={result.tone}>
            {result.text}
            {result.password && (
              <span className="mt-1 block font-mono text-sm font-bold">{result.password}</span>
            )}
          </Alert>
        </div>
      )}
    </SectionCard>
  );
}
