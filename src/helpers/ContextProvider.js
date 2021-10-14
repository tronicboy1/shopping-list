import React, { useState, useEffect } from "react";

import AppContext from "./AppContext";

const ContextProvider = (props) => {
  const firebaseUri =
    "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app/";

  const [houseName, setHouseName] = useState(null);
  const [appMode, setAppMode] = useState("START");
  const [uri, setUri] = useState(null);

  //check local cache for account info
  useEffect(() => {
    setHouseName(window.localStorage.getItem("houseName"));
    setAppMode(window.localStorage.getItem('appMode'));
  }, []);

  //set uri
  useEffect(() => {
    if (houseName && appMode) {
      const newUri = firebaseUri + houseName + "/" + appMode + ".json";
      setUri(newUri);
    } else {
      setUri(null);
    }
  }, [houseName, appMode]);

  //change local cache settings
  useEffect(() => {
      window.localStorage.setItem('appMode', appMode);
      window.localStorage.setItem('houseName', houseName);
  }, [appMode,houseName]);

  const clearHouse = () => {
    setHouseName("");
    setAppMode("");
  };

  const setContext = {
    houseName: houseName,
    setHouseName: setHouseName,
    appMode: appMode,
    setAppMode: setAppMode,
    uri: uri,
    clearHouse: clearHouse
  };
  return (
    <AppContext.Provider value={setContext}>
      {props.children}
    </AppContext.Provider>
  );
};

export default ContextProvider;
