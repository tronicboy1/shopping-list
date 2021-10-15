import React from "react";

import ListItem from "../UI/ListItem";

const ChoresLogic = (props) => {
  if (props.loading && props.list.length === 0) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }
  if (props.list.length === 0) {
    return <p style={{ textAlign: "center" }}>No chores added</p>;
  }
  return (
    <ul style={{ listStyleType: "none", padding: "0" }}>
      {props.list.map((chore) => (
        <ListItem onClick={props.onClick.bind(null, chore.id)} key={chore.id}>
          <p>{chore.title}</p>
          <small>
            {chore.lastCompleted.toLocaleDateString({
              timeZone: props.context.timeZone,
            })}
          </small>
        </ListItem>
      ))}
    </ul>
  );
};

export default ChoresLogic;
