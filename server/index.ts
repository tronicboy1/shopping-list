import http from "http";
import admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
const key = require("./shopping-list-app-d0386-firebase-adminsdk-4n6jo-97fc02004b.json");

const server = http.createServer((req, res) => {
  res.write("OK");
  res.statusCode = 200;
  return res.end();
});

admin.initializeApp({
  credential: admin.credential.cert(key),
  databaseURL: "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const messaging = getMessaging();

const db = getDatabase();

const ref = db.ref("/NOTIFICATIONS/");
ref.on("child_changed", (snapshot) => {
  const newNotification = snapshot.val() as { item?: string; uid: string } | null;
  if (!newNotification) return;
  const fcmRef = db.ref(`/FCM/${newNotification.uid}`);
  fcmRef.get().then((fcmTokensData) => {
    const fcmTokens = fcmTokensData.val() as string[] | null;
    if (!fcmTokens || fcmTokens.length === 0) return;
    messaging
      .sendToDevice(fcmTokens, {
        notification: {
          title: "List Updated",
          body: `New Item ${newNotification.item} was updated in your list.`,
        },
      })
      .then((value) => console.log("Notification Sent", newNotification.uid));
  });
});

const port = 8080;
server.listen(port, () => console.log(`listening on ${port}`));
