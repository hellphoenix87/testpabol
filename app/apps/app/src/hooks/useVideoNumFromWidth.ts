import { useEffect, useState } from "react";

import Breakpoints from "../constants/Breakpoints";

function useVideoNumFromWidth({
  breakpoints = [
    { width: Breakpoints.SM, videoNum: 2 },
    { width: Breakpoints.MD, videoNum: 4 },
    { width: Breakpoints.LG, videoNum: 8 },
    { width: Breakpoints.XL, videoNum: 12 },
    { width: Breakpoints.XXL, videoNum: 12 },
  ],
  defaultVideoNum = 20,
} = {}) {
  const [videoNum, setVideoNum] = useState(getVideoNumFromWidth());

  function getVideoNumFromWidth() {
    const currentBreakpoint = breakpoints.find(breakpoint => breakpoint.width > window.innerWidth);
    return currentBreakpoint?.videoNum ?? defaultVideoNum;
  }

  useEffect(() => {
    const handleResize = () => {
      setVideoNum(getVideoNumFromWidth());
    };
    // Display a different number of videos depending on the screen size Tailwind CSS breakpoints.
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return videoNum;
}

export default useVideoNumFromWidth;
