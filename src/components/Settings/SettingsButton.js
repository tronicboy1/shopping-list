import React, { useState } from "react";

import Button from "../UI/Button";
import Settings from "./Settings";

import styles from "./SettingsButton.module.css";

const SettingsButton = () => {
    const [showSettings, setShowSettings] = useState(false);

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