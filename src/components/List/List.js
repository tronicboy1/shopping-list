import React from "react";

import Card from "../UI/Card";
import Button from "../UI/Button";
import AddItem from "./AddItem";
import ListItem from "./ListItem";

const List = (props) => {
    const changeList = () => {
        props.setListName(null);
        window.localStorage.removeItem('listName');
    };
    return (
        <>
        <AddItem />
        <Card></Card>
        <Card>
            <p style={{margin: "0.2rem"}}>Current list: {props.listName}</p>
            <Button style={{ height: "45px" }} onClick={changeList}>Change List</Button>
        </Card>
        </>
    );
};

export default List;