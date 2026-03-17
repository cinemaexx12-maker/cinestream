import { useTMDBTrending } from "../hooks/useTMDB";
import { TMDBMovieRowUI } from "./TMDBMovieRow";

export default function TMDBTrendingRow() {
  const { data, isLoading, isError, refetch } = useTMDBTrending();
  return (
    <TMDBMovieRowUI
      title="Trending Now"
      label="TRENDING"
      movies={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}
