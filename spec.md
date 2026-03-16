# CineStream

## Current State
- Full Netflix-style streaming frontend with hero banner, movie rows (Trending, Popular Web Series, Latest, Top Rated, Continue Watching)
- Backend in Motoko with movies, watchlist, continue watching, user profiles, and authorization
- Movies are seeded via `initialize()` admin function; sample data lives in frontend `sampleMovies.ts`
- Internet Identity login via authorization mixin
- Search, watchlist, and video player page exist

## Requested Changes (Diff)

### Add
- **Admin Panel** (`/admin` route): Password/role-protected dashboard where the admin can:
  - Add new movies (title, description, genre, year, rating, duration, thumbnailUrl, videoUrl, isFeatured, categories)
  - Edit existing movies
  - Delete movies
  - View all movies in a table
- **Backend CRUD for movies**: `addMovie`, `updateMovie`, `deleteMovie` functions (admin-only)
- **SEO meta tags**: Dynamic `<title>`, `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`) on every page; `<meta name="robots" content="index, follow">` and canonical URLs; structured data (JSON-LD) for the homepage
- **sitemap.xml** and **robots.txt** in the public folder

### Modify
- Movies list on the homepage should use backend data (from `getAllMovies`) as primary source, falling back to sample data if empty
- Admin route must check `isCallerAdmin()` and redirect non-admins

### Remove
- Nothing removed

## Implementation Plan
1. Add `addMovie`, `updateMovie`, `deleteMovie` to Motoko backend (admin-only)
2. Update `backend.d.ts` to reflect new functions
3. Add `/admin` route to frontend with a full CRUD movie management table
4. Add SEO: dynamic helmet/meta tags per page, robots.txt, sitemap.xml
5. Wire homepage to prefer backend movie data
