import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useTMDBWatchlistIds } from "../hooks/useQueries";
import type { TMDBMovie } from "../types/tmdb";
import SectionHeader from "./SectionHeader";
import TMDBMovieCard from "./TMDBMovieCard";

const TMDB_API_KEY = "fadb0b01b6573c9e09695a7b0498aa71";
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-36 sm:w-40 md:w-44">
      <Skeleton className="aspect-[2/3] rounded-md skeleton-shimmer bg-transparent" />
      <Skeleton className="mt-2 h-3 w-3/4 rounded skeleton-shimmer bg-transparent" />
      <Skeleton className="mt-1 h-3 w-1/2 rounded skeleton-shimmer bg-transparent" />
    </div>
  );
}

function useWatchlistMovies(ids: number[]) {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "watchlist", "details", ids.join(",")],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const results = await Promise.all(
        ids.map((id) =>
          fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`,
          ).then((r) => r.json()),
        ),
      );
      return results as TMDBMovie[];
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export default function MyWatchlistRow() {
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: watchlistIds, isLoading: idsLoading } = useTMDBWatchlistIds();
  const ids = (watchlistIds ?? []).map((id) => Number(id));
  const { data: movies, isLoading: moviesLoading } = useWatchlistMovies(ids);

  const isLoading = idsLoading || moviesLoading;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  if (!isLoggedIn) return null;
  if (!isLoading && ids.length === 0) return null;

  return (
    <section className="mb-10 group/row" data-ocid="watchlist_row.section">
      <SectionHeader title="My Watchlist" label="SAVED" />

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
          style={{ overflowY: "visible", WebkitOverflowScrolling: "touch" }}
        >
          {isLoading
            ? SKELETON_KEYS.map((k) => <SkeletonCard key={k} />)
            : (movies ?? []).map((movie, i) => (
                <TMDBMovieCard key={movie.id} movie={movie} index={i + 1} />
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
