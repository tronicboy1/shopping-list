import React from "react";

import ListItem from "../UI/ListItem";

const ListLogic = ({ list, ...props }) => {
  
  if (props.loading && list.length === 0) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }
  if (list.length === 0) {
    return <p style={{ textAlign: "center" }}>No items in shopping list</p>;
  }
  return (
    <ul className={props.styles.list}>
      {list.map((item, index) => (
        <ListItem
          onClick={props.removeClicked.bind(null, item.id)}
          id={item.id}
          key={item.id}
          last={index === 0}
        >
          {item.item}
        </ListItem>
      ))}
    </ul>
  );
};

export default ListLogic;
