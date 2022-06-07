importScripts("https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.1.1/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyBZ3KUebo7OAtHJQRwEJr2VEpH1yWktahE",
  authDomain: "shopping-list-app-d0386.firebaseapp.com",
  databaseURL: "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shopping-list-app-d0386",
  storageBucket: "shopping-list-app-d0386.appspot.com",
  messagingSenderId: "302654429160",
  appId: "1:302654429160:web:b1d02796a6b4d7fa92365d",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
