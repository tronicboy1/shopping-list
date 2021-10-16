import { useState, useEffect } from "react";

const useDoubleClick = (action) => {
  const [clicked, setClicked] = useState(null);

  //handle click for double tap/click
  const onTileClicked = (item) => {
    if (clicked === item) {
      action(item);
      setClicked(null);
    } else {
      setClicked(item);
    }
  };
  //reset clicked tile cache if longer than a given time
  useEffect(() => {
    setTimeout(() => {
      setClicked(null);
    }, 400);
  }, [clicked]);

  return onTileClicked;
};

export default useDoubleClick;
