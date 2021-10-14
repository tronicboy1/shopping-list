import React from "react";

const AppContext = React.createContext({
  houseName: "",
  setHouseName: (name) => {},
  appMode: "",
  setAppMode: (mode) => {},
  uri: "",
  clearHouse: () => {},
  timeZone: "",
  setTimeZone: (timezone) => {}
});

export default AppContext;
