import React, { useContext } from "react";
import useInput from "../../hooks/use-input";

import Card from "../UI/Card";
import Input from "../UI/Input";
import Button from "../UI/Button";
import AppContext from "../../helpers/AppContext";

const Startup = () => {
  const context = useContext(AppContext);
  const houseName = useInput((value) => {
    return (
      !"!#$%&'*+-/=?^_`{|}~ \"(),:;<>@[\\]"
        .split("")
        .some((char) => value.includes(char)) && value.trim().length > 0
    );
  });

  const submitHandler = (e) => {
    e.preventDefault();

    if (houseName.isValid) {
      const inputHouseName = houseName.value.trim();

      context.setHouseName(inputHouseName);
      context.setAppMode("SHOPPING");
    }
  };

  return (
    <>
      <Card>
        <h1 style={{ marginBottom: "0.25rem", textAlign: "center" }}>
          The House App
        </h1>
        <p style={{ marginTop: "0.25rem", textAlign: "center" }}>
          Enter your house name to get started!
        </p>
      </Card>
      <Card>
        <form onSubmit={submitHandler}>
          <Input
            className={!houseName.isValid && houseName.touched && "invalid"}
            type="text"
            label="House name"
            placeholder="Gryffindor"
            value={houseName.value}
            onChange={houseName.inputHandler}
            onBlur={houseName.blurHandler}
            description={
              !houseName.isValid &&
              houseName.touched &&
              "Must not include spaces or special characters"
            }
          />
          <Button disabled={!houseName.isValid}>Submit</Button>
        </form>
      </Card>
    </>
  );
};

export default Startup;
