import React from "react";
import useInput from "../../hooks/use-input";

import Card from "../UI/Card";
import Input from "../UI/Input";
import Button from "../UI/Button";

const Startup = (props) => {
  const listName = useInput((value) => {
    return (
      !"!#$%&'*+-/=?^_`{|}~ \"(),:;<>@[\\]"
        .split("")
        .some((char) => value.includes(char)) && value.trim().length > 0
    );
  });

  const submitHandler = (e) => {
    e.preventDefault();

    if (listName.isValid) {
      const inputListName = listName.value.trim();

      props.setListName(inputListName);

      window.localStorage.setItem("listName", inputListName);
    }
  };

  return (
    <>
      <Card>
        <h1 style={{ marginBottom: "0.25rem", textAlign: "center" }}>
          Shared Shopping List App
        </h1>
        <p style={{ marginTop: "0.25rem", textAlign: "center" }}>
          Enter a new list or existing list to get started.
        </p>
      </Card>
      <Card>
        <form onSubmit={submitHandler}>
          <Input
            className={!listName.isValid && listName.touched && "invalid"}
            type="text"
            label="List name"
            value={listName.value}
            onChange={listName.inputHandler}
            onBlur={listName.blurHandler}
            description={
              !listName.isValid &&
              listName.touched &&
              "Must not include spaces or special characters"
            }
          />
          <Button disabled={!listName.isValid}>Submit</Button>
        </form>
      </Card>
    </>
  );
};

export default Startup;
