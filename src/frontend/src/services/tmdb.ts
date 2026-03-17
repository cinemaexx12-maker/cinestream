import type {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBTrendingResponse,
  TMDBVideo,
} from "../types/tmdb";
import { cachedFetch } from "./tmdbCache";

// Read API key from environment variable — never hardcode in source
const _apiKey = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const apiKeyLoaded = !!_apiKey && _apiKey.length > 0;
console.log(`[TMDB] API key loaded: ${apiKeyLoaded}`);

export const TMDB_API_KEY = _apiKey ?? "";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";

export function tmdbImage(path: string | null, size: string): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}${size}${path}`;
}

// Semantic alias — TMDB serves WebP via Accept header negotiation
export function tmdbImageWebP(path: string | null, size: string): string {
  return tmdbImage(path, size);
}

function buildUrl(endpoint: string): string {
  return `${TMDB_BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`;
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  return cachedFetch<T>(buildUrl(endpoint));
}

export async function fetchTrendingMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/trending/movie/week");
}

export async function fetchPopularMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/movie/popular");
}

export async function fetchTopRatedMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/movie/top_rated");
}

export async function fetchUpcomingMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/movie/upcoming");
}

export async function fetchNowPlayingMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/movie/now_playing");
}

export async function fetchMoviesByGenre(
  genreId: number,
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`,
  );
}

export async function fetchMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`);
}

export async function fetchMovieVideos(
  id: number,
): Promise<{ results: TMDBVideo[] }> {
  return tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${id}/videos`);
}

export async function fetchSimilarMovies(
  id: number,
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(`/movie/${id}/similar`);
}

export async function fetchSearchMovies(
  query: string,
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(
    `/search/movie?query=${encodeURIComponent(query)}`,
  );
}

export function getReleaseYear(releaseDate: string): string {
  if (!releaseDate) return "";
  return releaseDate.split("-")[0];
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
