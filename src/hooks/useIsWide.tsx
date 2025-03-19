import { useState, useEffect } from "react";

export function useIsWide(threshold = 425) {
  const [isWide, setIsWide] = useState(typeof window !== "undefined" ? window.innerWidth > threshold : false);

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth > threshold);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [threshold]);

  return isWide;
}
