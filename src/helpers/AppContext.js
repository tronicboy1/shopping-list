import React from "react";

const AppContext = React.createContext({
  appMode: "",
  setAppMode: (mode) => {},
  timeZone: "",
  setTimeZone: (timezone) => {},
  user: {},
  setUser: (user) => {},
  firebase: {},
  auth: {},
  isAuth: false,
  setIsAuth: (bool) => {},
  logout: () => {}
});

export default AppContext;
