"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** Web Push requires the VAPID key as a raw Uint8Array, but env vars can only carry strings. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "checking" | "unsupported" | "subscribed" | "unsubscribed" | "denied";

/**
 * Sidebar toggle for opting an admin staff member's device into push
 * notifications (new lead / new booking alerts, sent via lib/push.ts).
 * Admin-only, opt-in per device — there's no per-user account system here,
 * just "this browser is or isn't subscribed".
 */
export default function PushNotificationToggle({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (!cancelled) setStatus(existing ? "subscribed" : "unsubscribed");
      } catch {
        if (!cancelled) setStatus("unsupported");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    if (!VAPID_PUBLIC_KEY) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "unsubscribed");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = subscription.toJSON();
      await fetch("/api/admin/push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      setStatus("subscribed");
    } catch (err) {
      console.error("Failed to enable notifications:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/admin/push/subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch (err) {
      console.error("Failed to disable notifications:", err);
    } finally {
      setBusy(false);
    }
  };

  if (status === "checking" || status === "unsupported") return null;

  if (status === "denied") {
    return (
      <p className={cn("px-3 py-2 text-xs text-white/40 leading-snug", className)}>
        Notifications blocked — enable them in your browser&apos;s site settings.
      </p>
    );
  }

  const subscribed = status === "subscribed";

  return (
    <button
      type="button"
      onClick={subscribed ? handleDisable : handleEnable}
      disabled={busy}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-50",
        className
      )}
    >
      {subscribed ? <BellOff className="w-[18px] h-[18px] shrink-0" /> : <Bell className="w-[18px] h-[18px] shrink-0" />}
      {busy ? "Working..." : subscribed ? "Disable Notifications" : "Enable Notifications"}
    </button>
  );
}
