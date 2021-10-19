import React, { useCallback, useContext, useEffect, useState } from "react";
import AppContext from "../../helpers/AppContext";
import useDoubleClick from "../../hooks/use-double-click";
import useHttp from "../../hooks/use-http";

import styles from "./Chores.module.css";

import Button from "../UI/Button";
import Card from "../UI/Card";
import AddChore from "./AddChore";
import ChoresLogic from "./ChoresLogic";

const defaultHttpConfig = { uri: null, method: null, body: null };

const Chores = (props) => {
  const context = useContext(AppContext);
  const { choresList, setChoresList } = props;
  const [httpConfig, setHttpConfig] = useState(defaultHttpConfig);
  const { loading, errors, data } = useHttp(httpConfig);
  const [deleteMode, setDeleteMode] = useState(false);
  const doubleClickHandler = useCallback(
    (id) => {
      if (deleteMode) {
        delete data[id];
        setHttpConfig((prev) => ({ ...prev, body: data, method: "PUT" }));
        setChoresList((prev) => prev.filter((chore) => chore.id !== id));
        setDeleteMode(false);
      } else {
        data[id].lastCompleted = new Date().toJSON();
        setHttpConfig((prev) => ({ ...prev, body: data, method: "PUT" }));
        setChoresList((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              item.lastCompleted = new Date();
              return item;
            }
            return item;
          })
        );
      }
    },
    [data, deleteMode, setChoresList]
  );
  const onTileClicked = useDoubleClick(doubleClickHandler);

  //set uri to chores
  useEffect(() => {
    if (context.uri) {
      setHttpConfig((prev) => ({
        ...prev,
        uri: `${context.uri}CHORES.json`,
      }));
    }
  }, [context.uri]);

  //load chores from firebase
  useEffect(() => {
    if (data) {
      const newChores = [];
      for (const name in data) {
        newChores.push({
          id: name,
          title: data[name].title,
          lastCompleted: new Date(data[name].lastCompleted),
        });
        setChoresList(newChores);
      }
    }
  }, [data, setChoresList]);

  const addChore = (title, lastCompleted) => {
    setChoresList((prev) => [
      ...prev,
      { id: "PENDING", title: title, lastCompleted: lastCompleted },
    ]);
    setHttpConfig((prev) => ({
      ...prev,
      method: "POST",
      body: { title: title, lastCompleted: lastCompleted.toJSON() },
    }));
  };

  const toggleDeleteMode = () => {
    if (choresList.length > 0) {
      setDeleteMode((prev) => !prev);
    }
  };

  return (
    <div style={props.style} className={styles['chores-list']}>
      <AddChore addChore={addChore} />
      <Card className={deleteMode ? "delete-mode" : "chores-card"}>
        {errors && <p>{errors}</p>}
        {deleteMode && (
          <Card
            style={{ textAlign: "center", color: "black", background: "white", marginBottom: "1rem" }}
          >
            Double click to delete
          </Card>
        )}
        <ChoresLogic
          list={choresList}
          loading={loading}
          onClick={onTileClicked}
          context={context}
        />
      </Card>
      <Card className="no-text-select">
        <Button
          onClick={toggleDeleteMode}
          disabled={!choresList.length > 0}
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
