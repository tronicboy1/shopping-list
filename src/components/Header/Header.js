import React, { useContext } from "react";
import AppContext from "../../helpers/AppContext";
import Button from "../UI/Button";

import styles from "./Header.module.css";

const Header = () => {
  const context = useContext(AppContext);

  const selectedBGColor = "rgb(0, 59, 5)";
  const choresColor = "#270053";

  const listButtonStyle = {
    borderBottomLeftRadius: "8px",
    background: context.appMode === "SHOPPING" && selectedBGColor,
    borderColor: context.appMode === "SHOPPING" && selectedBGColor,
    cursor: context.appMode === "SHOPPING" && "default",
  };

  const choresButtonStyle = {
    borderBottomRightRadius: "8px",
    background: context.appMode === "CHORES" && choresColor,
    borderColor: context.appMode === "CHORES" && choresColor,
    cursor: context.appMode === "CHORES" && "default",
  };

  const clickShoppingList = () => {
      context.setAppMode("SHOPPING");
  };

  const clickChores = () => {
      context.setAppMode("CHORES");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles["button-bar"]}>
        <Button onClick={clickShoppingList} style={listButtonStyle}>
          Shopping List
        </Button>
        <Button onClick={clickChores} style={choresButtonStyle}>
          Chores
        </Button>
      </div>
    </nav>
  );
};

export default Header;
