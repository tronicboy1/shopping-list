import React, { useContext, useState, useEffect } from "react";
import AppContext from "../../helpers/AppContext";
import useHttp from "../../hooks/use-http";

import styles from "./List.module.css";

import Card from "../UI/Card";
import Button from "../UI/Button";
import AddItem from "./AddItem";
import ListLogic from "./ListLogic";

const defaultHttpConfig = { uri: null, method: null, body: null };

const List = (props) => {
  const context = useContext(AppContext);
  const [httpConfig, setHttpConfig] = useState(defaultHttpConfig);
  const { loading, errors, data } = useHttp(httpConfig);

  const { setShoppingList } = props;

  //make changes to states here depending on data content
  useEffect(() => {
    console.log("list re renderered");
    if (data) {
      const newList = [];

      for (const name in data) {
        newList.push({ id: name, item: data[name].item });
      }

      setShoppingList(newList);
    }
  }, [setShoppingList,data]);

  //set uri
  useEffect(() => {
    setHttpConfig((prev) => ({ ...prev, uri: context.uri }));
  }, [context.uri]);

  const addItem = (itemName) => {
    setShoppingList((prev) => [
      ...prev,
      { id: "PENDING", item: itemName },
    ]);
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

  return (
    <div className={styles.container}>
      <AddItem addItem={addItem} loading={loading} />
      <Card className="list">
        {errors && <p>{errors}</p>}
        <ListLogic
          list={props.shoppingList}
          removeClicked={removeClicked}
          loading={loading}
          styles={styles}
        />
      </Card>
      <Card>
        <Button style={{ height: "50px", marginTop: "0" }} onClick={deleteAll}>
          Clear All
        </Button>
      </Card>
    </div>
  );
};

export default List;
