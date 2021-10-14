import { useContext } from "react";
import "./App.css";
import Startup from "./components/Startup/Startup";
import AppContext from "./helpers/AppContext";
import ContextProvider from "./helpers/ContextProvider";
import List from "./components/ShoppingList/List";

const AppWithContext = () => {
  const context = useContext(AppContext);

  if (context.appMode === "SHOPPING") {
    return <List />;
  }
  return <Startup />
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
