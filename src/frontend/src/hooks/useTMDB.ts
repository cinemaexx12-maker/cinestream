import { useQuery } from "@tanstack/react-query";
import {
  fetchMovieDetailsViaBackend,
  fetchMoviesByGenreViaBackend,
  fetchNowPlayingViaBackend,
  fetchPopularViaBackend,
  fetchSimilarMoviesViaBackend,
  fetchTopRatedViaBackend,
  fetchTrendingViaBackend,
  fetchUpcomingViaBackend,
} from "../services/tmdbBackend";
import type { TMDBMovie, TMDBMovieDetail } from "../types/tmdb";
import { useActor } from "./useActor";

const STALE = 1000 * 60 * 5; // 5 minutes

export function useTMDBTrending() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "trending"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const results = await fetchTrendingViaBackend(actor);
      return results || [];
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
  });
}

export function useTMDBTopRated() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "top_rated"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const results = await fetchTopRatedViaBackend(actor);
      return results || [];
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
  });
}

export function useTMDBUpcoming() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "upcoming"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const results = await fetchUpcomingViaBackend(actor);
      return results || [];
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
  });
}

export function useTMDBPopular() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "popular"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const results = await fetchPopularViaBackend(actor);
      return results || [];
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
  });
}

export function useTMDBNowPlaying() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "now_playing"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const results = await fetchNowPlayingViaBackend(actor);
      return results || [];
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
  });
}

export function useTMDBByGenre(genreId: number) {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "genre", genreId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const results = await fetchMoviesByGenreViaBackend(actor, genreId);
      return results || [];
    },
    enabled: !!actor && genreId > 0,
    staleTime: STALE,
    retry: 2,
  });
}

export function useTMDBSearch(query: string) {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "search", query],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!query.trim()) return [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await (actor as any).searchMovies(query);
        const data = JSON.parse(typeof raw === "string" ? raw || "{}" : "{}");
        return Array.isArray(data.results) ? data.results : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useTMDBMovieDetail(id: number) {
  const { actor } = useActor();
  return useQuery<TMDBMovieDetail | null>({
    queryKey: ["tmdb", "movie", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      const data = await fetchMovieDetailsViaBackend(actor, id);
      return (data as unknown as TMDBMovieDetail) || null;
    },
    enabled: !!actor && id > 0,
    staleTime: STALE,
    retry: 2,
  });
}

export function useTMDBSimilar(id: number) {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "similar", id],
    queryFn: async () => {
      if (!actor || !id) return [];
      const results = await fetchSimilarMoviesViaBackend(actor, id);
      return results || [];
    },
    enabled: !!actor && id > 0,
    staleTime: STALE,
    retry: 2,
  });
}
