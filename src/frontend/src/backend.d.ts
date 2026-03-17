import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Subscription {
    expiryDate: bigint;
    plan: string;
    paymentId: string;
    startDate: bigint;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MovieInput {
    categories: Array<string>;
    title: string;
    duration: bigint;
    thumbnailUrl: string;
    isPremium: boolean;
    year: bigint;
    description: string;
    isFeatured: boolean;
    genre: string;
    rating: number;
    videoUrl: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Movie {
    id: bigint;
    categories: Array<string>;
    title: string;
    duration: bigint;
    thumbnailUrl: string;
    isPremium: boolean;
    year: bigint;
    description: string;
    isFeatured: boolean;
    genre: string;
    rating: number;
    videoUrl: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ContinueWatchingProgress {
    movieId: bigint;
    progressSeconds: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    displayName: string;
    avatarUrl: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMovie(input: MovieInput): Promise<bigint>;
    addToTMDBWatchlist(tmdbMovieId: bigint): Promise<void>;
    addToWatchlist(movieId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelSubscription(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteMovie(id: bigint): Promise<void>;
    getAllMovies(): Promise<Array<Movie>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContinueWatching(): Promise<Array<ContinueWatchingProgress>>;
    getFeaturedMovies(): Promise<Array<Movie>>;
    getMovieById(id: bigint): Promise<Movie>;
    getMoviesByCategory(category: string): Promise<Array<Movie>>;
    getPremiumMovies(): Promise<Array<Movie>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubscription(): Promise<Subscription | null>;
    getTMDBWatchlistIds(): Promise<Array<bigint>>;
    getTopGenres(): Promise<Array<bigint>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWatchlistIds(): Promise<Array<bigint>>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    recordGenreInteraction(genreIds: Array<bigint>, weight: bigint): Promise<void>;
    removeContinueWatching(movieId: bigint): Promise<void>;
    removeFromTMDBWatchlist(tmdbMovieId: bigint): Promise<void>;
    removeFromWatchlist(movieId: bigint): Promise<void>;
    reorderTMDBWatchlist(newOrder: Array<bigint>): Promise<void>;
    reorderWatchlist(newOrder: Array<bigint>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSubscription(subscription: Subscription): Promise<void>;
    searchMoviesByTitle(title: string): Promise<Array<Movie>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    getMoviesByGenre(genreId: bigint): Promise<string>;
    getNowPlaying(): Promise<string>;
    getPopular(): Promise<string>;
    getTopRated(): Promise<string>;
    getTrending(): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateContinueWatching(movieId: bigint, progress: bigint): Promise<void>;
    updateMovie(id: bigint, input: MovieInput): Promise<void>;
}
