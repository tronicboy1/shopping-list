import { useContext } from "react";
import "./App.css";
import Startup from "./components/Startup/Startup";
import AppContext from "./helpers/AppContext";
import ContextProvider from "./helpers/ContextProvider";
import List from "./components/ShoppingList/List";
import Header from "./components/Header/Header";
import Chores from "./components/Chores/Chores";
import SettingsButton from "./components/Settings/SettingsButton";

const AppWithContext = () => {
  const context = useContext(AppContext);
  if (context.appMode) {
    return (
      <>
        <Header />
          {context.appMode === "SHOPPING" ? <List /> : <Chores />}
        <SettingsButton />
      </>
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
