import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Debug "mo:core/Debug";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  type ContinueWatchingProgress = {
    movieId : Nat;
    progressSeconds : Nat;
  };

  type GenreScore = {
    genreId : Nat;
    score : Nat;
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
    isPremium : Bool;
    categories : [Text];
  };

  public type Subscription = {
    plan : Text;
    paymentId : Text;
    startDate : Int;
    expiryDate : Int;
  };

  public type UserProfile = {
    displayName : Text;
    avatarUrl : Text;
  };

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
    isPremium : Bool;
    categories : [Text];
  };

  // State management
  var nextMovieId = 1;
  let movies = Map.empty<Nat, Movie>();
  let watchlists = Map.empty<Principal, List.List<Nat>>();
  let tmdbWatchlists = Map.empty<Principal, List.List<Nat>>();
  let continueWatching = Map.empty<Principal, List.List<ContinueWatchingProgress>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let subscriptions = Map.empty<Principal, Subscription>();
  let genreScores = Map.empty<Principal, Map.Map<Nat, Nat>>();
  let accessControlState = AccessControl.initState();

  // Mixin authorization
  include MixinAuthorization(accessControlState);

  module Movie {
    public func compareByRatingAscending(movie1 : Movie, movie2 : Movie) : Order.Order {
      switch (Float.compare(movie1.rating, movie2.rating)) {
        case (#equal) { Nat.compare(movie1.id, movie2.id) };
        case (order) { order };
      };
    };
  };

  module GenreScore {
    public func compareScoreDescending(a : GenreScore, b : GenreScore) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  // Helper function to check if user has active subscription
  func hasActiveSubscription(caller : Principal) : Bool {
    switch (subscriptions.get(caller)) {
      case (null) { false };
      case (?sub) {
        let currentTime = Time.now() / 1_000_000_000;
        currentTime >= sub.startDate and currentTime <= sub.expiryDate;
      };
    };
  };

  // Movie Management
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
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
        isPremium = false;
        categories = ["Drama", "Romance"];
      },
    ];

    let array = sampleMovies.map(func(m) { (m.id, m) });
    for (entry in array.values()) {
      movies.add(entry.0, entry.1);
    };
    nextMovieId := 16;
  };

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

  // Movie Queries
  public query ({ caller }) func getAllMovies() : async [Movie] {
    movies.values().toArray();
  };

  public query ({ caller }) func getMovieById(id : Nat) : async Movie {
    switch (movies.get(id)) {
      case (?movie) {
        if (movie.isPremium) {
          if (not AccessControl.isAdmin(accessControlState, caller) and not hasActiveSubscription(caller)) {
            Runtime.trap("Unauthorized: Premium content requires an active subscription");
          };
        };
        movie;
      };
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

  public query ({ caller }) func getPremiumMovies() : async [Movie] {
    if (not AccessControl.isAdmin(accessControlState, caller) and not hasActiveSubscription(caller)) {
      Runtime.trap("Unauthorized: Premium content requires an active subscription");
    };
    let allMovies = movies.values().toArray();
    let premium = allMovies.filter(func(movie) { movie.isPremium });
    premium.sort(Movie.compareByRatingAscending);
  };

  // User Profile Management
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

  // Subscription Management
  public shared ({ caller }) func saveSubscription(subscription : Subscription) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save subscriptions");
    };
    subscriptions.add(caller, subscription);
  };

  public query ({ caller }) func getSubscription() : async ?Subscription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get subscriptions");
    };
    subscriptions.get(caller);
  };

  public shared ({ caller }) func cancelSubscription() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel subscriptions");
    };
    subscriptions.remove(caller);
  };

  // Stripe Integration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe must be configured before using it") };
      case (?config) { config };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Watchlist Methods
  public shared ({ caller }) func addToWatchlist(movieId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add to watchlist");
    };

    switch (movies.get(movieId)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?movie) {
        if (movie.isPremium and not hasActiveSubscription(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot add premium content without active subscription");
        };
      };
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

  public shared ({ caller }) func reorderWatchlist(newOrder : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can reorder watchlist");
    };
    let validIds = newOrder.filter(func(movieId) { switch (movies.get(movieId)) { case (?_) { true }; case (null) { false } } });
    let newWatchlist = List.fromArray<Nat>(validIds);
    watchlists.add(caller, newWatchlist);
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

  // TMDB Watchlist Methods
  public shared ({ caller }) func addToTMDBWatchlist(tmdbMovieId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add to TMDB watchlist");
    };

    switch (tmdbWatchlists.get(caller)) {
      case (null) {
        let newWatchlist = List.singleton<Nat>(tmdbMovieId);
        tmdbWatchlists.add(caller, newWatchlist);
      };
      case (?existing) {
        if (existing.contains(tmdbMovieId)) {
          Runtime.trap("Movie already in your TMDB watchlist");
        };
        existing.add(tmdbMovieId);
      };
    };
  };

  public shared ({ caller }) func removeFromTMDBWatchlist(tmdbMovieId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from TMDB watchlist");
    };
    switch (tmdbWatchlists.get(caller)) {
      case (null) { Runtime.trap("Movie is not in your TMDB watchlist") };
      case (?existing) {
        if (not existing.contains(tmdbMovieId)) {
          Runtime.trap("Movie is not in your TMDB watchlist");
        };
        let updatedWatchlist = existing.filter(func(id) { id != tmdbMovieId });
        tmdbWatchlists.add(caller, updatedWatchlist);
      };
    };
  };

  public shared ({ caller }) func reorderTMDBWatchlist(newOrder : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can reorder TMDB watchlist");
    };
    let newWatchlist = List.fromArray<Nat>(newOrder);
    tmdbWatchlists.add(caller, newWatchlist);
  };

  public query ({ caller }) func getTMDBWatchlistIds() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access TMDB watchlist");
    };
    switch (tmdbWatchlists.get(caller)) {
      case (null) { [] };
      case (?watchlist) { watchlist.toArray() };
    };
  };

  // Continue Watching Methods
  public shared ({ caller }) func updateContinueWatching(movieId : Nat, progress : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update continue watching progress");
    };

    switch (movies.get(movieId)) {
      case (null) { Runtime.trap("Movie not found") };
      case (?movie) {
        if (movie.isPremium and not hasActiveSubscription(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot track progress for premium content without active subscription");
        };
      };
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

  public query ({ caller }) func getContinueWatching() : async [ContinueWatchingProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access continue watching");
    };
    switch (continueWatching.get(caller)) {
      case (null) { [] };
      case (?progressList) {
        progressList.toArray().filter(func(p) { p.progressSeconds > 0 });
      };
    };
  };

  public shared ({ caller }) func removeContinueWatching(movieId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove continue watching entries");
    };
    switch (continueWatching.get(caller)) {
      case (null) { Runtime.trap("No continue watching entries found") };
      case (?progressList) {
        let filtered = progressList.filter(func(p) { p.movieId != movieId });
        continueWatching.add(caller, filtered);
      };
    };
  };

  public shared ({ caller }) func recordGenreInteraction(genreIds : [Nat], weight : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record genre interaction");
    };

    let currentUserScores = switch (genreScores.get(caller)) {
      case (?score) { score };
      case (null) { Map.empty<Nat, Nat>() };
    };

    for (genreId in genreIds.values()) {
      let currentScore = switch (currentUserScores.get(genreId)) {
        case (?score) { score };
        case (null) { 0 };
      };
      currentUserScores.add(genreId, currentScore + weight);
    };

    genreScores.add(caller, currentUserScores);
  };

  public query ({ caller }) func getTopGenres() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get top genres");
    };

    switch (genreScores.get(caller)) {
      case (null) { [] };
      case (?userScores) {
        let genreArray : [GenreScore] = userScores.toArray().map(func(entry) { { genreId = entry.0; score = entry.1 } });
        let sorted = genreArray.sort(GenreScore.compareScoreDescending);
        let top5 = sorted.sliceToArray(0, if (sorted.size() < 5) { sorted.size() } else { 5 });
        top5.map(func(entry) { entry.genreId });
      };
    };
  };

  // ─── TMDB Proxy Methods ───────────────────────────────────────────────────
  // API key stored securely in backend — never exposed to the browser.
  let tmdbApiKey = "d56aeba5c5eec755e3dd0c84cf8b88f5";
  let tmdbBase = "https://api.themoviedb.org/3";

  // In-memory cache: endpoint path -> (timestamp, bodyText)
  let tmdbCache = Map.empty<Text, (Int, Text)>();
  let tmdbCacheTTL : Int = 30 * 60 * 1_000_000_000; // 30 minutes in nanoseconds

  // Per-genreId cache: genreId -> (timestamp, bodyText)
  let genreCache = Map.empty<Nat, (Int, Text)>();

  // Common fetch utility: cache check → HTTP outcall with proper headers →
  // UTF-8 decode → retry once on failure → fallback to stale cache or "{}".
  func tmdbFetch(path : Text) : async Text {
    let now = Time.now();

    // Return fresh cache if available
    switch (tmdbCache.get(path)) {
      case (?(ts, body)) {
        if (now - ts < tmdbCacheTTL) {
          Debug.print("[TMDB] cache hit: " # path);
          return body;
        };
      };
      case (null) {};
    };

    Debug.print("[TMDB] request start: " # path);

    let sep = if (path.contains(#char '?')) { "&" } else { "?" };
    let url = tmdbBase # path # sep # "api_key=" # tmdbApiKey;

    // First attempt
    let result : Text = try {
      let raw = await OutCall.httpGetRequest(url, [], transform);
      Debug.print("[TMDB] response received: " # path);
      if (raw == "" or raw == "{}") {
        switch (tmdbCache.get(path)) {
          case (?(_, stale)) { return stale };
          case (null) { return "{}" };
        };
      };
      raw;
    } catch (_) {
      Debug.print("[TMDB] request failed, retrying: " # path);
      // Retry once
      try {
        let raw2 = await OutCall.httpGetRequest(url, [], transform);
        Debug.print("[TMDB] response received (retry): " # path);
        if (raw2 == "" or raw2 == "{}") {
          switch (tmdbCache.get(path)) {
            case (?(_, stale)) { return stale };
            case (null) { return "{}" };
          };
        };
        raw2;
      } catch (_) {
        Debug.print("[TMDB] request failed again, using fallback: " # path);
        switch (tmdbCache.get(path)) {
          case (?(_, stale)) { return stale };
          case (null) { return "{}" };
        };
      };
    };

    // Update cache and return
    tmdbCache.add(path, (now, result));
    result;
  };

  public func getTrending() : async Text {
    await tmdbFetch("/trending/movie/day");
  };

  public func getPopular() : async Text {
    await tmdbFetch("/movie/popular");
  };

  public func getTopRated() : async Text {
    await tmdbFetch("/movie/top_rated");
  };

  public func getNowPlaying() : async Text {
    await tmdbFetch("/movie/now_playing");
  };

  public func getMovieDetails(id : Nat) : async Text {
    await tmdbFetch("/movie/" # id.toText());
  };

  public func getMovieVideos(id : Nat) : async Text {
    await tmdbFetch("/movie/" # id.toText() # "/videos");
  };

  public func getSimilarMovies(id : Nat) : async Text {
    await tmdbFetch("/movie/" # id.toText() # "/similar");
  };

  // Genre-based discovery — uses a per-genreId in-memory cache
  public func getMoviesByGenre(genreId : Nat) : async Text {
    let now = Time.now();

    // Return fresh cache if available
    switch (genreCache.get(genreId)) {
      case (?(ts, body)) {
        if (now - ts < tmdbCacheTTL) {
          Debug.print("[TMDB] genre cache hit: " # genreId.toText());
          return body;
        };
      };
      case (null) {};
    };

    Debug.print("[TMDB] genre request start: " # genreId.toText());

    let url = tmdbBase # "/discover/movie?with_genres=" # genreId.toText() # "&sort_by=popularity.desc&api_key=" # tmdbApiKey;

    let fetchOnce = func() : async Text {
      let raw = await OutCall.httpGetRequest(url, [], transform);
      Debug.print("[TMDB] genre response received: " # genreId.toText());
      raw;
    };

    let result : Text = try {
      let raw = await fetchOnce();
      if (raw == "" or raw == "{}") {
        switch (genreCache.get(genreId)) {
          case (?(_, stale)) { return stale };
          case (null) { return "{}" };
        };
      };
      raw;
    } catch (_) {
      Debug.print("[TMDB] genre request failed, retrying: " # genreId.toText());
      try {
        let raw2 = await fetchOnce();
        if (raw2 == "" or raw2 == "{}") {
          switch (genreCache.get(genreId)) {
            case (?(_, stale)) { return stale };
            case (null) { return "{}" };
          };
        };
        raw2;
      } catch (_) {
        Debug.print("[TMDB] genre request failed again, using fallback: " # genreId.toText());
        switch (genreCache.get(genreId)) {
          case (?(_, stale)) { return stale };
          case (null) { return "{}" };
        };
      };
    };

    genreCache.add(genreId, (now, result));
    result;
  };

};
