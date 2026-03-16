import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "../backend";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import { SAMPLE_MOVIES } from "../data/sampleMovies";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllMovies,
  useWatchlistIds,
  useWatchlistMutations,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7"];

export default function WatchlistPage() {
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const [authModalOpen, setAuthModalOpen] = useState(!isLoggedIn);

  const allMoviesQuery = useAllMovies();
  const watchlistIdsQuery = useWatchlistIds();
  const { addToWatchlist, removeFromWatchlist } = useWatchlistMutations();

  const watchlistIds = watchlistIdsQuery.data ?? [];
  const allMovies: Movie[] =
    allMoviesQuery.data && allMoviesQuery.data.length > 0
      ? allMoviesQuery.data
      : SAMPLE_MOVIES;
  const watchlistMovies = allMovies.filter((m) =>
    watchlistIds.some((id) => id === m.id),
  );

  const handleWatchlistToggle = (movie: Movie) => {
    const isIn = watchlistIds.some((id) => id === movie.id);
    if (isIn) {
      removeFromWatchlist.mutate(movie.id, {
        onSuccess: () =>
          toast.success(`Removed "${movie.title}" from your list`),
      });
    } else {
      addToWatchlist.mutate(movie.id, {
        onSuccess: () => toast.success(`Added "${movie.title}" to your list`),
      });
    }
  };

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
        ) : watchlistIdsQuery.isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {SKELETON_KEYS.map((k) => (
              <div key={k}>
                <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
                <div className="mt-2 h-3 w-3/4 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : watchlistMovies.length === 0 ? (
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
            {watchlistMovies.map((movie, i) => (
              <MovieCard
                key={movie.id.toString()}
                movie={movie}
                index={i + 1}
                isInWatchlist={true}
                onWatchlistToggle={handleWatchlistToggle}
                isLoggedIn={isLoggedIn}
              />
            ))}
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
