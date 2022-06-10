import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export const firebaseConfig = {
  apiKey: "AIzaSyBZ3KUebo7OAtHJQRwEJr2VEpH1yWktahE",
  authDomain: "shopping-list-app-d0386.firebaseapp.com",
  databaseURL: "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shopping-list-app-d0386",
  storageBucket: "shopping-list-app-d0386.appspot.com",
  messagingSenderId: "302654429160",
  appId: "1:302654429160:web:b1d02796a6b4d7fa92365d",
};

export const firebaseApp = initializeApp(firebaseConfig);

if (process.env.NODE_ENV === "development") {
  //@ts-ignore
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
export const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider("6LcuLlsgAAAAADL_n_1hS7zeQMKX6xbi10jQYIYR"),
  isTokenAutoRefreshEnabled: true,
});

export const auth = getAuth(firebaseApp);
