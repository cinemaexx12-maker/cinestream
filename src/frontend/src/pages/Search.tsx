import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "../backend";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import { SAMPLE_MOVIES } from "../data/sampleMovies";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useSearchMovies,
  useWatchlistIds,
  useWatchlistMutations,
} from "../hooks/useQueries";

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
  "sk-9",
  "sk-10",
  "sk-11",
  "sk-12",
];

export default function SearchPage() {
  const searchParams = useSearch({ from: "/search" });
  const navigate = useNavigate();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const initialQ = (searchParams as { q?: string }).q ?? "";
  const [inputValue, setInputValue] = useState(initialQ);

  const searchQuery = useSearchMovies(initialQ);
  const watchlistIdsQuery = useWatchlistIds();
  const { addToWatchlist, removeFromWatchlist } = useWatchlistMutations();
  const watchlistIds = watchlistIdsQuery.data ?? [];

  const results: Movie[] =
    searchQuery.data && searchQuery.data.length > 0
      ? searchQuery.data
      : initialQ.trim()
        ? SAMPLE_MOVIES.filter(
            (m) =>
              m.title.toLowerCase().includes(initialQ.toLowerCase()) ||
              m.genre.toLowerCase().includes(initialQ.toLowerCase()),
          )
        : SAMPLE_MOVIES;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: inputValue } });
  };

  const handleWatchlistToggle = (movie: Movie) => {
    if (!isLoggedIn) {
      toast.error("Sign in to manage your watchlist");
      return;
    }
    const isIn = watchlistIds.some((id) => id === movie.id);
    if (isIn) {
      removeFromWatchlist.mutate(movie.id);
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
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mb-10">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              data-ocid="search.search_input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search movies, series, genres..."
              className="pl-10 h-12 bg-secondary border-border text-base"
            />
          </div>
          <Button
            data-ocid="search.submit_button"
            type="submit"
            className="bg-[#e50914] hover:bg-[#c4070f] text-white h-12 px-6 font-semibold"
          >
            Search
          </Button>
        </form>
        <div className="mb-6">
          {initialQ ? (
            <h1 className="font-display font-bold text-2xl sm:text-3xl">
              Results for{" "}
              <span className="text-[#e50914]">&ldquo;{initialQ}&rdquo;</span>
            </h1>
          ) : (
            <h1 className="font-display font-bold text-2xl sm:text-3xl">
              Browse All
            </h1>
          )}
          <p className="text-muted-foreground mt-1">
            {results.length} titles found
          </p>
        </div>
        {searchQuery.isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {SKELETON_KEYS.map((k) => (
              <div key={k}>
                <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
                <div className="mt-2 h-3 w-3/4 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div
            data-ocid="search.empty_state"
            className="flex flex-col items-center py-24 text-muted-foreground"
          >
            <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-semibold">No results found</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 gap-y-6">
            {results.map((movie, i) => (
              <MovieCard
                key={movie.id.toString()}
                movie={movie}
                index={i + 1}
                isInWatchlist={watchlistIds.some((id) => id === movie.id)}
                onWatchlistToggle={handleWatchlistToggle}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
