import { useEffect, useState } from "react";

import useHttp from "./hooks/use-http";

import "./App.css";
import List from "./components/List/List";
import Startup from "./components/Startup/Startup";

const defaultHttpConfig = {
  uri: null,
  method: null,
  body: null,
};

function App() {
  const [listName, setListName] = useState(null);
  const [httpConfig, setHttpConfig] = useState(defaultHttpConfig);
  const [list, setList] = useState([]);
  const postHandler = useHttp(httpConfig);

  //check local cache for account info
  useEffect(() => {
    setListName(window.localStorage.getItem("listName"));
  }, []);

  //set uri
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

  //load Data to list
  useEffect(() => {
    if (postHandler.data) {
      const newList = [];

      for (const name in postHandler.data) {
        newList.push({ id: name, item: postHandler.data[name].item });
      }

      setList(newList);
    }
  }, [postHandler.data]);

  const clearListName = () => {
    setListName(null);
    setHttpConfig(defaultHttpConfig);
    window.localStorage.removeItem("listName");
    setList([]);
  };

  const addItem = (itemName) => {
    if (itemName.length > 0) {
      setList((prev) => [...prev, { id: "PENDING", item: itemName }]);
      setHttpConfig((prev) => {
        return { ...prev, method: "POST", body: { item: itemName } };
      });
    }
  };

  const deleteAll = () => {
    setList([]);
    fetch(httpConfig.uri, { method: "DELETE" });
  };

  const removeClicked = (name) => {
    setList((prev) => {
      return prev.filter((item) => item.id !== name);
    });
    delete postHandler.data[name];
    setHttpConfig((prev) => ({
      ...prev,
      method: "PUT",
      body: postHandler.data,
    }));
  };

  return (
    <div className="App">
      {postHandler.errors && <p>{postHandler.errors}</p>}
      {listName ? (
        <List
          clearListName={clearListName}
          listName={listName}
          items={list}
          addItem={addItem}
          deleteAll={deleteAll}
          removeClicked={removeClicked}
          addItemLoading={postHandler.loading && httpConfig.method}
          listLoading={postHandler.loading}
        />
      ) : (
        <Startup setListName={setListName} />
      )}
    </div>
  );
}

export default App;
