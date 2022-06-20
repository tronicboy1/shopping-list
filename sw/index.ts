import { initializeApp } from "firebase/app";
import { isSupported } from "firebase/messaging";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { getAuth, onAuthStateChanged } from "firebase/auth";

declare var self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
  console.log("SW: Installing.", event);
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activated.", event);
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

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

const firebaseConfig = {
  apiKey: "AIzaSyBZ3KUebo7OAtHJQRwEJr2VEpH1yWktahE",
  authDomain: "shopping-list-app-d0386.firebaseapp.com",
  databaseURL: "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shopping-list-app-d0386",
  storageBucket: "shopping-list-app-d0386.appspot.com",
  messagingSenderId: "302654429160",
  appId: "1:302654429160:web:b1d02796a6b4d7fa92365d",
};

const firebaseApp = initializeApp(firebaseConfig);

let uid = "";

onAuthStateChanged(getAuth(firebaseApp), (auth) => {
  if (auth) {
    uid = auth.uid;
  } else {
    uid = "";
  }
  sendAuthStateToClients(uid);
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data === "get-auth") {
    sendAuthStateToClients(uid);
  }
});

const sendAuthStateToClients = (uid: string) =>
  self.clients.matchAll().then((clients) =>
    clients.forEach((client) => {
      client.postMessage({ type: "auth", uid });
    })
  );

isSupported().then(() => {
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
    self.registration.showNotification(title, notificationOptions);
  });
});
