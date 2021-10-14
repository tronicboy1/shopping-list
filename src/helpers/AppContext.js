import React from "react";

const AppContext = React.createContext({
  houseName: "",
  setHouseName: () => {},
  appMode: "",
  setAppMode: () => {},
  uri: "",
  clearHouse: () => {}
});

export default AppContext;
