export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
}

export interface TMDBMovieDetail extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string;
  status: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBTrendingResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}
