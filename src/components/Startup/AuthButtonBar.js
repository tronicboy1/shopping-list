import React from "react";

import styles from "./Startup.module.css";

import Button from "../UI/Button";

const AuthButtonBar = ({ isLogin, setIsLogin }) => {
  const onLoginClick = () => {
    setIsLogin(true);
  };
  const onRegisterClick = () => {
    setIsLogin(false);
  };
  return (
    <div className={styles["button-box"]}>
      <Button
        style={{
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
          backgroundColor: isLogin && "grey", 
          borderColor: isLogin && "grey"
        }}
        onClick={onLoginClick}
      >
        Login
      </Button>
      <Button
        style={{
          borderTopRightRadius: "8px",
          borderBottomRightRadius: "8px",
          backgroundColor: !isLogin && "grey", 
          borderColor: !isLogin && "grey"
        }}
        onClick={onRegisterClick}
      >
        Register
      </Button>
    </div>
  );
};

export default AuthButtonBar;
