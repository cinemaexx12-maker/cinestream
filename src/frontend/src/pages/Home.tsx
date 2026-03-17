import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "../backend";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import MyWatchlistRow from "../components/MyWatchlistRow";
import Navbar from "../components/Navbar";
import RecommendedRow from "../components/RecommendedRow";
import TMDBCategoryRow from "../components/TMDBCategoryRow";
import TMDBGenreRow from "../components/TMDBGenreRow";
import TMDBHeroBanner from "../components/TMDBHeroBanner";
import TMDBTrendingRow from "../components/TMDBTrendingRow";
import Top10TrendingRow from "../components/Top10TrendingRow";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllMovies,
  useContinueWatching,
  useFeaturedMovies,
  useWatchlistIds,
  useWatchlistMutations,
} from "../hooks/useQueries";

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const featuredQuery = useFeaturedMovies();
  const allMoviesQuery = useAllMovies();
  const watchlistIdsQuery = useWatchlistIds();
  const continueWatchingQuery = useContinueWatching();
  const { addToWatchlist, removeFromWatchlist } = useWatchlistMutations();

  const featuredMovies: Movie[] =
    featuredQuery.data && featuredQuery.data.length > 0
      ? featuredQuery.data
      : [];

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

  const continueWatchingEntries = continueWatchingQuery.data ?? [];
  const allMovies = allMoviesQuery.data ?? [];
  const continueMovies = continueWatchingEntries
    .map((entry) => allMovies.find((m) => m.id === entry.movieId))
    .filter(Boolean) as Movie[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {featuredMovies.length > 0 ? (
        <HeroBanner
          movies={featuredMovies}
          isInWatchlist={(id) => watchlistIds.some((wid) => wid === id)}
          onWatchlistToggle={handleWatchlistToggle}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <TMDBHeroBanner />
      )}

      <main className="py-8">
        {/* 1. Top 10 Trending — Netflix-style ranked row */}
        <Top10TrendingRow />

        {/* 2. Continue Watching — only when logged in with progress */}
        {isLoggedIn && continueMovies.length > 0 && (
          <MovieRow
            title="Continue Watching"
            label="RESUME"
            movies={continueMovies}
            watchlistIds={watchlistIds}
            continueWatching={continueWatchingEntries}
            onWatchlistToggle={handleWatchlistToggle}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* 3. Recommended For You — only when logged in */}
        <RecommendedRow />

        {/* 4. My Watchlist — only when logged in and has items */}
        <MyWatchlistRow />

        {/* 5. Trending Now */}
        <TMDBTrendingRow />

        {/* 6. Popular Movies */}
        <TMDBCategoryRow title="Popular Movies" category="popular" />

        {/* 7. Top Rated */}
        <TMDBCategoryRow title="Top Rated Movies" category="top_rated" />

        {/* 8. Latest Releases */}
        <TMDBCategoryRow title="Latest Releases" category="now_playing" />

        {/* 9. Genre rows */}
        <TMDBGenreRow title="Action Movies" genreId={28} />
        <TMDBGenreRow title="Comedy Movies" genreId={35} />
        <TMDBGenreRow title="Horror Movies" genreId={27} />
        <TMDBGenreRow title="Sci-Fi Movies" genreId={878} />
        <TMDBGenreRow title="Romance Movies" genreId={10749} />

        {/* 10. Upcoming */}
        <TMDBCategoryRow title="Upcoming Movies" category="upcoming" />
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
