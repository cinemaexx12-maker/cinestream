import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { useLazyImage } from "../hooks/useLazyImage";

interface LazyPosterProps {
  lowSrc: string;
  highSrc: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const LazyPoster = React.memo(function LazyPoster({
  lowSrc,
  highSrc,
  alt,
  className = "",
  style,
}: LazyPosterProps) {
  const { ref, src, isLoaded } = useLazyImage(lowSrc, highSrc);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {!isLoaded && (
        <Skeleton className="absolute inset-0 skeleton-shimmer bg-transparent" />
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          decoding="async"
        />
      )}
    </div>
  );
});

export default LazyPoster;
