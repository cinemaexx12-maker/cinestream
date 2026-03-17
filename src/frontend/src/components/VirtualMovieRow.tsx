import { useEffect, useRef, useState } from "react";
import type { TMDBMovie } from "../types/tmdb";

const INITIAL_COUNT = 10;
const LOAD_MORE_COUNT = 10;

interface VirtualMovieRowProps {
  movies: TMDBMovie[];
  renderCard: (movie: TMDBMovie, index: number) => React.ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function VirtualMovieRow({
  movies,
  renderCard,
  scrollRef: externalScrollRef,
}: VirtualMovieRowProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = externalScrollRef ?? internalScrollRef;

  const visibleMovies = movies.slice(0, visibleCount);
  const moviesLength = movies.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_COUNT, moviesLength),
          );
        }
      },
      {
        root: scrollRef.current,
        rootMargin: "0px 200px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [moviesLength, scrollRef]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-4"
      style={{
        overflowY: "visible",
        WebkitOverflowScrolling: "touch",
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      {visibleMovies.map((movie, i) => renderCard(movie, i + 1))}
      {visibleCount < moviesLength && (
        <div
          ref={sentinelRef}
          className="flex-shrink-0 w-1"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
