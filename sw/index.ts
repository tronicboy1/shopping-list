import { isSupported } from "firebase/messaging";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { firebaseApp } from "./firebase";

declare var self: ServiceWorkerGlobalScope;

const addMultipleResourcesToCache = (links: string[]) => caches.open("v1").then((cache) => cache.addAll(links));

self.addEventListener("install", (event) => {
  console.log("SW: Installing. Mode: " + process.env.NODE_ENV, event);
  if (process.env.NODE_ENV === "production") {
    event.waitUntil(
      caches.delete("v1").then(() =>
        Promise.race([
          fetch("/public-manifest.json")
            .then((result) => result.json())
            .then((data: { [key: string]: string }) => {
              const resourcesToCache = Object.keys(data).map((key) => data[key]);
              return addMultipleResourcesToCache(resourcesToCache);
            })
            .catch((error) => console.error("SW: Caching Failed.", error)),
          new Promise((_, reject) => setTimeout(() => reject("Caching timed out."), 1000)),
        ]).finally(() => self.skipWaiting())
      )
    );
  } else {
    caches.delete("v1");
    self.skipWaiting();
  }
});

const cacheFirst = (request: Request) =>
  caches.match(request).then((cacheResponse) => {
    if (cacheResponse) return cacheResponse;
    return fetch(request);
  }).catch(() => fetch(request));

self.addEventListener("fetch", (event) => event.respondWith(cacheFirst(event.request)));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((windowClients) => {
      const openedWindow = windowClients.find((windowClient) => windowClient.url === process.env.FRONTEND_URI);
      if (openedWindow && "focus" in openedWindow) {
        openedWindow.focus();
      } else {
        self.clients.openWindow(process.env.FRONTEND_URI!);
      }
    })
  );
});

isSupported()
  .then((isSupported) => {
    if (!isSupported) return;
    const firebaseMessaging = getMessaging(firebaseApp);
    onBackgroundMessage(firebaseMessaging, (payload) => {
      console.log("SW: Message Received", payload);
      const notificationData = payload.notification;
      if (!notificationData) return;
      const { title, body } = notificationData;
      if (!(title && body)) return;
      const notificationOptions: NotificationOptions = {
        body,
        icon: "/apple-touch-icon.png",
      };
      self.registration.showNotification(title, notificationOptions).catch((error) => console.error(error));
    });
  })
  .catch((error) => console.error(error));
