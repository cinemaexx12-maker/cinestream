import { useEffect, useRef, useState } from "react";

interface UseLazyImageResult {
  ref: React.RefObject<HTMLDivElement | null>;
  src: string;
  isLoaded: boolean;
}

export function useLazyImage(
  lowSrc: string,
  highSrc: string,
): UseLazyImageResult {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState(lowSrc || "");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !highSrc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const img = new Image();
          img.src = highSrc;
          img.onload = () => {
            setSrc(highSrc);
            setIsLoaded(true);
          };
          img.onerror = () => {
            setSrc(lowSrc || "");
            setIsLoaded(true);
          };
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [highSrc, lowSrc]);

  return { ref, src, isLoaded };
}
