import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Clock, Play, Plus, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Movie } from "../backend";

interface HeroBannerProps {
  movies: Movie[];
  isInWatchlist: (id: bigint) => boolean;
  onWatchlistToggle: (movie: Movie) => void;
  isLoggedIn: boolean;
}

export default function HeroBanner({
  movies,
  isInWatchlist,
  onWatchlistToggle,
  isLoggedIn,
}: HeroBannerProps) {
  const [active, setActive] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setFadeKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    setActive((prev) => {
      const idx = (prev + 1) % movies.length;
      setFadeKey((k) => k + 1);
      return idx;
    });
  }, [movies.length]);

  useEffect(() => {
    if (movies.length <= 1) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [movies.length, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setActive((prev) => {
          const idx = (prev + 1) % movies.length;
          setFadeKey((k) => k + 1);
          return idx;
        });
      } else {
        setActive((prev) => {
          const idx = (prev - 1 + movies.length) % movies.length;
          setFadeKey((k) => k + 1);
          return idx;
        });
      }
    }
    touchStartX.current = null;
  };

  if (movies.length === 0) return null;

  const movie = movies[active];
  const thumbnailUrl =
    movie.thumbnailUrl || "/assets/generated/hero-banner.dim_1920x600.jpg";

  return (
    <div
      className="relative w-full min-h-[85vh] flex items-end overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background image with fade transition */}
      <div
        key={fadeKey}
        className="absolute inset-0 bg-center bg-cover hero-slide-enter"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundPosition: "center top",
        }}
      />
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-8 pb-24 pt-32">
        <div key={`content-${fadeKey}`} className="max-w-2xl hero-slide-enter">
          <Badge className="bg-[#e50914] text-white border-0 text-xs font-bold tracking-widest uppercase mb-4">
            Featured
          </Badge>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-none mb-4 tracking-tight">
            {movie.title}
          </h1>
          <div className="flex items-center gap-4 mb-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#e50914] text-[#e50914]" />
              <span className="font-semibold text-white">
                {movie.rating.toFixed(1)}
              </span>
            </span>
            <span>{Number(movie.year)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {Number(movie.duration)}m
            </span>
            <Badge
              variant="outline"
              className="border-white/30 text-white/70 text-xs"
            >
              {movie.genre}
            </Badge>
          </div>
          <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
            {movie.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/movie/$id" params={{ id: movie.id.toString() }}>
              <Button
                data-ocid="hero.play_button"
                className="bg-white hover:bg-white/90 text-black font-bold text-base px-8 h-12 gap-2 rounded-sm"
              >
                <Play className="w-5 h-5 fill-black" /> Play Now
              </Button>
            </Link>
            {isLoggedIn && (
              <Button
                data-ocid="hero.watchlist_button"
                onClick={() => onWatchlistToggle(movie)}
                variant="outline"
                className={`border-white/40 text-white hover:border-white font-semibold text-base px-8 h-12 gap-2 rounded-sm bg-white/10 hover:bg-white/20 ${
                  isInWatchlist(movie.id)
                    ? "border-[#e50914] text-[#e50914]"
                    : ""
                }`}
              >
                <Plus className="w-5 h-5" />{" "}
                {isInWatchlist(movie.id) ? "In My List" : "My List"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {movies.map((m, i) => (
            <button
              key={m.id.toString()}
              type="button"
              data-ocid={`hero.dot.${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-8 bg-[#e50914]"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
