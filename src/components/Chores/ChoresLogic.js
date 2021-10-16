import React from "react";

import ListItem from "../UI/ListItem";

const weekOld = (date) => {
  const limit = 7;
  const currentTime = new Date();
  const milsecInDay = (1000 * 60 * 60 * 24);
  const dayDifference = Math.round((currentTime.getTime() - date.getTime())/milsecInDay);
  return dayDifference > limit;
};

const ChoresLogic = (props) => {

  const choresSorted = props.list.sort((a,b) => {return a.lastCompleted - b.lastCompleted;});
  if (props.loading && props.list.length === 0) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }
  if (props.list.length === 0) {
    return <p style={{ textAlign: "center" }}>No chores</p>;
  }
  return (
    <ul style={{ listStyleType: "none", padding: "0" }}>
      {choresSorted.map((chore) => (
        <ListItem className={weekOld(chore.lastCompleted) && "warning"} onClick={props.onClick.bind(null, chore.id)} key={chore.id}>
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
