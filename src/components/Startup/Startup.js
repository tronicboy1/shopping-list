import React, { useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import useInput from "../../hooks/use-input";

//import styles from "./Startup.module.css";

import Card from "../UI/Card";
import Input from "../UI/Input";
import Button from "../UI/Button";
import AppContext from "../../helpers/AppContext";
import AuthButtonBar from "./AuthButtonBar";

const Startup = () => {
  const { auth, setUser } = useContext(AppContext);
  const [status, setStatus] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const email = useInput((value) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  });
  const pass = useInput((value) => value.trim().length > 7);

  useEffect(() => {
    return () => {
      setStatus(null);
    };
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();

    if (email.isValid && pass.isValid) {
      setStatus("Loading...");
      const emailVal = email.value.trim().toLowerCase();
      const passVal = pass.value.trim();
      if (isLogin) {
        signInWithEmailAndPassword(auth, emailVal, passVal)
          .then((cred) => {
            console.log(cred.user);
            setUser(cred.user);
            setStatus("Success!");
          })
          .catch((e) => {
            if (e.code === 400) {
              setStatus("Invalid Credentials");
            } else {
              setStatus(e.message);
            }
          });
      } else {
        createUserWithEmailAndPassword(auth, emailVal, passVal)
          .then((cred) => {
            console.log(cred.user);
            setUser(cred.user);
            setStatus("Success!");
          })
          .catch((e) => {
            if (e.code === 400) {
              setStatus("Invalid Credentials");
            } else {
              setStatus(e.message);
            }
          });
      }
    }
  };

  return (
    <>
      <Card>
        <h1 style={{ marginBottom: "0.25rem", textAlign: "center" }}>
          The House App
        </h1>
        <p style={{ marginTop: "0.25rem", textAlign: "center" }}>
          Login to get started!
        </p>
      </Card>
      <Card>
        <AuthButtonBar isLogin={isLogin} setIsLogin={setIsLogin} />

        <form onSubmit={submitHandler}>
          <Input
            className={!email.isValid && email.touched && "invalid"}
            type="email"
            label="Email"
            placeholder="mail@email.com"
            value={email.value}
            onChange={email.inputHandler}
            onBlur={email.blurHandler}
            description={
              !email.isValid &&
              email.touched &&
              "Must not include spaces or special characters"
            }
          />
          <Input
            className={!pass.isValid && pass.touched && "invalid"}
            type="password"
            label="Password"
            value={pass.value}
            onChange={pass.inputHandler}
            onBlur={pass.blurHandler}
            description={
              !pass.isValid &&
              pass.touched &&
              "Must not include spaces or special characters"
            }
          />
          <Button disabled={!email.isValid || !pass.isValid}>
            {status ? status : isLogin ? "Login" : "Register"}
          </Button>
        </form>
      </Card>
    </>
  );
};

export default Startup;
