export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

const CACHE_TTL = 30 * 60 * 1000;

function getCache(key: string): YouTubeVideo[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: YouTubeVideo[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

async function searchYouTube(
  query: string,
  cacheKey: string,
): Promise<YouTubeVideo[]> {
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  console.log("[YouTube] API key loaded:", !!apiKey);
  if (!apiKey) throw new Error("YouTube API key not configured");

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&key=${apiKey}&q=${encodeURIComponent(query)}`;
  console.log("[YouTube] Request started:", query);

  const res = await fetch(url);
  console.log("[YouTube] Response status:", res.status);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);

  const json = await res.json();
  const videos: YouTubeVideo[] = (json.items || [])
    .map((item: any) => ({
      videoId: item.id?.videoId || "",
      title: item.snippet?.title || "",
      channelTitle: item.snippet?.channelTitle || "",
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",
    }))
    .filter((v: YouTubeVideo) => v.videoId);

  console.log("[YouTube] Data parsed:", videos.length, "videos");
  setCache(cacheKey, videos);
  return videos;
}

export const fetchTrendingSongs = () =>
  searchYouTube("trending songs", "youtube_trending_cache");
export const fetchBollywoodSongs = () =>
  searchYouTube("bollywood songs", "youtube_bollywood_cache");
export const fetchLofiBeats = () =>
  searchYouTube("lofi beats", "youtube_lofi_cache");
export const fetchPunjabiSongs = () =>
  searchYouTube("punjabi songs", "youtube_punjabi_cache");
