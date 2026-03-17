import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Maximize,
  Minimize,
  Pause,
  Play,
  Plus,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Paywall from "../components/Paywall";
import { SAMPLE_MOVIES } from "../data/sampleMovies";
import { useHLS } from "../hooks/useHLS";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllMovies,
  useContinueWatching,
  useMovieById,
  useRemoveContinueWatching,
  useSubscription,
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
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [seekTooltip, setSeekTooltip] = useState<{
    x: number;
    time: string;
  } | null>(null);
  const [progressRestored, setProgressRestored] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const playerProgressRef = useRef(playerProgress);
  const isPlayingRef = useRef(isPlaying);
  const isLoggedInRef = useRef(isLoggedIn);

  // Keep refs in sync so interval/cleanup callbacks always have fresh values
  useEffect(() => {
    playerProgressRef.current = playerProgress;
  }, [playerProgress]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  const movieId = BigInt(id);
  const movieQuery = useMovieById(movieId);
  const allMoviesQuery = useAllMovies();
  const watchlistIdsQuery = useWatchlistIds();
  const continueWatchingQuery = useContinueWatching();
  const { data: sub } = useSubscription();
  const { addToWatchlist, removeFromWatchlist } = useWatchlistMutations();
  const updateContinueWatching = useUpdateContinueWatching();
  const removeContinueWatching = useRemoveContinueWatching();

  // Store mutation functions in refs so effects don't need them as deps
  const updateContinueWatchingRef = useRef(updateContinueWatching.mutate);
  const removeContinueWatchingRef = useRef(removeContinueWatching.mutate);
  useEffect(() => {
    updateContinueWatchingRef.current = updateContinueWatching.mutate;
  }, [updateContinueWatching.mutate]);
  useEffect(() => {
    removeContinueWatchingRef.current = removeContinueWatching.mutate;
  }, [removeContinueWatching.mutate]);

  // Resolve movie from backend or sample data
  const allMovies = allMoviesQuery.data ?? [];
  const movie =
    movieQuery.data ??
    allMovies.find((m) => m.id === movieId) ??
    SAMPLE_MOVIES.find((m) => m.id === movieId);

  // HLS adaptive streaming
  const { hlsLevel, hlsLevels } = useHLS(videoRef, movie?.videoUrl);

  const watchlistIds = watchlistIdsQuery.data ?? [];
  const isInWatchlist = watchlistIds.some((wid) => wid === movieId);
  const thumbnailUrl =
    movie?.thumbnailUrl || `https://picsum.photos/seed/${id}/1920/1080`;

  const totalSeconds = movie ? Number(movie.duration) * 60 : 7200;
  const totalSecondsRef = useRef(totalSeconds);
  useEffect(() => {
    totalSecondsRef.current = totalSeconds;
  }, [totalSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Helper: save or remove based on current progress
  const saveProgress = useCallback((movieIdArg: bigint) => {
    const total = totalSecondsRef.current;
    const currentSeconds = (playerProgressRef.current / 100) * total;
    const ratio = total > 0 ? currentSeconds / total : 0;
    if (ratio > 0.9) {
      removeContinueWatchingRef.current(movieIdArg);
    } else if (currentSeconds > 0) {
      updateContinueWatchingRef.current({
        movieId: movieIdArg,
        progress: BigInt(Math.floor(currentSeconds)),
      });
    }
  }, []);

  // Restore saved progress on mount (once continueWatching data is loaded)
  useEffect(() => {
    if (progressRestored) return;
    if (!continueWatchingQuery.data) return;
    const entry = continueWatchingQuery.data.find((p) => p.movieId === movieId);
    if (entry) {
      const savedSeconds = Number(entry.progressSeconds);
      if (savedSeconds > 0 && totalSeconds > 0) {
        const pct = (savedSeconds / totalSeconds) * 100;
        setPlayerProgress(Math.min(pct, 99));
      }
    }
    setProgressRestored(true);
  }, [continueWatchingQuery.data, movieId, totalSeconds, progressRestored]);

  // Interval-based progress saving every 5 seconds while playing
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      if (!isPlayingRef.current) return;
      saveProgress(movieId);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, movieId, saveProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (!isLoggedInRef.current) return;
      saveProgress(movieId);
    };
  }, [movieId, saveProgress]);

  // Controls auto-hide
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlayingRef.current) setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayToggle();
          break;
        case "m":
        case "M":
          setIsMuted((v) => !v);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "ArrowLeft":
          setPlayerProgress((p) => Math.max(0, p - 10));
          break;
        case "ArrowRight":
          setPlayerProgress((p) => Math.min(100, p + 10));
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

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

  const handlePlayToggle = useCallback(() => {
    const next = !isPlayingRef.current;
    setIsPlaying(next);
    if (next) {
      setIsBuffering(true);
      setTimeout(() => setIsBuffering(false), 1500);
    } else {
      // Save progress immediately on pause
      if (isLoggedInRef.current) {
        saveProgress(movieId);
      }
    }
    resetHideTimer();
  }, [movieId, saveProgress, resetHideTimer]);

  // Seek bar interaction
  const getProgressFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!seekBarRef.current) return 0;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const handleSeekMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setPlayerProgress(getProgressFromEvent(e));
  };

  const handleSeekMouseMove = (e: React.MouseEvent) => {
    if (!seekBarRef.current) return;
    const pct = getProgressFromEvent(e);
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timeSec = (pct / 100) * totalSeconds;
    setSeekTooltip({ x, time: formatTime(timeSec) });
    if (isDragging.current) setPlayerProgress(pct);
  };

  const handleSeekMouseUp = () => {
    isDragging.current = false;
  };

  const handleSeekMouseLeave = () => {
    setSeekTooltip(null);
    isDragging.current = false;
  };

  const currentTimeSec = (playerProgress / 100) * totalSeconds;

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

  // Paywall gate: premium movies require an active subscription
  const isSubActive = sub
    ? Number(sub.expiryDate) > Math.floor(Date.now() / 1000)
    : false;
  if (movie.isPremium && !isSubActive) {
    return (
      <Paywall
        movieTitle={movie.title}
        posterUrl={movie.thumbnailUrl}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Video container */}
        <div
          ref={videoContainerRef}
          className="relative w-full bg-black select-none"
          style={{ aspectRatio: "16/9", maxHeight: "75vh" }}
          onMouseMove={resetHideTimer}
        >
          {/* Background / poster */}
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${thumbnailUrl})`,
              filter: "brightness(0.4)",
            }}
          />
          {movie.videoUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              muted={isMuted}
              loop
            />
          ) : null}

          {/* Center play/pause button */}
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

          {/* Buffering spinner */}
          {isBuffering && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              data-ocid="player.loading_state"
            >
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                  style={{
                    borderTopColor: "#e50914",
                    borderRightColor: "rgba(229,9,20,0.3)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-6 pb-4 pt-12 transition-opacity duration-300 ${
              controlsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Interactive seek bar */}
            <div
              ref={seekBarRef}
              data-ocid="player.seek_bar"
              className="relative h-5 flex items-center mb-3 cursor-pointer"
              onMouseDown={handleSeekMouseDown}
              onMouseMove={handleSeekMouseMove}
              onMouseUp={handleSeekMouseUp}
              onMouseLeave={handleSeekMouseLeave}
            >
              {/* Track */}
              <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-[#e50914] transition-all"
                  style={{ width: `${playerProgress}%` }}
                />
              </div>
              {/* Thumb */}
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-[#e50914] border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
                style={{ left: `${playerProgress}%` }}
              />
              {/* Time tooltip */}
              {seekTooltip && (
                <div
                  className="absolute -top-8 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none -translate-x-1/2"
                  style={{ left: seekTooltip.x }}
                >
                  {seekTooltip.time}
                </div>
              )}
            </div>

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
                  {formatTime(currentTimeSec)} / {Number(movie.duration)}m
                </span>
              </div>
              {/* HLS quality badge */}
              {hlsLevels.length > 0 && (
                <span className="text-xs font-bold text-white/70 px-2 py-0.5 bg-white/10 rounded select-none">
                  {hlsLevel === -1
                    ? "AUTO"
                    : hlsLevels[hlsLevel]?.height
                      ? `${hlsLevels[hlsLevel].height}p`
                      : "AUTO"}
                </span>
              )}
              <Button
                data-ocid="player.fullscreen_button"
                size="icon"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/10 h-9 w-9"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Back button */}
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

        {/* Movie info */}
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
                  className={`gap-2 border-border ${
                    isInWatchlist
                      ? "border-[#e50914] text-[#e50914]"
                      : "text-foreground"
                  }`}
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
