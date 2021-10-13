import { useEffect, useMemo, useState } from "react";

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
  const [list, setList] = useState([]);
  const getConfig = useMemo(
    () => ({ uri: httpConfig.uri, method: "GET" }),
    [httpConfig.uri]
  );
  const postHandler = useHttp(httpConfig);
  const getHandler = useHttp(getConfig);

  //check local cache for account info
  useEffect(() => {
    setListName(window.localStorage.getItem("listName"));
  }, []);

  //load list Data
  useEffect(() => {
    if (listName) {
      const newUri =
        "https://shopping-list-app-d0386-default-rtdb.asia-southeast1.firebasedatabase.app/" +
        listName +
        ".json";
      setHttpConfig((prev) => {
        return { ...prev, uri: newUri };
      });
    }
  }, [listName]);

  useEffect(() => {
    if (getHandler.data) {
      const newList = [];

      for (const name in getHandler.data) {
        newList.push({ id: name, item: getHandler.data[name].item });
      }

      setList(newList);
    }
  }, [getHandler.data]);

  const addItem = (itemName) => {
    console.log(itemName);
    setHttpConfig((prev) => {
      return { ...prev, method: "POST", body: { item: itemName } };
    });
  };

  return (
    <div className="App">
      {getHandler.errors && <p>{getHandler.errors}</p>}
      {listName ? (
        <List
          setListName={setListName}
          listName={listName}
          items={list}
          addItem={addItem}
          addItemLoading={postHandler.loading}
          listLoading={getHandler.loading}
        />
      ) : (
        <Startup setListName={setListName} />
      )}
    </div>
  );
}

export default App;
