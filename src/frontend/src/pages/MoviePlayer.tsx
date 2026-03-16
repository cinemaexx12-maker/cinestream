import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Maximize,
  Pause,
  Play,
  Plus,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { SAMPLE_MOVIES } from "../data/sampleMovies";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useMovieById,
  useUpdateContinueWatching,
  useWatchlistIds,
  useWatchlistMutations,
} from "../hooks/useQueries";

export default function MoviePlayerPage() {
  const { id } = useParams({ from: "/movie/$id" });
  const navigate = useNavigate();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);

  const movieId = BigInt(id);
  const movieQuery = useMovieById(movieId);
  const watchlistIdsQuery = useWatchlistIds();
  const { addToWatchlist, removeFromWatchlist } = useWatchlistMutations();
  const updateContinueWatching = useUpdateContinueWatching();

  const movie = movieQuery.data ?? SAMPLE_MOVIES.find((m) => m.id === movieId);
  const watchlistIds = watchlistIdsQuery.data ?? [];
  const isInWatchlist = watchlistIds.some((wid) => wid === movieId);
  const thumbnailUrl =
    movie?.thumbnailUrl || `https://picsum.photos/seed/${id}/1920/1080`;

  const handleWatchlistToggle = () => {
    if (!isLoggedIn) {
      toast.error("Sign in to manage your watchlist");
      return;
    }
    if (isInWatchlist) {
      removeFromWatchlist.mutate(movieId, {
        onSuccess: () => toast.success("Removed from your list"),
      });
    } else {
      addToWatchlist.mutate(movieId, {
        onSuccess: () => toast.success("Added to your list"),
      });
    }
  };

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && isLoggedIn) {
      const progress = Math.min(playerProgress + 5, 100);
      setPlayerProgress(progress);
      updateContinueWatching.mutate({ movieId, progress: BigInt(progress) });
    }
  };

  if (movieQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Movie not found.</p>
        <Button onClick={() => navigate({ to: "/" })} variant="ghost">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div
          className="relative w-full bg-black"
          style={{ aspectRatio: "16/9", maxHeight: "75vh" }}
        >
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${thumbnailUrl})`,
              filter: "brightness(0.4)",
            }}
          />
          {movie.videoUrl ? (
            <video
              className="w-full h-full object-contain"
              src={movie.videoUrl}
              muted={isMuted}
              loop
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/60 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 backdrop-blur-sm"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              )}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-4 pt-10">
            <Progress
              value={playerProgress}
              className="h-1 mb-3 [&>div]:bg-[#e50914]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 h-9 w-9"
                  onClick={handlePlayToggle}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 fill-white" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <span className="text-white/70 text-sm">
                  {Number(movie.duration)}m
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/10 h-9 w-9"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <Button
              data-ocid="player.back_button"
              variant="ghost"
              onClick={() => navigate({ to: "/" })}
              className="text-white hover:text-white hover:bg-white/10 gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex-shrink-0 w-40 sm:w-48">
              <img
                src={
                  movie.thumbnailUrl ||
                  `https://picsum.photos/seed/${id}/300/450`
                }
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="flex items-center gap-1.5 text-sm">
                  <Star className="w-4 h-4 fill-[#e50914] text-[#e50914]" />
                  <span className="font-bold text-foreground">
                    {movie.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">/10</span>
                </span>
                <Badge variant="outline" className="border-border">
                  {Number(movie.year)}
                </Badge>
                <span className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {Number(movie.duration)} min
                </span>
                <Badge className="bg-[#e50914]/20 text-[#e50914] border-[#e50914]/30 border">
                  {movie.genre}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                {movie.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handlePlayToggle}
                  className="bg-white hover:bg-white/90 text-black font-bold gap-2 px-8"
                >
                  <Play className="w-4 h-4 fill-black" />
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  data-ocid="player.watchlist_toggle"
                  onClick={handleWatchlistToggle}
                  variant="outline"
                  className={`gap-2 border-border ${isInWatchlist ? "border-[#e50914] text-[#e50914]" : "text-foreground"}`}
                  disabled={
                    addToWatchlist.isPending || removeFromWatchlist.isPending
                  }
                >
                  {isInWatchlist ? (
                    <>
                      <Check className="w-4 h-4" /> In My List
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> My List
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
