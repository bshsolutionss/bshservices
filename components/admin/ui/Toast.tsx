"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

const ToastContext = createContext<{ toast: (tone: ToastTone, message: string) => void }>({ toast: () => {} });

/** Show a message from any admin component: `const { toast } = useToast(); toast("success", "Saved.")`. */
export function useToast() {
  return useContext(ToastContext);
}

const ENTITY_BY_SEGMENT: Record<string, string> = {
  availability: "Availability",
  clients: "Client",
  communications: "Communication",
  "message-templates": "Template",
  employees: "Team member",
  expenses: "Expense",
  goals: "Goal",
  invoices: "Invoice",
  payments: "Payment",
  items: "Invoice lines",
  investments: "Investment",
  returns: "Return",
  leads: "Lead",
  "personal-projects": "Project",
  entries: "Entry",
  projects: "Project",
  tasks: "Task",
  options: "List",
  "status-labels": "Status",
  settings: "Settings",
  recurring: "Recurring items",
  duplicate: "Invoice copy",
  "retainer-invoice": "Retainer invoice",
  users: "User",
  blocks: "Time block",
  rules: "Schedule",
  portal: "Portal access",
  "task-boards": "Board",
  approvals: "Approval",
  meetings: "Meeting",
  documents: "Document",
  updates: "Progress update",
  requests: "Request",
  reviews: "Review",
  visibility: "Portal visibility",
};

/** Calls that already show their own, more specific confirmation. */
const OWN_MESSAGE = [/\/api\/admin\/messages\//, /\/clients\/[^/]+\/portal$/,/\/settings\/email$/, /\/invoices\/[^/]+\/email$/, /\/communications\/send$/, /\/recurring$/];

function describe(method: string, pathname: string): string | null {
  if (OWN_MESSAGE.some((re) => re.test(pathname))) return null;
  const segments = pathname.replace(/^\/api\/admin\//, "").split("/").filter(Boolean);
  // The most specific named segment wins (…/investments/ID/returns -> "Return").
  const named = [...segments].reverse().find((s) => ENTITY_BY_SEGMENT[s]);
  const entity = named ? ENTITY_BY_SEGMENT[named] : "Changes";
  if (method === "DELETE") return `${entity} deleted.`;
  if (method === "POST") return segments.length > 1 && /duplicate|retainer-invoice/.test(pathname) ? `${entity} created.` : `${entity} ${named === "settings" ? "saved" : "created"}.`;
  return `${entity === "Changes" ? "Changes" : entity} saved.`;
}

/**
 * Feedback for every action. Wraps the browser's fetch for /api/admin writes so
 * that EVERY create / save / delete in the panel confirms itself ("Project
 * saved.") or explains a failure - without each form having to remember to.
 * Validation errors (400-level, which forms show beside the field) are not
 * repeated here; permission and server problems are.
 */
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setItems((current) => [...current.slice(-3), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss]
  );

  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      let pathname = "";
      try {
        const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        pathname = new URL(raw, window.location.origin).pathname;
      } catch {
        /* not a URL we can read - pass through */
      }
      const tracked = method !== "GET" && method !== "HEAD" && pathname.startsWith("/api/admin/");

      let response: Response;
      try {
        response = await original(input, init);
      } catch (err) {
        if (tracked) toast("error", "Couldn't reach the server. Check your connection and try again - what you typed is still here.");
        throw err;
      }

      if (tracked) {
        if (response.ok) {
          const message = describe(method, pathname);
          if (message) toast("success", message);
        } else if (response.status === 401) {
          toast("error", "Your session has expired. Sign in again - then repeat this action.");
        } else if (response.status === 403) {
          const body = await response.clone().json().catch(() => ({}));
          toast("error", body.error || "You don't have permission to do that.");
        } else if (response.status >= 500) {
          toast("error", "Something went wrong on our side. Your entries are kept - please try again.");
        }
      }
      return response;
    };
    return () => {
      window.fetch = original;
    };
  }, [toast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((item) => {
          const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "error" ? XCircle : Info;
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg",
                item.tone === "success" && "border-emerald-200",
                item.tone === "error" && "border-red-200",
                item.tone === "info" && "border-[#1A14A5]/15"
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  item.tone === "success" && "text-emerald-600",
                  item.tone === "error" && "text-red-600",
                  item.tone === "info" && "text-[#1A14A5]"
                )}
              />
              <p className="min-w-0 flex-1 font-medium text-[#231F20]">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss message"
                className="text-[#231F20]/35 hover:text-[#231F20]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
