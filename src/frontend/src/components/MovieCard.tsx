import { Badge } from "@/components/ui/badge";
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
  isPremium?: boolean;
}

export default function MovieCard({
  movie,
  index,
  progress,
  isInWatchlist = false,
  onWatchlistToggle,
  isLoggedIn = false,
  isPremium,
}: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showRemainingTime, setShowRemainingTime] = useState(false);
  const thumbnailUrl =
    movie.thumbnailUrl && !imgError
      ? movie.thumbnailUrl
      : `https://picsum.photos/seed/${movie.id}/300/450`;

  const showPremiumBadge = isPremium ?? movie.isPremium;

  // Calculate remaining time: duration is in minutes (bigint), progress is percentage 0–100
  const remainingMins =
    progress !== undefined && progress > 0 && movie.duration
      ? Math.max(0, Math.round(Number(movie.duration) * (1 - progress / 100)))
      : null;

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWatchlistToggle?.(movie);
  };

  return (
    <div
      data-ocid={`movie_card.item.${index}`}
      className="group relative flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to="/movie/$id" params={{ id: movie.id.toString() }}>
        {/* Thumbnail */}
        <div className="relative overflow-hidden rounded-md bg-secondary aspect-[2/3] card-glow-hover">
          <img
            src={thumbnailUrl}
            alt={movie.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Gradient overlay on poster */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Premium badge */}
          {showPremiumBadge && (
            <div className="absolute top-2 right-2 z-10">
              <span
                className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FF6B00 100%)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                PREMIUM
              </span>
            </div>
          )}

          {/* Progress bar with remaining time tooltip */}
          {progress !== undefined && progress > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0"
              onMouseEnter={() => setShowRemainingTime(true)}
              onMouseLeave={() => setShowRemainingTime(false)}
            >
              {showRemainingTime &&
                remainingMins !== null &&
                remainingMins > 0 && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap pointer-events-none"
                    style={{
                      background: "rgba(10,10,10,0.92)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(8px)",
                      zIndex: 10,
                    }}
                  >
                    {remainingMins}m remaining
                  </div>
                )}
              <div className="h-1 bg-white/20">
                <div
                  className="h-full bg-[#e50914] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Center play icon on hover */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm">
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Title below card */}
        <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate px-0.5">
          {movie.title}
        </p>
      </Link>

      {/* Expanded hover panel */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-50 w-60 bg-card border border-border rounded-lg shadow-2xl overflow-hidden transition-all duration-200 origin-top ${
          hovered
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{
          boxShadow: "0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(229,9,20,0.2)",
        }}
      >
        <div className="relative h-28 overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-1 mb-2">
            <p className="font-display font-bold text-foreground text-sm leading-tight line-clamp-1">
              {movie.title}
            </p>
            {showPremiumBadge && (
              <span
                className="text-[8px] font-black tracking-wider px-1 py-0.5 rounded flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FF6B00 100%)",
                  color: "#000",
                }}
              >
                PREMIUM
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className="flex items-center gap-0.5 text-xs">
              <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
              <span className="font-semibold text-foreground">
                {movie.rating.toFixed(1)}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {Number(movie.year)}
            </span>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-[#e50914]/20 text-[#e50914] border-[#e50914]/30 border">
              {movie.genre}
            </Badge>
          </div>
          {/* Show remaining time in hover panel if available */}
          {remainingMins !== null && remainingMins > 0 && (
            <p className="text-xs text-[#e50914] font-semibold mb-2">
              {remainingMins}m remaining
            </p>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {movie.description}
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/movie/$id"
              params={{ id: movie.id.toString() }}
              className="flex-1"
            >
              <button
                type="button"
                className="w-full flex items-center justify-center gap-1.5 bg-white text-black text-xs font-bold rounded h-7 hover:bg-white/90 transition-colors"
              >
                <Play className="w-3 h-3 fill-black" /> Play
              </button>
            </Link>
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleWatchlistClick}
                data-ocid={`movie_card.toggle.${index}`}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                  isInWatchlist
                    ? "border-[#e50914] bg-[#e50914]/20 text-[#e50914]"
                    : "border-border text-muted-foreground hover:border-white hover:text-white"
                }`}
              >
                {isInWatchlist ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
