import React, { useState, useContext } from "react";
import AppContext from "../../helpers/AppContext";

import Button from "../UI/Button";
import Settings from "./Settings";

import styles from "./SettingsButton.module.css";
import SettingsImage from "../../img/settings-128.png";
import ChoresImage from "../../img/broom.png";
import ShoppingImage from "../../img/cart.png";

const SettingsButton = () => {
  const [showSettings, setShowSettings] = useState(false);
  const context = useContext(AppContext);

  const selectedBGColor = "rgb(48, 209, 88)";
  const choresColor = "rgb(94, 92,230)";

  const listButtonStyle = {
    background: context.appMode === "SHOPPING" && selectedBGColor,
    borderColor: context.appMode === "SHOPPING" && selectedBGColor,
    cursor: context.appMode === "SHOPPING" && "default",
    borderTopRightRadius: "0",
  };

  const choresButtonStyle = {
    background: context.appMode === "CHORES" && choresColor,
    borderColor: context.appMode === "CHORES" && choresColor,
    cursor: context.appMode === "CHORES" && "default",
    borderRadius: "0"
  };

  const settingsButtonStyle = {
      borderTopLeftRadius: "0"
  }

  const clickShoppingList = () => {
      context.setAppMode("SHOPPING");
  };

  const clickChores = () => {
      context.setAppMode("CHORES");
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };
  return (
    <>
      {showSettings && <Settings toggleSettings={toggleSettings} />}
      <div className={styles.box}>
        <Button onClick={clickShoppingList} style={listButtonStyle}>
        <img src={ShoppingImage} alt="Shopping" />
        </Button>
        <Button onClick={clickChores} style={choresButtonStyle}>
        <img src={ChoresImage} alt="Chores" />
        </Button>
        <Button onClick={toggleSettings} style={settingsButtonStyle}><img src={SettingsImage} alt="Settings" /></Button>
      </div>
    </>
  );
};

export default SettingsButton;
