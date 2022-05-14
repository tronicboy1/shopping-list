import React, { useContext, useCallback } from "react";
import AppContext from "../../helpers/AppContext";
import useDoubleClick from "../../hooks/use-double-click";
import useFirebase from "../../hooks/use-firebase";

import styles from "./List.module.css";

import Button from "../UI/Button";
import AddItem from "./AddItem";
import ListLogic from "./ListLogic";

const List = (props) => {
  const { user } = useContext(AppContext);
  const { list, loading, errors, addData, remove, removeAll } = useFirebase(
    user.uid,
    "SHOPPING",
    (name, data) => ({ id: name, item: data[name]["item"] })
  );
  //handle double click
  const removeClicked = useCallback(
    (name) => {
      remove(name);
    },
    [remove]
  );

  const onTileClicked = useDoubleClick(removeClicked);

  const deleteAll = () => {
    removeAll();
  };

  const onDeleteButtonClicked = useDoubleClick(deleteAll);

  const addItem = (itemName) => {
    addData({
      item: itemName,
    });
  };

  return (
    <div style={props.style} className={styles.container}>
      <AddItem addItem={addItem} loading={loading} />
      <base-card className="shopping-list">
        {errors && <p>{errors}</p>}
        <ListLogic
          list={list}
          removeClicked={onTileClicked}
          loading={loading}
          styles={styles}
        />
      </base-card>
      <base-card className="no-text-select">
        <Button
          style={{ height: "50px", marginTop: "0" }}
          onClick={onDeleteButtonClicked.bind(null, "delete")}
        >
          Clear All
        </Button>
      </base-card>
    </div>
  );
};

export default List;
