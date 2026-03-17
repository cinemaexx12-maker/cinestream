import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Movie,
  MovieInput,
  ShoppingItem,
  Subscription,
  UserProfile,
} from "../backend";
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

export function useTMDBWatchlistIds() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["tmdb", "watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTMDBWatchlistIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTMDBWatchlistMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addToTMDBWatchlist = useMutation({
    mutationFn: async (tmdbId: number) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addToTMDBWatchlist(BigInt(tmdbId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tmdb", "watchlist"] });
    },
  });

  const removeFromTMDBWatchlist = useMutation({
    mutationFn: async (tmdbId: number) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.removeFromTMDBWatchlist(BigInt(tmdbId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tmdb", "watchlist"] });
    },
  });

  return { addToTMDBWatchlist, removeFromTMDBWatchlist };
}

import type { ContinueWatchingProgress } from "../backend";

export function useContinueWatching() {
  const { actor, isFetching } = useActor();
  return useQuery<ContinueWatchingProgress[]>({
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

export function useRemoveContinueWatching() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (movieId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.removeContinueWatching(movieId);
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

export function useTopGenres() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["topGenres"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopGenres();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordGenreInteraction() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      genreIds,
      weight,
    }: { genreIds: bigint[]; weight: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.recordGenreInteraction(genreIds, weight);
    },
  });
}

export function useSubscription() {
  const { actor, isFetching } = useActor();
  return useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubscription();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubscriptionMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const saveSubscription = useMutation({
    mutationFn: async (sub: Subscription) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveSubscription(sub);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.cancelSubscription();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  return { saveSubscription, cancelSubscription };
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfileMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useReorderWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder: bigint[]) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.reorderWatchlist(newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useReorderTMDBWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder: bigint[]) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.reorderTMDBWatchlist(newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tmdb", "watchlist"] });
    },
  });
}

export function useStripeCheckout() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}
