import React, { useState, useEffect } from "react";
import firebase from "../services/firebase";
import { getAuth } from "firebase/auth";

import AppContext from "./AppContext";

const ContextProvider = (props) => {
  const [appMode, setAppMode] = useState("START");
  const [timeZone, setTimeZone] = useState("Asia/Tokyo");
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);

  //check local cache for account info
  useEffect(() => {
    setAppMode(window.localStorage.getItem("appMode"));
    setTimeZone(window.localStorage.getItem("timeZone"));
  }, []);

  //setup firebase
  useEffect(() => {
    const auth = getAuth(firebase);
    auth.onAuthStateChanged(setUser);
    setAuth(auth);
  }, []);

  //change local cache settings
  useEffect(() => {
    window.localStorage.setItem("appMode", appMode);
    window.localStorage.setItem("timeZone", timeZone);
  }, [appMode, timeZone]);

  const logout = () => {
    auth.signOut();
    setUser(null);
    setAppMode("");
  };

  const setContext = {
    appMode: appMode,
    setAppMode: setAppMode,
    timeZone: timeZone,
    setTimeZone: setTimeZone,
    firebase,
    auth,
    user,
    setUser,
    logout
  };
  return (
    <AppContext.Provider value={setContext}>
      {props.children}
    </AppContext.Provider>
  );
};

export default ContextProvider;
