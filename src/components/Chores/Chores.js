import React, { useContext } from "react";
import { useEffect } from "react/cjs/react.development";
import AppContext from "../../helpers/AppContext";
import Card from "../UI/Card";
import ListItem from "../UI/ListItem";

const Chores = (props) => {
  const context = useContext(AppContext);
  const { choresList, setChoresList } = props;

  useEffect(() => {
    setChoresList([
      {
        title: "Clean Toilet",
        lastCompleted: new Date("2021-10-14"),
      },
    ]);
  }, []);

  console.log(choresList[0]);

  return (
    <>
      <Card>Add chore</Card>
      <Card>
        <ul style={{listStyleType: "none", padding: "0"}}>
          {choresList.map((chore) => (
            <ListItem>
              <p>{chore.title}</p>
              <small>{chore.lastCompleted.toLocaleString({timeZone: context.timeZone})}</small>
            </ListItem>
          ))}
        </ul>
      </Card>
      <Card>
          Delete Mode
      </Card>
    </>
  );
};

export default Chores;
