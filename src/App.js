import React, { useContext } from "react";
import "./App.css";
import Startup from "./components/Startup/Startup";
import AppContext from "./helpers/AppContext";
import List from "./components/ShoppingList/List";
import Chores from "./components/Chores/Chores";
import SettingsButton from "./components/Settings/SettingsButton";

const App = () => {
  const context = useContext(AppContext);

  if (context.user) {
    return (
      <div className="App">
        {context.appMode === "SHOPPING" && <List />}
        {context.appMode === "CHORES" && <Chores />}
        <SettingsButton />
      </div>
    );
  }
  return <Startup />;
};

export default App;
