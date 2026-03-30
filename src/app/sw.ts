/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const customCache: RuntimeCaching[] = [
  {
    matcher: ({ request, url }) => {
      const isDashboard = url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/');
      const isApi = url.pathname.startsWith('/api/');
      return isDashboard || isApi;
    },
    handler: new StaleWhileRevalidate({
      cacheName: 'dashboard-swr-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        }),
      ],
    }),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customCache,
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "GymTracker";
    const options = {
      body: data.body || "New update!",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: data.url ? { url: data.url } : { url: "/" },
      actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error parsing push event data:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if possible
      for (const client of clientList) {
        if (client.url === new URL(urlToOpen, self.location.origin).href && "focus" in client) {
          return (client as WindowClient).focus();
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
