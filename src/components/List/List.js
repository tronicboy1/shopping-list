import React from "react";

import styles from "./List.module.css";

import Card from "../UI/Card";
import Button from "../UI/Button";
import AddItem from "./AddItem";
import ListItem from "./ListItem";

const List = (props) => {
  const changeList = () => {
    props.setListName(null);
    window.localStorage.removeItem("listName");
  };
  return (
    <>
      <AddItem addItem={props.addItem} loading={props.addItemLoading} />
      <Card>
        {props.listLoading ? (
          <p style={{textAlign: "center"}}>Loading...</p>
        ) : (
          <ul className={styles.list}>
            {props.items ? (
              props.items.map((item) => (
                <ListItem key={item.id}>{item.item}</ListItem>
              ))
            ) : (
              <li>No items in shopping list</li>
            )}
          </ul>
        )}
      </Card>
      <Card>
        <p style={{ margin: "0.2rem" }}>Current list: {props.listName}</p>
        <Button style={{ height: "45px" }} onClick={changeList}>
          Change List
        </Button>
      </Card>
    </>
  );
};

export default List;
