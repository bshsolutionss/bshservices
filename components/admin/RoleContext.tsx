"use client";

import { createContext, useContext } from "react";
import { canView, canWrite, restrictionReason, ROLE_LABELS, type ModuleKey, type Role } from "@/lib/permissions";

const RoleContext = createContext<Role>("admin");

export function RoleProvider({ role, children }: { role: Role; children: React.ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

/** The signed-in person's role plus helpers for showing only the actions they can use. */
export function useRole() {
  const role = useContext(RoleContext);
  return {
    role,
    roleLabel: ROLE_LABELS[role],
    canView: (module: ModuleKey) => canView(role, module),
    canWrite: (module: ModuleKey) => canWrite(role, module),
    reason: (module: ModuleKey, action: "view" | "write" = "write") => restrictionReason(role, module, action),
  };
}

/**
 * Shows its children when the person may change `module`. Otherwise shows the
 * same control disabled with the reason on hover, so a restricted action is
 * understood rather than mysteriously missing.
 */
export function WriteGate({
  module,
  children,
  hideWhenBlocked = false,
}: {
  module: ModuleKey;
  children: React.ReactNode;
  /** Remove the control entirely instead of showing it disabled. */
  hideWhenBlocked?: boolean;
}) {
  const { canWrite: allowed, reason } = useRole();
  if (allowed(module)) return <>{children}</>;
  if (hideWhenBlocked) return null;
  return (
    <span title={reason(module, "write")} className="inline-flex cursor-not-allowed opacity-50">
      <span className="pointer-events-none" aria-disabled="true" inert>
        {children}
      </span>
    </span>
  );
}
