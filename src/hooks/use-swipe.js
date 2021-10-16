import { useState } from "react";

const useSwipe = (actionLeft, actionRight) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
  };

  const handelTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
      if (touchStart - touchEnd > 150) {
          actionLeft();
      }

      if (touchStart - touchEnd < -150) {
          actionRight();
      }
  };

  return { handleTouchStart, handelTouchMove, handleTouchEnd };
};

export default useSwipe;
