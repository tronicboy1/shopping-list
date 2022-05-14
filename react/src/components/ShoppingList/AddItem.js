import React from "react";

import useInput from "../../hooks/use-input";

import styles from "./AddItem.module.css";

import Input from "../UI/Input";

const AddItem = (props) => {
  const newItem = useInput((value) => {
    return value.trim().length > 0;
  });

  const addItemHandler = (e) => {
    e.preventDefault();

    if (!props.loading) {
      props.addItem(newItem.value.trim());

      newItem.reset();
    }
  };
  return (
    <base-card>
      <form onSubmit={addItemHandler} className={styles["new-item__input"]}>
        <Input
          style={{ marginTop: "0", marginBottom: "0", width: "100%" }}
          borderRadius="left"
          id="new-item"
          onChange={newItem.inputHandler}
          value={newItem.value}
          button="Add"
          buttonDisabled={!newItem.isValid || props.loading}
        />
      </form>
    </base-card>
  );
};

export default AddItem;
