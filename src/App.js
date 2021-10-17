import { useContext, useState } from "react";
import "./App.css";
import Startup from "./components/Startup/Startup";
import AppContext from "./helpers/AppContext";
import ContextProvider from "./helpers/ContextProvider";
import List from "./components/ShoppingList/List";
import Header from "./components/Header/Header";
import Chores from "./components/Chores/Chores";
import SettingsButton from "./components/Settings/SettingsButton";
import useSwipe from "./hooks/use-swipe";

const AppWithContext = () => {
  const context = useContext(AppContext);
  const [shoppingList, setShoppingList] = useState([]);
  const [choresList, setChoresList] = useState([]);
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
  const translateXVal =
    Math.abs(swipeHandler.touchEnd) > 20 && !swipeHandler.touchYEnd ? swipeHandler.touchEnd : 0;
  if (context.appMode) {
    return (
      <div
        className="swipe-div"
        onClick={() => {
          console.log("Click");
        }}
        onTouchStart={swipeHandler.handleTouchStart}
        onTouchMove={swipeHandler.handelTouchMove}
        onTouchEnd={swipeHandler.handleTouchEnd}
      >
        <Header />
        {context.appMode === "SHOPPING" && (
          <List
            style={{
              transform: `translateX(${
                translateXVal > 0 ? -translateXVal : 0
              }px)`,
            }}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
          />
        )}
        {context.appMode === "CHORES" && (
          <Chores
            style={{
              transform: `translateX(${
                translateXVal < 0 ? -translateXVal : 0
              }px)`,
            }}
            choresList={choresList}
            setChoresList={setChoresList}
          />
        )}
        <SettingsButton />
      </div>
    );
  }
  return <Startup />;
};

function App() {
  return (
    <ContextProvider>
      <div className="App">
        <AppWithContext />
      </div>
    </ContextProvider>
  );
}

export default App;
