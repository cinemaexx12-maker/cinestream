import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Clock, Play, Plus, Star } from "lucide-react";
import type { Movie } from "../backend";

interface HeroBannerProps {
  movie: Movie;
  isInWatchlist: boolean;
  onWatchlistToggle: () => void;
  isLoggedIn: boolean;
}

export default function HeroBanner({
  movie,
  isInWatchlist,
  onWatchlistToggle,
  isLoggedIn,
}: HeroBannerProps) {
  const thumbnailUrl =
    movie.thumbnailUrl || "/assets/generated/hero-banner.dim_1920x600.jpg";
  return (
    <div className="relative w-full min-h-[85vh] flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundPosition: "center top",
        }}
      />
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-8 pb-20 pt-32">
        <div className="max-w-2xl animate-fade-in">
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
                onClick={onWatchlistToggle}
                variant="outline"
                className={`border-white/40 text-white hover:border-white font-semibold text-base px-8 h-12 gap-2 rounded-sm bg-white/10 hover:bg-white/20 ${isInWatchlist ? "border-[#e50914] text-[#e50914]" : ""}`}
              >
                <Plus className="w-5 h-5" />{" "}
                {isInWatchlist ? "In My List" : "My List"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
