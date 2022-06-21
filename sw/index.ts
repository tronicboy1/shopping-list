import { isSupported } from "firebase/messaging";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { firebaseApp } from "./firebase";

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

let uid: string = "";
const auth = getAuth(firebaseApp);

onAuthStateChanged(auth, (authState) => {
  uid = authState ? authState.uid : "";
  sendAuthStateToClients(uid);
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data === "get-auth") {
    if (uid) {
      return event.waitUntil(sendAuthStateToClients(uid));
    }
    event.waitUntil(
      getUid()
        .then((uid) => sendAuthStateToClients(uid))
        .catch((error) => console.error(error))
    );
  }
});

const getUid = () =>
  new Promise<string>((resolve, reject) => {
    const cancelCallback = onAuthStateChanged(
      auth,
      (authState) => {
        cancelCallback();
        const uid = authState ? authState.uid : "";
        resolve(uid);
      },
      (error) => {
        cancelCallback();
        reject(error.message);
      }
    );
  });

const sendAuthStateToClients = (uid: string): Promise<any> => {
  return self.clients.matchAll().then((clients) => {
    if (!clients.length) {
      return self.clients.claim().then(() => sendAuthStateToClients(uid)); // there are time where the clients are not registered after first boot
    }
    clients.forEach((client) => client.postMessage({ type: "auth", uid }));
  });
};

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
      self.registration.showNotification(title, notificationOptions);
    });
  })
  .catch((error) => postMessage(error.message));
