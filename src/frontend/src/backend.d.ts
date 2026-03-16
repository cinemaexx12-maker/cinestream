import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Movie {
    id: bigint;
    categories: Array<string>;
    title: string;
    duration: bigint;
    thumbnailUrl: string;
    year: bigint;
    description: string;
    isFeatured: boolean;
    genre: string;
    rating: number;
    videoUrl: string;
}
export interface MovieInput {
    categories: Array<string>;
    title: string;
    duration: bigint;
    thumbnailUrl: string;
    year: bigint;
    description: string;
    isFeatured: boolean;
    genre: string;
    rating: number;
    videoUrl: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMovie(input: MovieInput): Promise<bigint>;
    addToWatchlist(movieId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMovie(id: bigint): Promise<void>;
    getAllMovies(): Promise<Array<Movie>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContinueWatching(): Promise<Array<[bigint, bigint]>>;
    getFeaturedMovies(): Promise<Array<Movie>>;
    getMovieById(id: bigint): Promise<Movie>;
    getMoviesByCategory(category: string): Promise<Array<Movie>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWatchlistIds(): Promise<Array<bigint>>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeFromWatchlist(movieId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMoviesByTitle(title: string): Promise<Array<Movie>>;
    updateContinueWatching(movieId: bigint, progress: bigint): Promise<void>;
    updateMovie(id: bigint, input: MovieInput): Promise<void>;
}
