import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { Observable, shareReplay, filter, OperatorFunction, map } from "rxjs";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

export class Firebase {
  static instance = this;
  private static firebaseConfig = {
    apiKey: "AIzaSyBZ3KUebo7OAtHJQRwEJr2VEpH1yWktahE",
    authDomain: "shopping-list-app-d0386.firebaseapp.com",
    databaseURL: "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "shopping-list-app-d0386",
    storageBucket: "shopping-list-app-d0386.appspot.com",
    messagingSenderId: "302654429160",
    appId: "1:302654429160:web:b1d02796a6b4d7fa92365d",
  };
  private static _authState$?: Observable<User | null>;

  static get app() {
    return initializeApp(this.firebaseConfig);
  }

  static get authState$() {
    return (this._authState$ ||= new Observable<User | null>((observer) => {
      return onAuthStateChanged(
        getAuth(this.app),
        (user) => observer.next(user),
        (error) => observer.error(error)
      );
    }).pipe(shareReplay(1)));
  }

  static get uid$() {
    return this.authState$.pipe(
      filter((user) => Boolean(user)) as OperatorFunction<User | null, User>,
      map((user) => user.uid)
    );
  }

  static get auth() {
    return getAuth(this.app);
  }

  static get db() {
    return getDatabase(this.app);
  }

  static get storage() {
    return getStorage(this.app);
  }
}

if (process.env.NODE_ENV === "development") {
  //@ts-ignore
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
export const appCheck = initializeAppCheck(Firebase.app, {
  provider: new ReCaptchaV3Provider("6LcuLlsgAAAAADL_n_1hS7zeQMKX6xbi10jQYIYR"),
  isTokenAutoRefreshEnabled: true,
});

Firebase.auth.useDeviceLanguage();
