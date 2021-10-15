import React from "react";
import useInput from "../../hooks/use-input";

import styles from "./AddChore.module.css";

import Button from "../UI/Button";
import Card from "../UI/Card";
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
      console.log(date);
      props.addChore(choreName, date);
    }
  };

  const formValid = name.isValid && inputDate.isValid;

  return (
    <Card>
      <form className={styles['form-control']} onSubmit={submitHandler}>
        <div className={styles['input-box']}>
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
          />
        </div>
        <div className={styles['button-box']}>
        <Button style={{ margin: "0" }} disabled={!formValid} type="submit">
          Add
        </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddChore;
