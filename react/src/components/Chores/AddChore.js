import React from "react";
import useInput from "../../hooks/use-input";

import styles from "./AddChore.module.css";

import { BaseButton } from "../stencil"
import Input from "../UI/Input";

const AddChore = (props) => {
  //must add date validation later
  const inputDate = useInput((value) => {
    return value.length > 0;
  });
  const name = useInput((value) => {
    return value.trim().length > 0;
  });

  const submitHandler = (e) => {
    e.preventDefault();

    if (formValid) {
      const date = new Date(inputDate.value);
      const choreName = name.value;
      props.addChore(choreName, date);
      name.reset();
    }
  };

  const formValid = name.isValid && inputDate.isValid;

  return (
    <base-card>
      <form className={styles["form-control"]} onSubmit={submitHandler}>
        <div className={styles["input-box"]}>
          <Input
            className={!name.isValid && name.touched && "invalid"}
            type="text"
            onChange={name.inputHandler}
            onBlur={name.blurHandler}
            value={name.value}
          />
          <Input
            className={!inputDate.isValid && inputDate.touched && "invalid"}
            type="date"
            onChange={inputDate.inputHandler}
            onBlur={inputDate.blurHandler}
            value={inputDate.value}
            placeholder="Date"
          />
        </div>
        <div className={styles["button-box"]}>
          <base-button style={{ margin: "0" }} disabled={!formValid} type="submit">
            Add
          </base-button>
        </div>
      </form>
    </base-card>
  );
};

export default AddChore;
