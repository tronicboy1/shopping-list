import { isSupported } from "firebase/messaging";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "./firebase";

declare var self: ServiceWorkerGlobalScope;

const auth = getAuth(firebaseApp);
let uid: string = "";

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data === "get-auth") {
    event.waitUntil(sendAuthStateToClients(uid));
  }
});

self.addEventListener("install", (event) => {
  console.log("SW: Installing.", event);
});

const addMultipleResourcesToCache = (links: string[]) => caches.open("v1").then((cache) => cache.addAll(links));

const sendAuthStateToClients = (uid: string): Promise<any> => {
  return self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: "auth", uid }));
  });
};

self.addEventListener("activate", (event) => {
  console.log("SW: Activated.", event);
  event.waitUntil(
    fetch("/public-manifest.json")
      .then((result) => result.json())
      .then((data: { [key: string]: string }) => {
        const resourcesToCache = Object.keys(data).map((key) => data[key]);
        addMultipleResourcesToCache(resourcesToCache).catch((error) => console.error("SW: Caching Failed.", error));
      })
      .catch((error) => console.error("SW: Resource Caching Failed.", error))
  );
  onAuthStateChanged(auth, (authState) => {
    uid = authState ? authState.uid : "";
    sendAuthStateToClients(uid);
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
});

const addNewResourceToCache = (request: Request, response: Response) =>
  caches.open("v1").then((cache) => cache.put(request, response));

const cacheFirst = (request: Request) =>
  caches.match(request).then((cacheResponse) => {
    if (cacheResponse) return cacheResponse;
    return fetch(request).then((response) => {
      if (request.method === "GET" && !request.url.includes("identitytoolkit")) {
        addNewResourceToCache(request, response.clone());
      }
      return response;
    });
  });

self.addEventListener("fetch", (event) =>
  event.respondWith(process.env.NODE_ENV === "production" ? cacheFirst(event.request) : fetch(event.request))
);

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

self.addEventListener("notificationclose", (event) => {
  console.log("SW: Notification Closed.", event);
});
