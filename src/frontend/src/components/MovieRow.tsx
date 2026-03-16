import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Movie } from "../backend";
import MovieCard from "./MovieCard";

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
];

interface MovieRowProps {
  title: string;
  movies: Movie[];
  watchlistIds?: bigint[];
  continueWatching?: [bigint, bigint][];
  onWatchlistToggle?: (movie: Movie) => void;
  isLoggedIn?: boolean;
  isLoading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-40 sm:w-44 md:w-48">
      <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
      <div className="mt-2 h-3 w-3/4 rounded skeleton-shimmer" />
    </div>
  );
}

export default function MovieRow({
  title,
  movies,
  watchlistIds = [],
  continueWatching = [],
  onWatchlistToggle,
  isLoggedIn = false,
  isLoading = false,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };
  const continueMap = new Map(
    continueWatching.map(([id, prog]) => [id.toString(), Number(prog)]),
  );
  if (!isLoading && movies.length === 0) return null;
  return (
    <section className="mb-10 group/row">
      <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-4 px-4 sm:px-8">
        {title}
      </h2>
      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
        </button>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-4"
        >
          {isLoading
            ? SKELETON_KEYS.map((k) => <SkeletonCard key={k} />)
            : movies.map((movie, i) => (
                <MovieCard
                  key={movie.id.toString()}
                  movie={movie}
                  index={i + 1}
                  progress={continueMap.get(movie.id.toString())}
                  isInWatchlist={watchlistIds.some((id) => id === movie.id)}
                  onWatchlistToggle={onWatchlistToggle}
                  isLoggedIn={isLoggedIn}
                />
              ))}
        </div>
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>
    </section>
  );
}
