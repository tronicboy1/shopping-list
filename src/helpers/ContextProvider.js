import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import AppContext from "./AppContext";

const ContextProvider = (props) => {
  const firebaseUri =
    "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app/";

  const [houseName, setHouseName] = useState(null);
  const [appMode, setAppMode] = useState("START");
  const [uri, setUri] = useState(null);
  const [timeZone, setTimeZone] = useState("Asia/Tokyo");
  const [firebase, setFirebase] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  //check local cache for account info
  useEffect(() => {
    setHouseName(window.localStorage.getItem("houseName"));
    setAppMode(window.localStorage.getItem("appMode"));
    setTimeZone(window.localStorage.getItem("timeZone"));
  }, []);

  //set uri
  useEffect(() => {
    if (houseName) {
      const newUri = firebaseUri + houseName + "/";
      setUri(newUri);
    } else {
      setUri(null);
    }
  }, [houseName]);

  //setup firebase
  useEffect(() => {
    const firebaseApp = initializeApp({
      apiKey: "AIzaSyBZ3KUebo7OAtHJQRwEJr2VEpH1yWktahE",
      authDomain: "shopping-list-app-d0386.firebaseapp.com",
      databaseURL:
        "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "shopping-list-app-d0386",
      storageBucket: "shopping-list-app-d0386.appspot.com",
      messagingSenderId: "302654429160",
      appId: "1:302654429160:web:b1d02796a6b4d7fa92365d",
    });
    setFirebase(firebaseApp);
    const appAuth = getAuth(firebaseApp)
    setAuth(appAuth);
    onAuthStateChanged(appAuth, user => {
      if (user) {
        setIsAuth(true);
        console.log(appAuth.currentUser);
      }
    })
  }, []);

  //change local cache settings
  useEffect(() => {
    window.localStorage.setItem("appMode", appMode);
    window.localStorage.setItem("houseName", houseName);
    window.localStorage.setItem("timeZone", timeZone);
  }, [appMode, houseName, timeZone]);

  const logout = () => {
    auth.signOut();
    setIsAuth(false);
    setHouseName("");
    setAppMode("");
  };

  const setContext = {
    houseName: houseName,
    setHouseName: setHouseName,
    appMode: appMode,
    setAppMode: setAppMode,
    uri: uri,
    timeZone: timeZone,
    setTimeZone: setTimeZone,
    firebase,
    auth,
    isAuth,
    setIsAuth,
    logout
  };

  console.log(setContext);
  return (
    <AppContext.Provider value={setContext}>
      {props.children}
    </AppContext.Provider>
  );
};

export default ContextProvider;
