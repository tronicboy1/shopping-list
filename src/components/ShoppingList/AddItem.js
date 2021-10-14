import React from "react";

import useInput from "../../hooks/use-input";

import styles from "./AddItem.module.css";

import Card from "../UI/Card";
import Input from "../UI/Input";

const AddItem = (props) => {
  const newItem = useInput((value) => {
    return true;
  });

  const addItemHandler = (e) => {
    e.preventDefault();

    props.addItem(newItem.value.trim());

    newItem.reset()
  };
  return (
    <Card>
      <form onSubmit={addItemHandler} className={styles["new-item__input"]}>
        <Input
          style={{ marginTop: "0", marginBottom: "0", width: "100%" }}
          borderRadius="left"
          id="new-item"
          label="New Item"
          onChange={newItem.inputHandler}
          value={newItem.value}
          button={props.loading ? "..." : "Add"}
        />
      </form>
    </Card>
  );
};

export default AddItem;
