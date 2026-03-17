import type { TMDBMovie } from "../types/tmdb";

/**
 * 5 hardcoded real TMDB movies used ONLY for debug rendering verification.
 * These are shown immediately on load to confirm the UI can render movie cards.
 * Once the real TMDB API fetch succeeds, React Query replaces this placeholder
 * data with live results automatically (via placeholderData in useTMDB hooks).
 *
 * If these cards render but live data never appears → issue is API connectivity.
 * If even these cards don't render → issue is UI/component rendering.
 */
export const DEBUG_PLACEHOLDER_MOVIES: TMDBMovie[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    vote_average: 8.2,
    vote_count: 4200,
    overview:
      "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen.",
    release_date: "2024-03-01",
    genre_ids: [878, 12],
    adult: false,
    popularity: 320.5,
  },
  {
    id: 872585,
    title: "Oppenheimer",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    vote_average: 8.1,
    vote_count: 5600,
    overview:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb.",
    release_date: "2023-07-19",
    genre_ids: [18, 36],
    adult: false,
    popularity: 410.3,
  },
  {
    id: 414906,
    title: "The Batman",
    poster_path: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    vote_average: 7.8,
    vote_count: 8700,
    overview:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
    release_date: "2022-03-04",
    genre_ids: [80, 9648, 28],
    adult: false,
    popularity: 188.4,
  },
  {
    id: 848326,
    title: "Rebel Moon - Part One",
    poster_path: "/ui4DrH1cKk2vkHFy5OkNHO2ohor.jpg",
    backdrop_path: "/iA5FY7GmB2jfOnH7T5pibVHNQS5.jpg",
    vote_average: 6.1,
    vote_count: 3200,
    overview:
      "A peaceful colony on the edge of the galaxy finds itself threatened by the armies of a tyrannical regent.",
    release_date: "2023-12-22",
    genre_ids: [878, 28, 12],
    adult: false,
    popularity: 290.1,
  },
  {
    id: 361743,
    title: "Top Gun: Maverick",
    poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop_path: "/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg",
    vote_average: 8.3,
    vote_count: 11200,
    overview:
      "After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
    release_date: "2022-05-27",
    genre_ids: [28, 18],
    adult: false,
    popularity: 205.7,
  },
];
