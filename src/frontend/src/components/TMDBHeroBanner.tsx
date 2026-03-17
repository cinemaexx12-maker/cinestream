import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Clock, Info, Play, Star, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cachedFetch } from "../services/tmdbCache";

const API_KEY = "fadb0b01b6573c9e09695a7b0498aa71";

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

export default function TMDBHeroBanner() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`;
        const data = await cachedFetch<{ results: { id: number }[] }>(
          trendingUrl,
        );
        const top5 = data.results.slice(0, 5);
        const detailed = await Promise.all(
          top5.map((m) =>
            cachedFetch<TMDBMovie>(
              `https://api.themoviedb.org/3/movie/${m.id}?api_key=${API_KEY}`,
            ),
          ),
        );
        setMovies(detailed);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

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

  const handlePlayTrailer = useCallback(async () => {
    if (!movies[active]) return;
    setTrailerLoading(true);
    try {
      const data = await cachedFetch<{
        results: { site: string; type: string; key: string }[];
      }>(
        `https://api.themoviedb.org/3/movie/${movies[active].id}/videos?api_key=${API_KEY}`,
      );
      const trailer = data.results.find(
        (v) => v.site === "YouTube" && v.type === "Trailer",
      );
      if (trailer) {
        setTrailerUrl(
          `https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`,
        );
      } else {
        toast.error("Trailer not available");
      }
    } catch {
      toast.error("Failed to load trailer");
    } finally {
      setTrailerLoading(false);
    }
  }, [movies, active]);

  const closeTrailer = useCallback(() => setTrailerUrl(null), []);

  if (loading) {
    return (
      <div
        data-ocid="tmdb_hero.loading_state"
        className="relative w-full min-h-[85vh] overflow-hidden"
      >
        <Skeleton className="absolute inset-0 skeleton-shimmer bg-white/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute bottom-24 left-8 space-y-4">
          <Skeleton className="h-12 w-72 skeleton-shimmer bg-white/10 rounded" />
          <Skeleton className="h-5 w-96 skeleton-shimmer bg-white/10 rounded" />
          <Skeleton className="h-5 w-80 skeleton-shimmer bg-white/10 rounded" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-36 skeleton-shimmer bg-white/10 rounded" />
            <Skeleton className="h-12 w-36 skeleton-shimmer bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  const movie = movies[active];
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
  const displayGenres = movie.genres?.slice(0, 3) ?? [];

  return (
    <>
      <div
        className="relative w-full min-h-[85vh] flex items-end overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={fadeKey}
          className="absolute inset-0 bg-center bg-cover hero-slide-enter"
          style={{
            backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
            backgroundPosition: "center top",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

        <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-8 pb-24 pt-32">
          <div
            key={`content-${fadeKey}`}
            className="max-w-2xl hero-slide-enter"
          >
            <Badge className="bg-[#e50914] text-white border-0 text-xs font-bold tracking-widest uppercase mb-4">
              Featured
            </Badge>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-none mb-4 tracking-tight">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#e50914] text-[#e50914]" />
                <span className="font-semibold text-white">
                  {movie.vote_average.toFixed(1)}
                </span>
              </span>
              {year && <span>{year}</span>}
              {movie.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {movie.runtime}m
                </span>
              )}
              {displayGenres.map((g) => (
                <Badge
                  key={g.id}
                  variant="outline"
                  className="border-white/30 text-white/70 text-xs"
                >
                  {g.name}
                </Badge>
              ))}
            </div>
            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-xl line-clamp-3">
              {movie.overview}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                data-ocid="tmdb_hero.play_button"
                onClick={handlePlayTrailer}
                disabled={trailerLoading}
                className="bg-white hover:bg-white/90 text-black font-bold text-base px-8 h-12 gap-2 rounded-sm"
              >
                <Play className="w-5 h-5 fill-black" />
                {trailerLoading ? "Loading..." : "Play Trailer"}
              </Button>
              <Link to="/tmdb/$id" params={{ id: movie.id.toString() }}>
                <Button
                  data-ocid="tmdb_hero.info_button"
                  variant="outline"
                  className="border-white/40 text-white hover:border-white font-semibold text-base px-8 h-12 gap-2 rounded-sm bg-white/10 hover:bg-white/20"
                >
                  <Info className="w-5 h-5" /> More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        {movies.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {movies.map((m, i) => (
              <button
                key={m.id}
                type="button"
                data-ocid={`tmdb_hero.dot.${i + 1}`}
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

      {trailerUrl && (
        <div
          data-ocid="tmdb_hero.trailer_modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        >
          <button
            type="button"
            aria-label="Close trailer"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={closeTrailer}
          />
          <div className="relative w-full max-w-4xl mx-4 z-10">
            <button
              type="button"
              data-ocid="tmdb_hero.close_modal_button"
              onClick={closeTrailer}
              className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={trailerUrl}
                className="absolute inset-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="Movie Trailer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
