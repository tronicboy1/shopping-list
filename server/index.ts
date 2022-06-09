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

type FCMKeys = Record<string, string[]>;
let fcmKeys: FCMKeys = {};
const fcmRef = db.ref("/FCM/");
fcmRef.on("value", (snapshot) => {
  const value = snapshot.val() as FCMKeys | null;
  if (!(value && value instanceof Object)) return;
  fcmKeys = value;
});

const ref = db.ref("/NOTIFICATIONS/");
ref.on("child_changed", (snapshot) => {
  const newNotification = snapshot.val() as { item?: string; uid: string } | null;
  const uidList = Object.keys(fcmKeys);
  if (!(uidList.length && newNotification)) return;
  const fcmTokens = fcmKeys[newNotification.uid];
  if (!fcmTokens || fcmTokens.length === 0) return;
  console.log(newNotification, fcmTokens);
  messaging
    .sendToDevice(fcmTokens, {
      notification: {
        title: "List Updated",
        body: `New Item ${newNotification.item} was updated in your list.`,
      },
    })
    .then((value) => console.log("Notification Sent", value));
});

server.listen(4000, () => console.log("listening on 4000"));
