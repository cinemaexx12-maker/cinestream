// src/pages/TMDBMovieDetail.tsx
import { useParams, useNavigate } from "@tanstack/react-router";
import { useTMDBMovieDetail, useTMDBSimilar } from "../hooks/useTMDB";
import { Skeleton } from "../components/ui/skeleton";
import TMDBMovieCard from "../components/TMDBMovieCard";

export default function TMDBMovieDetailPage() {
  const { id } = useParams({ from: "/tmdb/$id" });
  const movieId = Number(id);
  const isValidId = !Number.isNaN(movieId) && movieId > 0;
  const navigate = useNavigate();

  const { data: movie, isLoading } = useTMDBMovieDetail(movieId);
  const { data: similarMovies = [] } = useTMDBSimilar(movieId);

  if (!isValidId) return <div className="p-8 text-center">No movie found</div>;

  return (
    <div className="movie-detail-page p-4">
      {isLoading ? (
        <Skeleton className="w-full h-[500px]" />
      ) : (
        <>
          <h1 className="text-3xl font-bold">{movie?.title || "Unknown Movie"}</h1>
          <p className="mt-2">{movie?.overview || "No overview available."}</p>

          <h2 className="text-2xl font-semibold mt-6">Similar Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {similarMovies.length ? (
              similarMovies.map((m) => <TMDBMovieCard key={m.id} movie={m} />)
            ) : (
              <p className="col-span-full text-center">No similar movies found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
