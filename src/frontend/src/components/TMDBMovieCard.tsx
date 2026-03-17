import { useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  useTMDBWatchlistIds,
  useTMDBWatchlistMutations,
} from "../hooks/useQueries";
import { tmdbImage } from "../services/tmdb";
import type { TMDBMovie } from "../types/tmdb";
import LazyPoster from "./LazyPoster";
import TrailerModal from "./TrailerModal";
import TrailerPreviewCard from "./TrailerPreviewCard";

interface TMDBMovieCardProps {
  movie: TMDBMovie;
  index: number;
}

const TMDBMovieCard = React.memo(function TMDBMovieCard({
  movie,
  index,
}: TMDBMovieCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);

  const lowSrc = useMemo(
    () => tmdbImage(movie.poster_path, "w200"),
    [movie.poster_path],
  );
  const highSrc = useMemo(
    () => tmdbImage(movie.poster_path, isMobile ? "w342" : "w500"),
    [movie.poster_path, isMobile],
  );

  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: watchlistIds } = useTMDBWatchlistIds();
  const { addToTMDBWatchlist, removeFromTMDBWatchlist } =
    useTMDBWatchlistMutations();

  const isInWatchlist = useMemo(
    () =>
      isLoggedIn && (watchlistIds ?? []).some((id) => id === BigInt(movie.id)),
    [isLoggedIn, watchlistIds, movie.id],
  );

  const handleWatchlistToggle = useCallback(() => {
    if (!isLoggedIn) {
      toast.info("Sign in to save to your watchlist");
      return;
    }
    if (isInWatchlist) {
      removeFromTMDBWatchlist.mutate(movie.id, {
        onSuccess: () => toast.success("Removed from watchlist"),
      });
    } else {
      addToTMDBWatchlist.mutate(movie.id, {
        onSuccess: () => toast.success(`Added "${movie.title}" to watchlist`),
      });
    }
  }, [
    isLoggedIn,
    isInWatchlist,
    movie.id,
    movie.title,
    addToTMDBWatchlist,
    removeFromTMDBWatchlist,
  ]);

  const handleClick = useCallback(() => {
    navigate({ to: "/tmdb/$id", params: { id: movie.id.toString() } });
  }, [navigate, movie.id]);

  const handleMoreInfo = useCallback(() => {
    navigate({ to: "/tmdb/$id", params: { id: movie.id.toString() } });
  }, [navigate, movie.id]);

  const handlePlay = useCallback((key: string) => {
    setActiveTrailerKey(key);
  }, []);

  return (
    <>
      <TrailerPreviewCard
        movieId={movie.id}
        title={movie.title}
        rating={movie.vote_average}
        onPlay={handlePlay}
        onMoreInfo={handleMoreInfo}
        isInWatchlist={isInWatchlist}
        onWatchlistToggle={handleWatchlistToggle}
        isLoggedIn={isLoggedIn}
      >
        <button
          type="button"
          data-ocid={`tmdb_card.item.${index}`}
          className="group relative flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer text-left bg-transparent border-0 p-0"
          onClick={handleClick}
        >
          <div className="relative overflow-hidden rounded-md bg-secondary aspect-[2/3] card-glow-hover">
            {lowSrc ? (
              <LazyPoster
                lowSrc={lowSrc}
                highSrc={highSrc}
                alt={movie.title}
                className="absolute inset-0 rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary/80 p-4">
                <span className="text-xs text-center font-semibold text-foreground/70 leading-tight">
                  {movie.title}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-4 h-4 fill-white text-white ml-0.5"
                  viewBox="0 0 24 24"
                >
                  <title>Play</title>
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </div>
          </div>

          <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate px-0.5">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 px-0.5">
            <span className="flex items-center gap-0.5 text-xs">
              <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
              <span className="font-semibold text-foreground text-xs">
                {movie.vote_average.toFixed(1)}
              </span>
            </span>
            {movie.release_date && (
              <span className="text-xs text-muted-foreground">
                {movie.release_date.split("-")[0]}
              </span>
            )}
          </div>
        </button>
      </TrailerPreviewCard>

      <TrailerModal
        trailerKey={activeTrailerKey}
        onClose={() => setActiveTrailerKey(null)}
      />
    </>
  );
});

export default TMDBMovieCard;
