import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, Serwist, type PrecacheEntry, type RuntimeCaching } from "serwist";

// serwist@9 doesn't type `self.__SW_MANIFEST` on SerwistGlobalConfig — the
// webpack plugin (InjectManifest) injects it at build time, so we declare it
// ourselves. This augments the ambient `WorkerGlobalScope` from
// @types/serviceworker; it doesn't touch the DOM `self` used elsewhere in
// the app since `declare const self` below only shadows it within this file.
declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// The admin panel (/admin/**) is authenticated and shows live CRM data —
// leads, clients, invoices, payments. defaultCache's generic rules would
// otherwise NetworkFirst-cache admin page HTML and /api/* GET responses into
// Cache Storage, where they'd persist after logout and be readable via
// DevTools on a shared machine. These two NetworkOnly rules are matched
// first (Serwist tries runtimeCaching entries in array order, first match
// wins) so nothing under /admin or /api is ever written to a cache — every
// request there always goes straight to the network.
const noStoreForPrivateRoutes: RuntimeCaching[] = [
  {
    matcher: ({ url }) => url.pathname.startsWith("/admin"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => url.pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...noStoreForPrivateRoutes, ...defaultCache],
});

serwist.addEventListeners();

// ─── Web Push (admin panel "new lead / new booking" alerts) ───
// Independent of Serwist's caching setup — just the two standard native
// service-worker events. Payload shape is `lib/push.ts`'s `PushPayload`
// ({ title, body, url? }), sent as JSON.

interface AdminPushPayload {
  title?: string;
  body?: string;
  url?: string;
}

self.addEventListener("push", (event) => {
  let data: AdminPushPayload = {};
  try {
    data = event.data ? (event.data.json() as AdminPushPayload) : {};
  } catch {
    data = { body: event.data?.text() };
  }

  const title = data.title || "BSH Solutions";
  const url = data.url || "/admin";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      const existing = clientsList.find((client) => client.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
