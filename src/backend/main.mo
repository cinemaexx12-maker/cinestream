import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Order "mo:core/Order";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Enable migration with data transformation
(with migration = Migration.run)
actor {
  // Types
  type ContinueWatchingProgress = {
    movieId : Nat;
    progressSeconds : Nat;
  };

  public type Movie = {
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

  // Input type for creating/updating movies (no id)
  public type MovieInput = {
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

  public type UserProfile = {
    name : Text;
  };

  module Movie {
    public func compareByRatingAscending(movie1 : Movie, movie2 : Movie) : Order.Order {
      switch (Float.compare(movie1.rating, movie2.rating)) {
        case (#equal) { Nat.compare(movie1.id, movie2.id) };
        case (order) { order };
      };
    };
  };

  // State
  var nextMovieId = 1; // Track next available movie ID

  // Map from movie ID to Movie
  let movies = Map.empty<Nat, Movie>();

  // Watchlists: Map from user Principal to List of movie IDs
  let watchlists = Map.empty<Principal, List.List<Nat>>();

  // Continue Watching: Map from user Principal to List of ContinueWatchingProgress
  let continueWatching = Map.empty<Principal, List.List<ContinueWatchingProgress>>();

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ADMIN MOVIE CRUD METHODS

  // Add movie (admin only)
  public shared ({ caller }) func addMovie(input : MovieInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add movies");
    };

    let newMovie : Movie = {
      input with id = nextMovieId;
    };

    movies.add(nextMovieId, newMovie);
    nextMovieId += 1;
    newMovie.id;
  };

  // Update movie (admin only)
  public shared ({ caller }) func updateMovie(id : Nat, input : MovieInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update movies");
    };

    let updatedMovie : Movie = {
      input with id;
    };

    switch (movies.get(id)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?_) {
        movies.add(id, updatedMovie);
      };
    };
  };

  // Delete movie (admin only)
  public shared ({ caller }) func deleteMovie(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete movies");
    };

    switch (movies.get(id)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?_) {
        movies.remove(id);
      };
    };
  };

  // Initialize with sample movies (admin only)
  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize movies");
    };

    let sampleMovies : [Movie] = [
      {
        id = 1;
        title = "Inception";
        description = "A mind-bending thriller";
        genre = "Sci-Fi";
        year = 2010;
        rating = 8.8;
        duration = 148;
        thumbnailUrl = "inception.jpg";
        videoUrl = "inception.mp4";
        isFeatured = true;
        categories = ["Trending", "Sci-Fi"];
      },
      {
        id = 2;
        title = "The Shawshank Redemption";
        description = "A story of hope and friendship";
        genre = "Drama";
        year = 1994;
        rating = 9.3;
        duration = 142;
        thumbnailUrl = "shawshank.jpg";
        videoUrl = "shawshank.mp4";
        isFeatured = false;
        categories = ["Drama", "Classics"];
      },
      {
        id = 3;
        title = "The Dark Knight";
        description = "Batman faces the Joker";
        genre = "Action";
        year = 2008;
        rating = 9.0;
        duration = 152;
        thumbnailUrl = "dark_knight.jpg";
        videoUrl = "dark_knight.mp4";
        isFeatured = false;
        categories = ["Action", "Superhero"];
      },
      {
        id = 4;
        title = "Pulp Fiction";
        description = "Interwoven crime stories";
        genre = "Crime";
        year = 1994;
        rating = 8.9;
        duration = 154;
        thumbnailUrl = "pulp_fiction.jpg";
        videoUrl = "pulp_fiction.mp4";
        isFeatured = false;
        categories = ["Crime", "Classics"];
      },
      {
        id = 5;
        title = "Forrest Gump";
        description = "The journey of Forrest Gump";
        genre = "Drama";
        year = 1994;
        rating = 8.8;
        duration = 142;
        thumbnailUrl = "forrest_gump.jpg";
        videoUrl = "forrest_gump.mp4";
        isFeatured = true;
        categories = ["Drama", "Biography"];
      },
      {
        id = 6;
        title = "The Matrix";
        description = "A world within a computer";
        genre = "Sci-Fi";
        year = 1999;
        rating = 8.7;
        duration = 136;
        thumbnailUrl = "matrix.jpg";
        videoUrl = "matrix.mp4";
        isFeatured = true;
        categories = ["Sci-Fi", "Action"];
      },
      {
        id = 7;
        title = "Fight Club";
        description = "An underground fight club";
        genre = "Drama";
        year = 1999;
        rating = 8.8;
        duration = 139;
        thumbnailUrl = "fight_club.jpg";
        videoUrl = "fight_club.mp4";
        isFeatured = false;
        categories = ["Drama", "Thriller"];
      },
      {
        id = 8;
        title = "Interstellar";
        description = "A journey through space and time";
        genre = "Sci-Fi";
        year = 2014;
        rating = 8.6;
        duration = 169;
        thumbnailUrl = "interstellar.jpg";
        videoUrl = "interstellar.mp4";
        isFeatured = true;
        categories = ["Sci-Fi", "Adventure"];
      },
      {
        id = 9;
        title = "Gladiator";
        description = "A Roman general's revenge";
        genre = "Action";
        year = 2000;
        rating = 8.5;
        duration = 155;
        thumbnailUrl = "gladiator.jpg";
        videoUrl = "gladiator.mp4";
        isFeatured = false;
        categories = ["Action", "Historical"];
      },
      {
        id = 10;
        title = "The Godfather";
        description = "The story of the Corleone family";
        genre = "Crime";
        year = 1972;
        rating = 9.2;
        duration = 175;
        thumbnailUrl = "godfather.jpg";
        videoUrl = "godfather.mp4";
        isFeatured = true;
        categories = ["Crime", "Classics"];
      },
      {
        id = 11;
        title = "The Lord of the Rings: The Fellowship of the Ring";
        description = "The beginning of an epic journey";
        genre = "Fantasy";
        year = 2001;
        rating = 8.8;
        duration = 178;
        thumbnailUrl = "lotr_fellowship.jpg";
        videoUrl = "lotr_fellowship.mp4";
        isFeatured = false;
        categories = ["Fantasy", "Adventure"];
      },
      {
        id = 12;
        title = "Star Wars: Episode IV - A New Hope";
        description = "The start of the Star Wars saga";
        genre = "Sci-Fi";
        year = 1977;
        rating = 8.6;
        duration = 121;
        thumbnailUrl = "star_wars_iv.jpg";
        videoUrl = "star_wars_iv.mp4";
        isFeatured = false;
        categories = ["Sci-Fi", "Adventure"];
      },
      {
        id = 13;
        title = "Jurassic Park";
        description = "Dinosaurs roam the earth";
        genre = "Adventure";
        year = 1993;
        rating = 8.1;
        duration = 127;
        thumbnailUrl = "jurassic_park.jpg";
        videoUrl = "jurassic_park.mp4";
        isFeatured = true;
        categories = ["Adventure", "Sci-Fi"];
      },
      {
        id = 14;
        title = "Avatar";
        description = "A journey to Pandora";
        genre = "Sci-Fi";
        year = 2009;
        rating = 7.8;
        duration = 162;
        thumbnailUrl = "avatar.jpg";
        videoUrl = "avatar.mp4";
        isFeatured = false;
        categories = ["Sci-Fi", "Adventure"];
      },
      {
        id = 15;
        title = "Titanic";
        description = "A love story on the Titanic";
        genre = "Drama";
        year = 1997;
        rating = 7.8;
        duration = 195;
        thumbnailUrl = "titanic.jpg";
        videoUrl = "titanic.mp4";
        isFeatured = true;
        categories = ["Drama", "Romance"];
      },
    ];

    let array = sampleMovies.map(func(m) { (m.id, m) });
    for (entry in array.values()) {
      movies.add(entry.0, entry.1);
    };
    nextMovieId := 16;
  };

  // General Query Functions

  public query ({ caller }) func getAllMovies() : async [Movie] {
    movies.values().toArray();
  };

  public query ({ caller }) func getMovieById(id : Nat) : async Movie {
    switch (movies.get(id)) {
      case (?movie) { movie };
      case (null) { Runtime.trap("Movie not found") };
    };
  };

  public query ({ caller }) func searchMoviesByTitle(title : Text) : async [Movie] {
    let allMovies = movies.values().toArray();
    let results = allMovies.filter(
      func(movie) {
        movie.title.toLower().contains(#text(title.toLower()));
      }
    );
    results;
  };

  public query ({ caller }) func getMoviesByCategory(category : Text) : async [Movie] {
    let allMovies = movies.values().toArray();
    let results = allMovies.filter(
      func(movie) {
        movie.categories.find(
          func(cat) {
            cat.toLower().contains(#text(category.toLower()));
          }
        ) != null;
      }
    );
    results;
  };

  public query ({ caller }) func getFeaturedMovies() : async [Movie] {
    let allMovies = movies.values().toArray();
    let featured = allMovies.filter(func(movie) { movie.isFeatured });
    featured.sort(Movie.compareByRatingAscending);
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // WATCHLIST METHODS

  public shared ({ caller }) func addToWatchlist(movieId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add to watchlist");
    };
    // Validate movie exists
    switch (movies.get(movieId)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?_) {};
    };

    switch (watchlists.get(caller)) {
      case (null) {
        let newWatchlist = List.singleton<Nat>(movieId);
        watchlists.add(caller, newWatchlist);
      };
      case (?existing) {
        if (existing.contains(movieId)) {
          Runtime.trap("Movie already in your watchlist");
        };
        existing.add(movieId);
      };
    };
  };

  public shared ({ caller }) func removeFromWatchlist(movieId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from watchlist");
    };
    switch (watchlists.get(caller)) {
      case (null) { Runtime.trap("Movie is not in your watchlist") };
      case (?existing) {
        if (not existing.contains(movieId)) {
          Runtime.trap("Movie is not in your watchlist");
        };
        let updatedWatchlist = existing.filter(func(id) { id != movieId });
        watchlists.add(caller, updatedWatchlist);
      };
    };
  };

  public query ({ caller }) func getWatchlistIds() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access watchlist");
    };
    switch (watchlists.get(caller)) {
      case (null) { [] };
      case (?watchlist) { watchlist.toArray() };
    };
  };

  // CONTINUE WATCHING METHODS

  public shared ({ caller }) func updateContinueWatching(movieId : Nat, progress : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update continue watching progress");
    };

    switch (movies.get(movieId)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?_) {};
    };

    let newProgress : ContinueWatchingProgress = {
      movieId;
      progressSeconds = progress;
    };

    switch (continueWatching.get(caller)) {
      case (null) {
        let newProgressList = List.singleton<ContinueWatchingProgress>(newProgress);
        continueWatching.add(caller, newProgressList);
      };
      case (?existing) {
        let filtered = existing.filter(func(p) { p.movieId != movieId });
        filtered.add(newProgress);
        continueWatching.add(caller, filtered);
      };
    };
  };

  public query ({ caller }) func getContinueWatching() : async [(Nat, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access continue watching");
    };
    switch (continueWatching.get(caller)) {
      case (null) { [] };
      case (?progressList) {
        let reversed = progressList.reverse();
        let filtered = reversed.toArray().filter(func(p) { p.progressSeconds > 0 });
        filtered.map(func(p) { (p.movieId, p.progressSeconds) });
      };
    };
  };
};
