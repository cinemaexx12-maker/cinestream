import { useTMDBByGenre } from "../hooks/useTMDB";
import { TMDBMovieRowUI } from "./TMDBMovieRow";

const GENRE_LABELS: Record<number, string> = {
  28: "ACTION",
  35: "COMEDY",
  27: "HORROR",
  878: "SCI-FI",
  10749: "ROMANCE",
};

interface TMDBGenreRowProps {
  title: string;
  genreId: number;
}

export default function TMDBGenreRow({ title, genreId }: TMDBGenreRowProps) {
  const { data, isLoading, isError, refetch } = useTMDBByGenre(genreId);
  return (
    <TMDBMovieRowUI
      title={title}
      label={GENRE_LABELS[genreId]}
      movies={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}
