import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useRef } from "react";
import type { TMDBMovie } from "../types/tmdb";
import SectionHeader from "./SectionHeader";
import TMDBMovieCard from "./TMDBMovieCard";
import VirtualMovieRow from "./VirtualMovieRow";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 w-36 sm:w-40 md:w-44"
      data-ocid="tmdb_card.loading_state"
    >
      <Skeleton className="aspect-[2/3] rounded-md skeleton-shimmer bg-white/10" />
      <Skeleton className="mt-2 h-3 w-3/4 rounded skeleton-shimmer bg-white/10" />
      <Skeleton className="mt-1 h-3 w-1/2 rounded skeleton-shimmer bg-white/10" />
    </div>
  );
}

interface TMDBMovieRowUIProps {
  title: string;
  label?: string;
  movies: TMDBMovie[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function TMDBMovieRowUI({
  title,
  label,
  movies,
  isLoading,
  isError,
  onRetry,
}: TMDBMovieRowUIProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-10 group/row" data-ocid="tmdb_row.section">
      <SectionHeader title={title} label={label} />

      {isError && (
        <div
          className="mx-4 sm:mx-8 mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
          data-ocid="tmdb_row.error_state"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-300 font-medium">
              Failed to load movies. Please refresh or try again later.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              data-ocid="tmdb_row.retry_button"
              onClick={onRetry}
              className="flex items-center gap-1.5 flex-shrink-0 rounded-md bg-white/10 hover:bg-white/20 px-3 py-1 text-xs text-white transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {!isError && (
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

          {isLoading ? (
            <div
              className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-4"
              style={{ overflowY: "visible" }}
            >
              {SKELETON_KEYS.map((k) => (
                <SkeletonCard key={k} />
              ))}
            </div>
          ) : (
            <VirtualMovieRow
              movies={movies ?? []}
              scrollRef={scrollRef}
              renderCard={(movie, i) => (
                <TMDBMovieCard key={movie.id} movie={movie} index={i} />
              )}
            />
          )}

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
      )}
    </section>
  );
}
