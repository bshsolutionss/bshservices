import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Invoice, InvoiceBalance } from "@/lib/invoices";
import type { Project } from "@/lib/projects";

/**
 * Read helpers for the portal. Every function takes the clientId from the
 * signed-in session (never from the request) and filters on it.
 */

export interface PortalCounts {
  unreadMessages: number;
  pendingApprovals: number;
}

export async function getPortalCounts(clientId: string): Promise<PortalCounts> {
  const service = createServiceRoleClient();
  const { data: convs } = await service.from("conversations").select("id").eq("client_id", clientId);
  const convIds = (convs ?? []).map((c) => c.id as string);
  const [unread, approvals] = await Promise.all([
    convIds.length
      ? service
          .from("messages")
          .select("id", { count: "exact", head: true })
          .in("conversation_id", convIds)
          .eq("sender_type", "admin")
          .is("read_at", null)
      : Promise.resolve({ count: 0 }),
    service.from("approvals").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pending"),
  ]);
  return { unreadMessages: unread.count ?? 0, pendingApprovals: approvals.count ?? 0 };
}

export async function getVisibleProjects(clientId: string): Promise<Project[]> {
  const { data } = await createServiceRoleClient()
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .eq("portal_visible", true)
    .eq("archived", false)
    .order("created_at", { ascending: false });
  return (data ?? []) as Project[];
}

export async function getClientBalances(clientId: string): Promise<InvoiceBalance[]> {
  // Drafts are still being prepared by the agency - the client only sees issued invoices.
  const { data } = await createServiceRoleClient()
    .from("invoice_balances")
    .select("*")
    .eq("client_id", clientId)
    .neq("status", "draft")
    .order("issue_date", { ascending: false });
  return (data ?? []) as InvoiceBalance[];
}

export async function getClientInvoice(clientId: string, invoiceId: string): Promise<Invoice | null> {
  const { data } = await createServiceRoleClient()
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("client_id", clientId)
    .neq("status", "draft")
    .maybeSingle();
  return (data as Invoice | null) ?? null;
}

/** Share of a project's visible tasks that are completed; falls back to the stage when it has none. */
export function projectProgress(stage: string, tasks: { status: string }[], stageProgress: number): number {
  if (stage === "completed") return 100;
  if (tasks.length === 0) return stageProgress;
  return Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100);
}
