import React, { useContext, useRef } from "react";

import styles from "./Settings.module.css";

import Modal from "../UI/Modal";
import Button from "../UI/Button";
import AppContext from "../../helpers/AppContext";

const Settings = (props) => {
  const context = useContext(AppContext);
  const timeZoneRef = useRef(context.timeZone);

  const timeZoneHandler = () => {
    context.setTimeZone(timeZoneRef.current.value);
  };
  return (
    <Modal onClick={props.toggleSettings}>
      <h1 style={{ marginTop: "0" }}>Settings</h1>
      <p>
        Your house name: <strong>{context.houseName}</strong>
      </p>
      <div className={styles.timezone}>
        <label htmlFor="timezone">Timezone</label>
        <select
          value={context.timeZone}
          onChange={timeZoneHandler}
          ref={timeZoneRef}
          name="timezone"
        >
          <option value="Asia/Tokyo">Japan</option>
          <option value="America/New_York">Eastern Time</option>
        </select>
      </div>
      <Button style={{ height: "45px" }} onClick={context.clearHouse}>
        Change House
      </Button>
    </Modal>
  );
};

export default Settings;
