import React, { useContext } from "react";
import "./App.css";
import Startup from "./components/Startup/Startup";
import AppContext from "./helpers/AppContext";
import List from "./components/ShoppingList/List";
import Chores from "./components/Chores/Chores";
import SettingsButton from "./components/Settings/SettingsButton";
import useSwipe from "./hooks/use-swipe";

const App = () => {
  const context = useContext(AppContext);
  const swipeHandler = useSwipe(
    () => {
      if (context.appMode === "SHOPPING") {
        context.setAppMode("CHORES");
      }
    },
    () => {
      if (context.appMode === "CHORES") {
        context.setAppMode("SHOPPING");
      }
    }
  );
  const listStyle = {
    transform: `translateX(${
      swipeHandler.xChange < 0 ? swipeHandler.xChange : 0
    }px)`,
  };
  const choresStyle = {
    transform: `translateX(${
      swipeHandler.xChange > 0 ? swipeHandler.xChange : 0
    }px)`,
  };

  if (context.user) {
    return (
      <div className="App">
        <div
          className="swipe-div"
          onTouchStart={swipeHandler.handleTouchStart}
          onTouchMove={swipeHandler.handelTouchMove}
          onTouchEnd={swipeHandler.handleTouchEnd}
        >
          {context.appMode === "SHOPPING" && <List style={listStyle} />}
          {context.appMode === "CHORES" && <Chores style={choresStyle} />}
          <SettingsButton />
        </div>
      </div>
    );
  }
  return <Startup />;
};

export default App;
