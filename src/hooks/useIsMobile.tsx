"use client";
import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Update state on mount and whenever the window is resized
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
