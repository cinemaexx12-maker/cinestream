import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, RefreshCw, Star } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useTMDBWatchlistIds,
  useTMDBWatchlistMutations,
} from "../hooks/useQueries";
import { TMDB_API_KEY, tmdbImage } from "../services/tmdb";
import { cachedFetch } from "../services/tmdbCache";
import { DEBUG_PLACEHOLDER_MOVIES } from "../services/tmdbDebugMovies";
import type { TMDBMovie } from "../types/tmdb";
import LazyPoster from "./LazyPoster";
import SectionHeader from "./SectionHeader";
import TrailerModal from "./TrailerModal";
import TrailerPreviewCard from "./TrailerPreviewCard";

const SKELETON_KEYS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
];

// Flutter layout constants: SizedBox(height:210), card 140x200, gap 12
const CARD_W = 140;
const CARD_H = 200;
const ROW_H = 210;
const CARD_GAP = 12;

function useTop10Trending() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb-top10-trending"],
    queryFn: async () => {
      const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`;
      console.log("[TMDB] Request started: Top10 trending/week");
      const data = await cachedFetch<{ results: TMDBMovie[] }>(url);
      console.log(
        `[TMDB] State updated: Top10 — ${data.results.length} movies, using top 10`,
      );
      return data.results.slice(0, 10);
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES.slice(0, 5),
  });
}

function SkeletonTop10Card() {
  return (
    <div className="flex-shrink-0" style={{ paddingRight: CARD_GAP }}>
      <Skeleton
        className="rounded-xl skeleton-shimmer bg-white/10"
        style={{ width: CARD_W, height: CARD_H }}
      />
    </div>
  );
}

interface Top10CardProps {
  movie: TMDBMovie;
  rank: number;
  index: number;
  isInWatchlist: boolean;
  onWatchlistToggle: () => void;
  isLoggedIn: boolean;
}

function Top10Card({
  movie,
  rank,
  index,
  isInWatchlist,
  onWatchlistToggle,
  isLoggedIn,
}: Top10CardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);

  const lowSrc = tmdbImage(movie.poster_path, "w200");
  const highSrc = tmdbImage(movie.poster_path, "w342");
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  const handleMoreInfo = () => {
    navigate({ to: "/tmdb/$id", params: { id: movie.id.toString() } });
  };

  return (
    <>
      <TrailerPreviewCard
        movieId={movie.id}
        title={movie.title}
        rating={movie.vote_average}
        onPlay={(key) => setActiveTrailerKey(key)}
        onMoreInfo={handleMoreInfo}
        isInWatchlist={isInWatchlist}
        onWatchlistToggle={onWatchlistToggle}
        isLoggedIn={isLoggedIn}
      >
        <button
          type="button"
          className="flex-shrink-0 cursor-pointer bg-transparent border-0 p-0 text-left"
          style={{ paddingRight: CARD_GAP }}
          data-ocid={`top10_row.item.${index}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleMoreInfo}
          aria-label={`${rank}. ${movie.title}`}
        >
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              width: CARD_W,
              height: CARD_H,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
              boxShadow: hovered
                ? "0 16px 40px rgba(0,0,0,0.8), 0 0 20px rgba(229,9,20,0.25)"
                : "0 3px 8px rgba(0,0,0,0.6)",
            }}
          >
            {lowSrc ? (
              <LazyPoster
                lowSrc={lowSrc}
                highSrc={highSrc}
                alt={movie.title}
                className="absolute inset-0 rounded-xl"
                style={{ width: CARD_W, height: CARD_H }}
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-xs text-center p-2">
                No Image
              </div>
            )}

            {/* Base gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
                pointerEvents: "none",
              }}
            />

            {/* Hover overlay: title + rating */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.25s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "10px 8px",
                pointerEvents: "none",
              }}
            >
              <p
                className="text-white font-semibold leading-tight mb-1"
                style={{ fontSize: "0.7rem" }}
              >
                {movie.title}
              </p>
              <div className="flex items-center gap-1">
                <Star
                  className="text-yellow-400 fill-yellow-400"
                  style={{ width: 10, height: 10 }}
                />
                <span
                  className="text-yellow-400 font-bold"
                  style={{ fontSize: "0.65rem" }}
                >
                  {rating}
                </span>
              </div>
            </div>

            {/* Flutter: Positioned top:8 left:8 — red gradient circular rank badge */}
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                zIndex: 10,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E50914, #B20710)",
                boxShadow: "0 3px 6px rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {rank}
              </span>
            </div>
          </div>
        </button>
      </TrailerPreviewCard>

      <TrailerModal
        trailerKey={activeTrailerKey}
        onClose={() => setActiveTrailerKey(null)}
      />
    </>
  );
}

export default function Top10TrendingRow() {
  const { data: movies, isLoading, isError, refetch } = useTop10Trending();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: watchlistIds } = useTMDBWatchlistIds();
  const { addToTMDBWatchlist, removeFromTMDBWatchlist } =
    useTMDBWatchlistMutations();

  const handleWatchlistToggle = (movieId: number, title: string) => {
    if (!isLoggedIn) {
      toast.info("Sign in to save to your watchlist");
      return;
    }
    const inWatchlist = (watchlistIds ?? []).some(
      (id) => id === BigInt(movieId),
    );
    if (inWatchlist) {
      removeFromTMDBWatchlist.mutate(movieId, {
        onSuccess: () => toast.success("Removed from watchlist"),
      });
    } else {
      addToTMDBWatchlist.mutate(movieId, {
        onSuccess: () => toast.success(`Added "${title}" to watchlist`),
      });
    }
  };

  return (
    <section className="mb-10" data-ocid="top10_row.section">
      <SectionHeader title="Top 10 Trending Today" label="TOP 10" />

      {isError && (
        <div
          className="mx-4 sm:mx-8 mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
          data-ocid="top10_row.error_state"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-300 font-medium">
              Failed to load movies. Please refresh or try again later.
            </p>
          </div>
          <button
            type="button"
            data-ocid="top10_row.retry_button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 flex-shrink-0 rounded-md bg-white/10 hover:bg-white/20 px-3 py-1 text-xs text-white transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {!isError && (
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide px-4 sm:px-8"
          style={{
            height: ROW_H,
            WebkitOverflowScrolling: "touch",
            overflowY: "visible",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          <div
            className="flex"
            style={{ height: ROW_H, alignItems: "flex-start" }}
          >
            {isLoading
              ? SKELETON_KEYS.map((k) => <SkeletonTop10Card key={k} />)
              : (movies ?? []).map((movie, i) => (
                  <Top10Card
                    key={movie.id}
                    movie={movie}
                    rank={i + 1}
                    index={i + 1}
                    isInWatchlist={(watchlistIds ?? []).some(
                      (id) => id === BigInt(movie.id),
                    )}
                    onWatchlistToggle={() =>
                      handleWatchlistToggle(movie.id, movie.title)
                    }
                    isLoggedIn={isLoggedIn}
                  />
                ))}
          </div>
        </div>
      )}
    </section>
  );
}
