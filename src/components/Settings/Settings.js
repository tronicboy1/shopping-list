import React, { useContext } from "react";

import Modal from "../UI/Modal";
import Button from "../UI/Button";
import AppContext from "../../helpers/AppContext";

const Settings = (props) => {
  const context = useContext(AppContext);
  return (
    <Modal onClick={props.toggleSettings}>
      <h1 style={{ marginTop: "0" }}>Settings</h1>
      <h3>Your house name: {context.houseName}</h3>
      <Button style={{ height: "45px" }} onClick={context.clearHouse}>
        Change House
      </Button>
    </Modal>
  );
};

export default Settings;
