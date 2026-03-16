import { Link } from "@tanstack/react-router";
import { Check, Play, Plus, Star } from "lucide-react";
import { useState } from "react";
import type { Movie } from "../backend";

interface MovieCardProps {
  movie: Movie;
  index: number;
  progress?: number;
  isInWatchlist?: boolean;
  onWatchlistToggle?: (movie: Movie) => void;
  isLoggedIn?: boolean;
}

export default function MovieCard({
  movie,
  index,
  progress,
  isInWatchlist = false,
  onWatchlistToggle,
  isLoggedIn = false,
}: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const thumbnailUrl =
    movie.thumbnailUrl && !imgError
      ? movie.thumbnailUrl
      : `https://picsum.photos/seed/${movie.id}/300/450`;

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWatchlistToggle?.(movie);
  };

  return (
    <div
      data-ocid={`movie_card.item.${index}`}
      className="group relative flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer"
    >
      <Link to="/movie/$id" params={{ id: movie.id.toString() }}>
        <div className="relative overflow-hidden rounded-md bg-secondary aspect-[2/3] transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-card-hover">
          <img
            src={thumbnailUrl}
            alt={movie.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-[#e50914]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleWatchlistClick}
                className={`self-end w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isInWatchlist ? "bg-[#e50914] text-white" : "bg-white/20 text-white hover:bg-white/40"}`}
              >
                {isInWatchlist ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-white font-semibold text-xs leading-tight line-clamp-2 mb-1">
                {movie.title}
              </p>
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
                <span>{movie.rating.toFixed(1)}</span>
                <span className="text-white/40">•</span>
                <span>{Number(movie.year)}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate px-0.5">
          {movie.title}
        </p>
      </Link>
    </div>
  );
}
