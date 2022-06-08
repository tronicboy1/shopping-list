importScripts("https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.1.1/firebase-messaging.js");
/**
 * @typedef {{body: string;data: any;icon: string;lang: string;requireInteraction: boolean;silent: boolean;tag: string;timestamp: number;title: string;close(): void;requestPermission(): Promise<string>;}} Notification
 */

self.addEventListener("install", (event) => {
  //console.log("SW: Installing.", event);
});

self.addEventListener("activate", (event) => {
  //console.log("SW: Activated.", event);
});

self.addEventListener(
  "fetch",
  /**
   * @param {Event & {request: Request; respondWith(response: Promise<Response>|Response): Promise<Response>;}} event
   */
  (event) => {
    event.respondWith(fetch(event.request));
  }
);

self.addEventListener(
  "notificationclick",
  /**
   * @param {{action: string; notification: Notification;}} event
   */
  (event) => {
    console.log(event.notification);
    event.notification.close();
  }
);

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

const firebaseApp = firebase.initializeApp(firebaseConfig);

if (firebase.messaging.isSupported()) {
  const firebaseMessaging = firebase.messaging(firebaseApp);
  firebaseMessaging.onBackgroundMessage((payload) => {
    console.log("SW: Message Received", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/apple-touch-icon.png",
      renotify: true,
      tag: "notification",
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
