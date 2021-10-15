import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../helpers/AppContext";
import useHttp from "../../hooks/use-http";
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

  //set uri to chores
  useEffect(() => {
    if (context.appMode === "CHORES") {
      setHttpConfig((prev) => ({
        ...prev,
        uri: context.uri + "CHORES" + ".json",
      }));
    }
  }, [context.uri, context.appMode]);

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

  console.log(httpConfig.uri);

  return (
    <div style={{ marginBottom: "6rem" }}>
      <AddChore addChore={addChore} />
      <Card>
        <ChoresLogic
          list={choresList}
          loading={loading}
          onClick={(id) => {
            console.log(id);
          }}
          context={context}
        />
      </Card>
      <Card>
        <Button style={{ margin: "0", height: "50px" }}>Delete Mode</Button>
      </Card>
    </div>
  );
};

export default Chores;
