import React, { useState } from "react";

import styles from "./List.module.css";

import Card from "../UI/Card";
import Button from "../UI/Button";
import AddItem from "./AddItem";
import ListItem from "./ListItem";
import Settings from "../Settings/Settings";

const List = (props) => {
  const [showSettings, setShowSettings] = useState(false);

  const onListItemClick = (id) => {
    props.removeClicked(id);
  };

  const toggleShowSettings = () => {
    setShowSettings((prev) => !prev);
  };
  return (
    <>
      {showSettings && (
        <Settings
          listName={props.listName}
          changeList={props.clearListName}
          deleteAll={props.deleteAll}
          toggleShowSettings={toggleShowSettings}
        />
      )}
      <AddItem addItem={props.addItem} loading={props.addItemLoading} />
      <Card className="list">
        {props.listLoading && props.items.length === 0 ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <ul className={styles.list}>
            {props.items.length > 0 ? (
              props.items.map((item) => (
                <ListItem onClick={onListItemClick} id={item.id} key={item.id}>
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
