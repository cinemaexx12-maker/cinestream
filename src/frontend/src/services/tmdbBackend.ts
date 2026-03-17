// src/services/tmdbBackend.ts
import type { backendInterface } from "../backend";
import type { TMDBMovie, TMDBMovieDetail } from "../types/tmdb";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ── Cache helpers ─────────────────────────────
function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`tmdb_backend_cache:${key}`);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) return entry.data;
    }
  } catch {}
  return null;
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(
      `tmdb_backend_cache:${key}`,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {}
}

// ── Actor cast helper (TMDB methods may not be in generated types yet) ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tmdb(actor: backendInterface): any {
  return actor as any;
}

// ── Response parser ───────────────────────────
function parseMovieList(raw: string): TMDBMovie[] {
  const parsed = JSON.parse(raw || "{}");
  return Array.isArray(parsed.results)
    ? parsed.results
    : Array.isArray(parsed)
      ? parsed
      : [];
}

// ── Fetch functions ───────────────────────────

// Trending Movies
export async function fetchTrendingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  const key = "trending";
  const cached = readCache<TMDBMovie[]>(key);
  if (cached) return cached;

  const raw = await tmdb(actor).getTrending(); // backend returns Text
  const data = parseMovieList(raw);
  writeCache(key, data);
  return data;
}

// Top Rated Movies
export async function fetchTopRatedViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  const key = "top_rated";
  const cached = readCache<TMDBMovie[]>(key);
  if (cached) return cached;

  const raw = await tmdb(actor).getTopRated(); // backend returns Text
  const data = parseMovieList(raw);
  writeCache(key, data);
  return data;
}

// Upcoming Movies
export async function fetchUpcomingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  const key = "upcoming";
  const cached = readCache<TMDBMovie[]>(key);
  if (cached) return cached;

  const a = tmdb(actor);
  // Fall back to getNowPlaying if getUpcoming isn't deployed yet
  const raw = await (a.getUpcoming ? a.getUpcoming() : a.getNowPlaying()); // backend returns Text
  const data = parseMovieList(raw);
  writeCache(key, data);
  return data;
}

// Popular Movies
export async function fetchPopularViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  const key = "popular";
  const cached = readCache<TMDBMovie[]>(key);
  if (cached) return cached;

  const raw = await tmdb(actor).getPopular(); // backend returns Text
  const data = parseMovieList(raw);
  writeCache(key, data);
  return data;
}

// Now Playing Movies
export async function fetchNowPlayingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  const key = "now_playing";
  const cached = readCache<TMDBMovie[]>(key);
  if (cached) return cached;

  const raw = await tmdb(actor).getNowPlaying(); // backend returns Text
  const data = parseMovieList(raw);
  writeCache(key, data);
  return data;
}

// Movies By Genre
export async function fetchMoviesByGenreViaBackend(
  actor: backendInterface,
  genreId: number,
): Promise<TMDBMovie[]> {
  const key = `genre_${genreId}`;
  const cached = readCache<TMDBMovie[]>(key);
  if (cached) return cached;

  const raw = await tmdb(actor).getMoviesByGenre(BigInt(genreId)); // backend returns Text
  const data = parseMovieList(raw);
  writeCache(key, data);
  return data;
}

// Movie Details
export async function fetchMovieDetailViaBackend(
  actor: backendInterface,
  id: number,
): Promise<TMDBMovieDetail | null> {
  const key = `movie_${id}`;
  const cached = readCache<TMDBMovieDetail>(key);
  if (cached) return cached;

  const a = tmdb(actor);
  if (!a.getMovieDetails) return null;
  const raw = await a.getMovieDetails(id); // backend returns Text
  if (!raw) return null;
  const data: TMDBMovieDetail = JSON.parse(raw || "{}");
  if (!data || !data.id) return null;
  writeCache(key, data);
  return data;
}

// Alias for useTMDB.ts compatibility
export const fetchMovieDetailsViaBackend = fetchMovieDetailViaBackend;

// Similar Movies
export async function fetchSimilarViaBackend(
  actor: backendInterface,
  id: number,
): Promise<TMDBMovie[]> {
  const key = `similar_${id}`;
  const cached = readCache<TMDBMovie[]>(key);
  if (cached) return cached;

  const a = tmdb(actor);
  if (!a.getSimilarMovies) return [];
  const raw = await a.getSimilarMovies(id); // backend returns Text
  if (!raw) return [];
  const data = parseMovieList(raw);
  writeCache(key, data);
  return data;
}

// Alias for useTMDB.ts compatibility
export const fetchSimilarMoviesViaBackend = fetchSimilarViaBackend;
