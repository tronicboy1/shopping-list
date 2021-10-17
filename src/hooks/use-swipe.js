import { useState } from "react";

const useSwipe = (actionLeft, actionRight) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [touchYStart, setTouchYStart] = useState(0);
  const [yScrolled, setYScrolled] = useState(false);
  const [xChange, setXChange] = useState(0);
  const [xChangeInterval, setXChangeInterval] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchYStart(e.targetTouches[0].clientY);
  };

  const handelTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (Math.abs(touchYStart - e.targetTouches[0].clientY) > 60) {
      setYScrolled(true);
      setXChange(0);
    }
    //only update xchange every 100 ms to avoid errors
    if (
      Math.abs(touchStart - touchEnd) > 10 &&
      touchEnd &&
      !xChange &&
      !yScrolled
    ) {
      setXChange(touchEnd - touchStart);
      setXChangeInterval(Date.now());
    }
    if (xChange) {
      const timeChange = Date.now() - xChangeInterval;
      if (timeChange > 10) {
        setXChange((prev) => (prev + (touchEnd - touchStart)) / 2);
        setXChangeInterval(Date.now());
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchEnd - touchStart < -80 && !yScrolled && touchEnd) {
      actionLeft();
    }

    if (touchEnd - touchStart > 80 && !yScrolled && touchEnd) {
      actionRight();
    }
    setTouchEnd(0);
    setTouchStart(0);
    setYScrolled(false);
    setXChange((prev) => prev / 2);
    setTimeout(() => {
      setXChange((prev) => prev / 2);
    }, 5);
    setTimeout(() => {
      setXChange(0);
    }, 10);
  };

  return { handleTouchStart, handelTouchMove, handleTouchEnd, xChange };
};

export default useSwipe;
