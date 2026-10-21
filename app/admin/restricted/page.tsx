import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getAdminSession } from "@/lib/admin/session";
import { ROLE_LABELS, restrictionReason, type ModuleKey } from "@/lib/permissions";
import SignOutButton from "@/components/admin/SignOutButton";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Where someone lands when they open a screen their role can't use - explains why and what to do next. */
export default async function RestrictedPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; reason?: string }>;
}) {
  const { module, reason } = await searchParams;
  const session = await getAdminSession();

  const message = session
    ? restrictionReason(session.role, (module ?? "settings") as ModuleKey)
    : reason === "norole"
      ? "You are signed in, but this account has not been given a role yet."
      : "You need to sign in to continue.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FE] px-6">
      <div className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 text-center shadow-xl">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
          <ShieldAlert className="h-6 w-6 text-amber-600" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold text-[#231F20]">You can&apos;t open this page</h1>
          <p className="mt-2 text-sm text-[#231F20]/65">{message}</p>
          {session && (
            <p className="mt-1 text-xs text-[#231F20]/45">
              Signed in as {session.email} · {ROLE_LABELS[session.role]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          {session ? (
            <Link
              href="/admin"
              className="block rounded-xl bg-[#1A14A5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0e0a7a]"
            >
              Go to {session.role === "employee" ? "My work" : "Dashboard"}
            </Link>
          ) : (
            <p className="text-xs text-[#231F20]/55">
              Ask an admin to add your email under Settings → Users &amp; roles, then sign in again.
            </p>
          )}
          <SignOutButton variant="light" className="mx-auto w-full justify-center px-4 py-2.5" />
        </div>
      </div>
    </div>
  );
}
