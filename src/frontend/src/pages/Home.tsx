import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "../backend";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import Navbar from "../components/Navbar";
import { FEATURED_MOVIE, SAMPLE_MOVIES } from "../data/sampleMovies";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useContinueWatching,
  useFeaturedMovies,
  useMoviesByCategory,
  useWatchlistIds,
  useWatchlistMutations,
} from "../hooks/useQueries";

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const featuredQuery = useFeaturedMovies();
  const trendingQuery = useMoviesByCategory("trending");
  const seriesQuery = useMoviesByCategory("web_series");
  const latestQuery = useMoviesByCategory("latest");
  const topRatedQuery = useMoviesByCategory("top_rated");
  const watchlistIdsQuery = useWatchlistIds();
  const continueWatchingQuery = useContinueWatching();
  const { addToWatchlist, removeFromWatchlist } = useWatchlistMutations();

  const featuredMovie =
    featuredQuery.data?.[0] ??
    SAMPLE_MOVIES.find((m) => m.isFeatured) ??
    FEATURED_MOVIE;

  const getMovies = (
    query: { data?: Movie[]; isLoading: boolean },
    category: string,
  ): Movie[] => {
    if (query.data && query.data.length > 0) return query.data;
    return SAMPLE_MOVIES.filter((m) => m.categories.includes(category));
  };

  const watchlistIds = watchlistIdsQuery.data ?? [];

  const handleWatchlistToggle = (movie: Movie) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
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

  const continueWatchingPairs = continueWatchingQuery.data ?? [];
  const continueMovies = continueWatchingPairs
    .map(([id]) => SAMPLE_MOVIES.find((m) => m.id === id))
    .filter(Boolean) as Movie[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner
        movie={featuredMovie}
        isInWatchlist={watchlistIds.some((id) => id === featuredMovie.id)}
        onWatchlistToggle={() => handleWatchlistToggle(featuredMovie)}
        isLoggedIn={isLoggedIn}
      />
      <main className="py-8">
        {isLoggedIn && continueMovies.length > 0 && (
          <MovieRow
            title="Continue Watching"
            movies={continueMovies}
            watchlistIds={watchlistIds}
            continueWatching={continueWatchingPairs}
            onWatchlistToggle={handleWatchlistToggle}
            isLoggedIn={isLoggedIn}
          />
        )}
        <MovieRow
          title="Trending Now"
          movies={getMovies(trendingQuery, "trending")}
          watchlistIds={watchlistIds}
          onWatchlistToggle={handleWatchlistToggle}
          isLoggedIn={isLoggedIn}
          isLoading={trendingQuery.isLoading}
        />
        <MovieRow
          title="Popular Web Series"
          movies={getMovies(seriesQuery, "web_series")}
          watchlistIds={watchlistIds}
          onWatchlistToggle={handleWatchlistToggle}
          isLoggedIn={isLoggedIn}
          isLoading={seriesQuery.isLoading}
        />
        <MovieRow
          title="Latest Releases"
          movies={getMovies(latestQuery, "latest")}
          watchlistIds={watchlistIds}
          onWatchlistToggle={handleWatchlistToggle}
          isLoggedIn={isLoggedIn}
          isLoading={latestQuery.isLoading}
        />
        <MovieRow
          title="Top Rated"
          movies={getMovies(topRatedQuery, "top_rated")}
          watchlistIds={watchlistIds}
          onWatchlistToggle={handleWatchlistToggle}
          isLoggedIn={isLoggedIn}
          isLoading={topRatedQuery.isLoading}
        />
      </main>
      <Footer />
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        reason="Sign in to manage your watchlist and track your viewing progress."
      />
    </div>
  );
}
