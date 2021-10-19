import React from "react";

import styles from "./ListItem.module.css";

const ListItem = (props) => {
  const lastItemStyle = { marginBottom: "0" };

  return (
    <li
      style={ props.last ? lastItemStyle : {} }
      onClick={props.onClick}
      className={`${styles["list-item"]} ${styles[props.className]}`}
    >
      {props.children}
    </li>
  );
};

export default ListItem;
