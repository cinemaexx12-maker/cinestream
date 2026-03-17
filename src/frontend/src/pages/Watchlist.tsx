import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Bookmark, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "../backend";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { SAMPLE_MOVIES } from "../data/sampleMovies";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllMovies,
  useReorderTMDBWatchlist,
  useReorderWatchlist,
  useTMDBWatchlistIds,
  useTMDBWatchlistMutations,
  useWatchlistIds,
  useWatchlistMutations,
} from "../hooks/useQueries";
import { useTMDBMovieDetail } from "../hooks/useTMDB";
import { tmdbImage } from "../services/tmdb";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7"];

function TMDBWatchlistItem({
  tmdbId,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  tmdbId: number;
  index: number;
  total: number;
  onRemove: (id: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const navigate = useNavigate();
  const { data: movie, isLoading } = useTMDBMovieDetail(tmdbId);

  if (isLoading) {
    return (
      <div>
        <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
        <div className="mt-2 h-3 w-3/4 skeleton-shimmer rounded" />
      </div>
    );
  }

  if (!movie) return null;

  const posterUrl = tmdbImage(movie.poster_path, "w342");

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() =>
          navigate({ to: "/tmdb/$id", params: { id: String(tmdbId) } })
        }
        className="w-full text-left"
      >
        <div className="aspect-[2/3] rounded-md overflow-hidden bg-secondary">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <span className="text-xs text-muted-foreground text-center">
                {movie.title}
              </span>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs font-medium truncate">{movie.title}</p>
        {movie.vote_average > 0 && (
          <p className="text-xs text-muted-foreground">
            ★ {movie.vote_average.toFixed(1)}
          </p>
        )}
      </button>

      {/* Always-visible action buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          data-ocid={`watchlist.delete_button.${index + 1}`}
          onClick={() => onRemove(tmdbId)}
          className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-[#e50914] transition-colors"
          title="Remove"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Reorder buttons - visible on hover */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {index > 0 && (
          <button
            type="button"
            data-ocid={`watchlist.reorder_up_button.${index + 1}`}
            onClick={() => onMoveUp(index)}
            className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Move up"
          >
            <ArrowUp className="w-3 h-3 text-white" />
          </button>
        )}
        {index < total - 1 && (
          <button
            type="button"
            data-ocid={`watchlist.reorder_down_button.${index + 1}`}
            onClick={() => onMoveDown(index)}
            className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Move down"
          >
            <ArrowDown className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

function AdminMovieCard({
  movie,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  movie: Movie;
  index: number;
  total: number;
  onRemove: (movie: Movie) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const navigate = useNavigate();
  const thumbnailUrl =
    movie.thumbnailUrl || `https://picsum.photos/seed/${movie.id}/300/450`;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() =>
          navigate({ to: "/movie/$id", params: { id: movie.id.toString() } })
        }
        className="w-full text-left"
      >
        <div className="aspect-[2/3] rounded-md overflow-hidden bg-secondary">
          <img
            src={thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {movie.isPremium && (
            <div className="absolute top-2 right-8">
              <span
                className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FF6B00 100%)",
                }}
              >
                PREMIUM
              </span>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs font-medium truncate">{movie.title}</p>
        {movie.rating > 0 && (
          <p className="text-xs text-muted-foreground">
            ★ {movie.rating.toFixed(1)}
          </p>
        )}
      </button>

      {/* Always-visible remove button */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          data-ocid={`watchlist.delete_button.${index + 1}`}
          onClick={() => onRemove(movie)}
          className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-[#e50914] transition-colors"
          title="Remove"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Reorder buttons */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {index > 0 && (
          <button
            type="button"
            data-ocid={`watchlist.reorder_up_button.${index + 1}`}
            onClick={() => onMoveUp(index)}
            className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Move up"
          >
            <ArrowUp className="w-3 h-3 text-white" />
          </button>
        )}
        {index < total - 1 && (
          <button
            type="button"
            data-ocid={`watchlist.reorder_down_button.${index + 1}`}
            onClick={() => onMoveDown(index)}
            className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Move down"
          >
            <ArrowDown className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const [authModalOpen, setAuthModalOpen] = useState(!isLoggedIn);

  const allMoviesQuery = useAllMovies();
  const watchlistIdsQuery = useWatchlistIds();
  const { removeFromWatchlist } = useWatchlistMutations();
  const reorderWatchlist = useReorderWatchlist();

  const tmdbWatchlistIdsQuery = useTMDBWatchlistIds();
  const { removeFromTMDBWatchlist } = useTMDBWatchlistMutations();
  const reorderTMDBWatchlist = useReorderTMDBWatchlist();

  const watchlistIds = watchlistIdsQuery.data ?? [];
  const [tmdbOrder, setTmdbOrder] = useState<number[] | null>(null);
  const [adminOrder, setAdminOrder] = useState<bigint[] | null>(null);

  const rawTmdbIds = (tmdbWatchlistIdsQuery.data ?? []).map((id) => Number(id));
  const tmdbWatchlistIds = tmdbOrder ?? rawTmdbIds;

  const allMovies: Movie[] =
    allMoviesQuery.data && allMoviesQuery.data.length > 0
      ? allMoviesQuery.data
      : SAMPLE_MOVIES;

  const rawWatchlistMovies = allMovies.filter((m) =>
    watchlistIds.some((id) => id === m.id),
  );
  const orderedWatchlistMovies = adminOrder
    ? (adminOrder
        .map((id) => rawWatchlistMovies.find((m) => m.id === id))
        .filter(Boolean) as Movie[])
    : rawWatchlistMovies;

  const handleRemoveAdmin = (movie: Movie) => {
    removeFromWatchlist.mutate(movie.id, {
      onSuccess: () => toast.success(`Removed "${movie.title}" from your list`),
    });
  };

  const handleRemoveTMDB = (tmdbId: number) => {
    removeFromTMDBWatchlist.mutate(tmdbId, {
      onSuccess: () => toast.success("Removed from watchlist"),
    });
  };

  const moveTMDB = (index: number, direction: "up" | "down") => {
    const newOrder = [...tmdbWatchlistIds];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
    setTmdbOrder(newOrder);
    reorderTMDBWatchlist.mutate(newOrder.map((id) => BigInt(id)));
  };

  const moveAdmin = (index: number, direction: "up" | "down") => {
    const current = orderedWatchlistMovies.map((m) => m.id);
    const newOrder = [...current];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
    setAdminOrder(newOrder);
    reorderWatchlist.mutate(newOrder);
  };

  const isLoading =
    watchlistIdsQuery.isLoading || tmdbWatchlistIdsQuery.isLoading;
  const isEmpty =
    orderedWatchlistMovies.length === 0 && tmdbWatchlistIds.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-8 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-6 h-6 text-[#e50914]" />
          <h1 className="font-display font-black text-3xl sm:text-4xl">
            My List
          </h1>
        </div>
        {!isLoggedIn ? (
          <div className="flex flex-col items-center py-24 gap-6">
            <div className="w-20 h-20 rounded-full bg-[#e50914]/10 flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-[#e50914]" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-foreground">
                Sign in to see your list
              </p>
              <p className="text-muted-foreground mt-2">
                Save movies and series to watch later
              </p>
            </div>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-[#e50914] hover:bg-[#c4070f] text-white font-semibold px-8"
            >
              Sign In
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {SKELETON_KEYS.map((k) => (
              <div key={k}>
                <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
                <div className="mt-2 h-3 w-3/4 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div
            data-ocid="watchlist.empty_state"
            className="flex flex-col items-center py-24 gap-4 text-muted-foreground"
          >
            <Bookmark className="w-16 h-16 opacity-20" />
            <p className="text-xl font-semibold">Your list is empty</p>
            <p className="text-sm">Browse and add movies to your list</p>
            <Link to="/">
              <Button variant="outline" className="mt-2 border-border">
                Browse Movies
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            <p className="text-xs text-muted-foreground -mt-4">
              Hover over a poster to reorder with ↑ ↓ arrows
            </p>

            {/* TMDB Watchlist */}
            {tmdbWatchlistIds.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl mb-4 text-foreground">
                  Saved Movies
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
                  {tmdbWatchlistIds.map((tmdbId, i) => (
                    <div key={tmdbId} data-ocid={`watchlist.item.${i + 1}`}>
                      <TMDBWatchlistItem
                        tmdbId={tmdbId}
                        index={i}
                        total={tmdbWatchlistIds.length}
                        onRemove={handleRemoveTMDB}
                        onMoveUp={(idx) => moveTMDB(idx, "up")}
                        onMoveDown={(idx) => moveTMDB(idx, "down")}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Admin/local watchlist */}
            {orderedWatchlistMovies.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl mb-4 text-foreground">
                  My Movies
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
                  {orderedWatchlistMovies.map((movie, i) => (
                    <div
                      key={movie.id.toString()}
                      data-ocid={`watchlist.item.${i + 1}`}
                    >
                      <AdminMovieCard
                        movie={movie}
                        index={i}
                        total={orderedWatchlistMovies.length}
                        onRemove={handleRemoveAdmin}
                        onMoveUp={(idx) => moveAdmin(idx, "up")}
                        onMoveDown={(idx) => moveAdmin(idx, "down")}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        reason="Sign in to save movies to your watchlist."
      />
    </div>
  );
}
