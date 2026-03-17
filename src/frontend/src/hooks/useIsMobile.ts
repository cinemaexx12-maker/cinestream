import { useEffect, useState } from "react";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(hover: none)").matches || window.innerWidth < 768
    );
  });

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const handler = () => setIsMobile(mq.matches || window.innerWidth < 768);
    mq.addEventListener("change", handler);
    window.addEventListener("resize", handler);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return isMobile;
}
