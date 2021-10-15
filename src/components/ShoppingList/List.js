import React, { useContext, useState, useEffect, useCallback } from "react";
import AppContext from "../../helpers/AppContext";
import useHttp from "../../hooks/use-http";
import useDoubleClick from "../../hooks/use-double-click";

import styles from "./List.module.css";

import Card from "../UI/Card";
import Button from "../UI/Button";
import AddItem from "./AddItem";
import ListLogic from "./ListLogic";

const defaultHttpConfig = { uri: null, method: null, body: null };

const List = (props) => {
  const context = useContext(AppContext);
  const { setShoppingList } = props;
  const [httpConfig, setHttpConfig] = useState(defaultHttpConfig);
  const { loading, errors, data } = useHttp(httpConfig);
  //handle double click
  const removeClicked = useCallback(
    (name) => {
      setShoppingList((prev) => {
        return prev.filter((item) => item.id !== name);
      });
      delete data[name];
      setHttpConfig((prev) => ({
        ...prev,
        method: "PUT",
        body: data,
      }));
    },
    [data, setShoppingList]
  );

  const onTileClicked = useDoubleClick(removeClicked);

  const deleteAll = () => {
    setShoppingList([]);
    fetch(httpConfig.uri, { method: "DELETE" });
  };

  const onDeleteButtonClicked = useDoubleClick(deleteAll);

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
  }, [setShoppingList, data]);

  //set uri
  useEffect(() => {
    const newUri = context.uri + "SHOPPING" + ".json";
    setHttpConfig((prev) => ({ ...prev, uri: newUri }));
  }, [context.uri]);

  const addItem = (itemName) => {
    setShoppingList((prev) => [...prev, { id: "PENDING", item: itemName }]);
    setHttpConfig((prev) => {
      return { ...prev, method: "POST", body: { item: itemName } };
    });
  };

  return (
    <div className={styles.container}>
      <AddItem addItem={addItem} loading={loading} />
      <Card className="list">
        {errors && <p>{errors}</p>}
        <ListLogic
          list={props.shoppingList}
          removeClicked={onTileClicked}
          loading={loading}
          styles={styles}
        />
      </Card>
      <Card>
        <Button
          style={{ height: "50px", marginTop: "0" }}
          onClick={onDeleteButtonClicked.bind(null, "delete")}
        >
          Clear All
        </Button>
      </Card>
    </div>
  );
};

export default List;
