import { useState } from "react";

const useSwipe = (actionLeft, actionRight) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
  };

  const handelTouchMove = (e) => {
      setTouchEnd(touchStart - e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
      if (touchEnd > 150) {
          actionLeft();
      }

      if (touchEnd < -150) {
          actionRight();
      }
      setTouchEnd(0);
  };

  return { handleTouchStart, handelTouchMove, handleTouchEnd, touchEnd };
};

export default useSwipe;
