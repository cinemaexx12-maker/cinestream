import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

module {
  type ContinueWatchingProgress = {
    movieId : Nat;
    progressSeconds : Nat;
  };

  type OldMovie = {
    id : Nat;
    title : Text;
    description : Text;
    genre : Text;
    year : Nat;
    rating : Float;
    duration : Nat;
    thumbnailUrl : Text;
    videoUrl : Text;
    isFeatured : Bool;
    categories : [Text];
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActor = {
    movies : List.List<OldMovie>;
    watchlists : Map.Map<Principal, List.List<Nat>>;
    continueWatching : Map.Map<Principal, List.List<ContinueWatchingProgress>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type Movie = {
    id : Nat;
    title : Text;
    description : Text;
    genre : Text;
    year : Nat;
    rating : Float;
    duration : Nat;
    thumbnailUrl : Text;
    videoUrl : Text;
    isFeatured : Bool;
    categories : [Text];
  };

  type UserProfile = {
    name : Text;
  };

  type NewActor = {
    movies : Map.Map<Nat, Movie>;
    watchlists : Map.Map<Principal, List.List<Nat>>;
    continueWatching : Map.Map<Principal, List.List<ContinueWatchingProgress>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newMovies = Map.fromIter<Nat, Movie>(
      old.movies.reverse().values().enumerate().map(
        func((index, movie)) { (movie.id, movie) }
      )
    );
    {
      old with
      movies = newMovies
    };
  };
};
