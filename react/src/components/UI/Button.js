import React from "react";
import styles from "./Button.module.css";

const Button = (props) => {
  return (
    <button
      className={`${styles.button} ${styles[props.borderRadius]} ${
        styles[props.className]
      }`}
      onClick={props.onClick}
      type={props.type}
      style={props.style}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default Button;
