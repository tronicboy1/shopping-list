import http from "http";
import admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
const key = require("./shopping-list-app-d0386-firebase-adminsdk-4n6jo-97fc02004b.json");

const server = http.createServer();

admin.initializeApp({
  credential: admin.credential.cert(key),
  databaseURL: "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const messaging = getMessaging();

const db = getDatabase();
const ref = db.ref("/zlnVg5eATAY5oDNcPKrgEkYfVma2/");
ref.on("value", (snapshot) => {
  const value = snapshot.val();
  const FCMTokens = value?.SETTINGS?.FCM as string[] | null | undefined;
  if (!FCMTokens) return;
  messaging
    .sendToDevice(FCMTokens, {
      data: {
        title: "List Updated",
        body: "Information was updated in your list.",
      },
      notification: {
        title: "List Updated",
        body: "Information was updated in your list.",
      },
    })
    .then((value) => console.log("Notification Sent", value));
});

server.listen(4000, () => console.log("listening on 4000"));
