import React, { useCallback, useContext, useState } from "react";
import AppContext from "../../helpers/AppContext";
import useFirebase from "../../hooks/use-firebase";
import useDoubleClick from "../../hooks/use-double-click";

import styles from "./Chores.module.css";

import Button from "../UI/Button";
import Card from "../UI/Card";
import AddChore from "./AddChore";
import ChoresLogic from "./ChoresLogic";

const Chores = (props) => {
  const { user } = useContext(AppContext);
  const { list, errors, data, loading, remove, writeData, addData } = useFirebase(
    user.uid,
    "CHORES",
    (name, data) => ({
      id: name,
      title: data[name].title,
      lastCompleted: new Date(data[name].lastCompleted),
    })
  );
  const [deleteMode, setDeleteMode] = useState(false);
  const doubleClickHandler = useCallback((id) => {
    if (deleteMode) {
      remove(id);
    } else {
      writeData(id, { ...data[id], lastCompleted: new Date().toJSON() });
    }
  }, [data, deleteMode, remove, writeData]);
  const onTileClicked = useDoubleClick(doubleClickHandler);

  const addChore = (title, lastCompleted) => {
    addData({
      title,
      lastCompleted: lastCompleted.toJSON()
    })
  };

  const toggleDeleteMode = () => {
    if (list.length > 0) {
      setDeleteMode((prev) => !prev);
    }
  };

  return (
    <div style={props.style} className={styles["chores-list"]}>
      <AddChore addChore={addChore} />
      <Card className={deleteMode ? "delete-mode" : "chores-card"}>
        {errors && <p>{errors}</p>}
        {deleteMode && (
          <Card
            style={{
              textAlign: "center",
              color: "black",
              background: "white",
              marginBottom: "1rem",
              borderColor: "white",
            }}
          >
            Double click to delete
          </Card>
        )}
        <ChoresLogic list={list} loading={loading} onClick={onTileClicked} />
      </Card>
      <Card className="no-text-select">
        <Button
          onClick={toggleDeleteMode}
          disabled={!list.length > 0}
          style={{
            margin: "0",
            height: "50px",
            background: deleteMode && "rgb(59, 59, 59)",
            borderColor: deleteMode && "rgb(59, 59, 59)",
          }}
        >
          Delete Mode
        </Button>
      </Card>
    </div>
  );
};

export default Chores;
