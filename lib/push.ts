import webpush from "web-push";
import { createServiceRoleClient } from "@/lib/supabase/service";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:bshsolutionss@gmail.com";

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

let vapidConfigured = false;
function ensureVapidConfigured(): void {
  if (vapidConfigured) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY env vars.");
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  /** Where app/sw.ts's notificationclick handler should navigate to. */
  url?: string;
}

/**
 * Sends a push notification to every subscribed admin device (there's no
 * per-user targeting — any staff member who opted in via the sidebar's
 * "Enable Notifications" toggle gets everything).
 *
 * Best-effort, same reliability principle as sendLeadEmails/logActivity — a
 * missed push is a minor UX gap (the lead/booking already landed via email
 * and the admin panel), never worth failing the calling request over. Dead
 * subscriptions (410 Gone / 404 Not Found, meaning the browser dropped the
 * subscription) are pruned automatically so the table doesn't accumulate
 * stale rows forever.
 */
export async function sendAdminPush(payload: PushPayload): Promise<void> {
  try {
    ensureVapidConfigured();

    const service = createServiceRoleClient();
    const { data: subs } = await service.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    const subscriptions = (subs ?? []) as PushSubscriptionRow[];
    if (subscriptions.length === 0) return;

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        )
      )
    );

    const deadIds: string[] = [];
    results.forEach((result, i) => {
      if (result.status !== "rejected") return;
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        deadIds.push(subscriptions[i].id);
      } else {
        console.error("[push] send failed:", result.reason);
      }
    });

    if (deadIds.length > 0) {
      await service.from("push_subscriptions").delete().in("id", deadIds);
    }
  } catch (err) {
    console.error("[push] sendAdminPush failed:", err);
  }
}
