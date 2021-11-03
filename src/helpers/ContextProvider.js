import React, { useState, useEffect } from "react";
import firebase from "../services/firebase";
import { getAuth } from "firebase/auth";

import AppContext from "./AppContext";

const ContextProvider = (props) => {
  const firebaseUri =
    "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app/";

  const [houseName, setHouseName] = useState(null);
  const [appMode, setAppMode] = useState("START");
  const [uri, setUri] = useState(null);
  const [timeZone, setTimeZone] = useState("Asia/Tokyo");
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);

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
    const auth = getAuth(firebase);
    auth.onAuthStateChanged(setUser);
    setAuth(auth);
  }, []);

  //change local cache settings
  useEffect(() => {
    window.localStorage.setItem("appMode", appMode);
    window.localStorage.setItem("houseName", houseName);
    window.localStorage.setItem("timeZone", timeZone);
  }, [appMode, houseName, timeZone]);

  const logout = () => {
    auth.signOut();
    setUser(null);
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
    user,
    setUser,
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
