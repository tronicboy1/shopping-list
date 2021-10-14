import React, { useContext, useState, useEffect } from "react";
import AppContext from "../../helpers/AppContext";
import useHttp from "../../hooks/use-http";

import styles from "./List.module.css";

import Card from "../UI/Card";
import Button from "../UI/Button";
import AddItem from "./AddItem";
import ListItem from "./ListItem";
import Settings from "../Settings/Settings";

const defaultHttpConfig = { uri: null, method: null, body: null };

const List = (props) => {
  const context = useContext(AppContext);
  const [showSettings, setShowSettings] = useState(false);
  const [httpConfig, setHttpConfig] = useState(defaultHttpConfig);
  const { loading, errors, data } = useHttp(httpConfig);
  const [shoppingList, setShoppingList] = useState([]);

  //make changes to states here depending on data content
  useEffect(() => {
    const newList = [];

    for (const name in data) {
      newList.push({ id: name, item: data[name].item });
    }

    setShoppingList(newList);
  }, [data]);

  //set uri
  useEffect(() => {
    setHttpConfig((prev) => ({ ...prev, uri: context.uri }));
  }, [context.uri]);

  const addItem = (itemName) => {
    setShoppingList((prev) => [...prev, { id: "PENDING", item: itemName }]);
    setHttpConfig((prev) => {
      return { ...prev, method: "POST", body: { item: itemName } };
    });
  };

  const deleteAll = () => {
    setShoppingList([]);
    fetch(httpConfig.uri, { method: "DELETE" });
  };

  const removeClicked = (name) => {
    setShoppingList((prev) => {
      return prev.filter((item) => item.id !== name);
    });
    delete data[name];
    setHttpConfig((prev) => ({
      ...prev,
      method: "PUT",
      body: data,
    }));
  };

  const clearHouse = () => {
    context.setHouseName("");
    context.setAppMode("");
    setHttpConfig(defaultHttpConfig);
    setShoppingList([]);
  };

  const toggleShowSettings = () => {
    setShowSettings((prev) => !prev);
  };

  return (
    <>
      {showSettings && (
        <Settings
          houseName={context.houseName}
          changeHouse={clearHouse}
          deleteAll={deleteAll}
          toggleShowSettings={toggleShowSettings}
        />
      )}
      <AddItem addItem={addItem} loading={loading} />
      <Card className="list">
        {errors && <p>{errors}</p>}
        {loading && shoppingList.length === 0 ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <ul className={styles.list}>
            {shoppingList.length > 0 ? (
              shoppingList.map((item) => (
                <ListItem
                  onClick={(name) => {
                    removeClicked(name);
                  }}
                  id={item.id}
                  key={item.id}
                >
                  {item.item}
                </ListItem>
              ))
            ) : (
              <li>No items in shopping list</li>
            )}
          </ul>
        )}
      </Card>
      <Card>
        <Button style={{ height: "50px" }} onClick={toggleShowSettings}>
          Settings
        </Button>
      </Card>
    </>
  );
};

export default List;
