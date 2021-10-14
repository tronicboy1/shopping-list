import React, { useContext, useState } from "react";
import AppContext from "../../helpers/AppContext";
import Button from "../UI/Button";
import Settings from "./Settings";

import styles from "./SettingsButton.module.css";

const SettingsButton = () => {
    const [showSettings, setShowSettings] = useState(false);
    const context = useContext(AppContext);

    const toggleSettings = () => {
        setShowSettings(prev => !prev);
    };
    return (
        <>
        {showSettings && <Settings toggleSettings={toggleSettings}/>}
        <div className={styles.box}>
            <Button onClick={toggleSettings}>Settings</Button>
        </div>
        </>
    );
};

export default SettingsButton;