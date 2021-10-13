import { useEffect, useState } from "react";

import useHttp from "./hooks/use-http";

import "./App.css";
import List from "./components/List/List";
import Startup from "./components/Startup/Startup";

function App() {
  const [listName, setListName] = useState(null);
  const [httpConfig, setHttpConfig] = useState({
    uri: null,
    method: null,
    body: null,
  });
  const httpHandler = useHttp(httpConfig);

  //check local cache for account info
  useEffect(() => {
    setListName(window.localStorage.getItem("listName"));
  }, []);

  //load list Data
  useEffect(() => {
    if (listName) {
    }
  }, [listName]);

  console.log(window.localStorage.getItem("listName"));

  return (
    <div className="App">
      {listName ? (
        <List setListName={setListName} listName={listName} />
      ) : (
        <Startup setListName={setListName} />
      )}
    </div>
  );
}

export default App;
