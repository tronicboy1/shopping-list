import { useState } from "react";

const useSwipe = (actionLeft, actionRight) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [touchYStart, setTouchYStart] = useState(0);
  const [touchYEnd, setTouchYEnd] = useState(0);

  const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
      setTouchYStart(e.targetTouches[0].clientY);
  };

  const handelTouchMove = (e) => {
      setTouchEnd(touchStart - e.targetTouches[0].clientX);
      const yChange = touchYStart - e.targetTouches[0].clientY;

      setTouchYEnd(Math.abs(yChange) > 50 ? yChange : 0);
  };

  const handleTouchEnd = (e) => {
      if (touchEnd > 100 && !touchYEnd) {
          actionLeft();
      }

      if (touchEnd < -100 && !touchYEnd) {
          actionRight();
      }
      setTouchEnd(0);
      setTouchYEnd(0);
  };

  return { handleTouchStart, handelTouchMove, handleTouchEnd, touchEnd, touchYEnd };
};

export default useSwipe;
