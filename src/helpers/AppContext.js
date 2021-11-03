import React from "react";

const AppContext = React.createContext({
  houseName: "",
  setHouseName: (name) => {},
  appMode: "",
  setAppMode: (mode) => {},
  uri: "",
  clearHouse: () => {},
  timeZone: "",
  setTimeZone: (timezone) => {},
  user: {},
  setUser: (user) => {},
  firebase: {},
  auth: {},
  isAuth: false,
  setIsAuth: (bool) => {}
});

export default AppContext;
