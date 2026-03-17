import {
  useTMDBNowPlaying,
  useTMDBPopular,
  useTMDBTopRated,
  useTMDBUpcoming,
} from "../hooks/useTMDB";
import { TMDBMovieRowUI } from "./TMDBMovieRow";

type Category = "popular" | "top_rated" | "upcoming" | "now_playing";

function PopularRow({ title }: { title: string }) {
  const { data, isLoading, isError, refetch } = useTMDBPopular();
  return (
    <TMDBMovieRowUI
      title={title}
      label="POPULAR"
      movies={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}

function TopRatedRow({ title }: { title: string }) {
  const { data, isLoading, isError, refetch } = useTMDBTopRated();
  return (
    <TMDBMovieRowUI
      title={title}
      label="TOP RATED"
      movies={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}

function UpcomingRow({ title }: { title: string }) {
  const { data, isLoading, isError, refetch } = useTMDBUpcoming();
  return (
    <TMDBMovieRowUI
      title={title}
      label="UPCOMING"
      movies={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}

function NowPlayingRow({ title }: { title: string }) {
  const { data, isLoading, isError, refetch } = useTMDBNowPlaying();
  return (
    <TMDBMovieRowUI
      title={title}
      label="NEW"
      movies={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}

interface TMDBCategoryRowProps {
  title: string;
  category: Category;
}

export default function TMDBCategoryRow({
  title,
  category,
}: TMDBCategoryRowProps) {
  if (category === "popular") return <PopularRow title={title} />;
  if (category === "top_rated") return <TopRatedRow title={title} />;
  if (category === "upcoming") return <UpcomingRow title={title} />;
  return <NowPlayingRow title={title} />;
}
