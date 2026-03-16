import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Movie, MovieInput } from "../backend";
import { useActor } from "./useActor";

export function useAllMovies() {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMovies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFeaturedMovies() {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedMovies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMoviesByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMoviesByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMovieById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Movie | null>({
    queryKey: ["movie", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMovieById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSearchMovies(query: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies", "search", query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchMoviesByTitle(query);
    },
    enabled: !!actor && !isFetching && !!query.trim(),
  });
}

export function useWatchlistIds() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchlistIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useContinueWatching() {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, bigint][]>({
    queryKey: ["continueWatching"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContinueWatching();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWatchlistMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const addToWatchlist = useMutation({
    mutationFn: async (movieId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addToWatchlist(movieId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
  const removeFromWatchlist = useMutation({
    mutationFn: async (movieId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.removeFromWatchlist(movieId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
  return { addToWatchlist, removeFromWatchlist };
}

export function useUpdateContinueWatching() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      movieId,
      progress,
    }: { movieId: bigint; progress: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateContinueWatching(movieId, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["continueWatching"] });
    },
  });
}

export function useAdminCheck() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["admin", "isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addMovie = useMutation({
    mutationFn: async (input: MovieInput) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addMovie(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  const updateMovie = useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: MovieInput }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateMovie(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  const deleteMovie = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteMovie(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  return { addMovie, updateMovie, deleteMovie };
}
