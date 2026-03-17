const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getStaleCache<T>(url: string): T | null {
  try {
    const raw = localStorage.getItem(`tmdb_cache:${url}`);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      return entry.data;
    }
  } catch {
    // ignore
  }
  return null;
}

function maskUrl(url: string): string {
  // Hide API key from logs
  return url.replace(/api_key=[^&]+/, "api_key=***");
}

export function cachedFetch<T>(url: string): Promise<T> {
  const maskedUrl = maskUrl(url);

  // Check fresh cache first
  try {
    const raw = localStorage.getItem(`tmdb_cache:${url}`);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
        console.log(`[TMDB] Cache hit: ${maskedUrl}`);
        return Promise.resolve(entry.data);
      }
    }
  } catch {
    // ignore parse errors
  }

  console.log(`[TMDB] Request started: ${maskedUrl}`);
  const startTime = performance.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn(`[TMDB] Request timeout (5s): ${maskedUrl}`);
  }, 5000);

  return fetch(url, { signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - startTime);
      console.log(
        `[TMDB] Response status: ${res.status} | Time: ${elapsed}ms | URL: ${maskedUrl}`,
      );

      if (res.status === 401) {
        throw new Error(
          "[TMDB] 401 Unauthorized — API key is invalid or missing",
        );
      }
      if (res.status === 429) {
        throw new Error("[TMDB] 429 Rate limit exceeded — too many requests");
      }
      if (!res.ok) {
        throw new Error(`[TMDB] HTTP ${res.status} ${res.statusText}`);
      }

      return res.json() as Promise<T>;
    })
    .then((data) => {
      const elapsed = Math.round(performance.now() - startTime);
      console.log(
        `[TMDB] Data parsed | Total time: ${elapsed}ms | URL: ${maskedUrl}`,
      );
      try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now() };
        localStorage.setItem(`tmdb_cache:${url}`, JSON.stringify(entry));
        console.log(`[TMDB] State updated (cached) | URL: ${maskedUrl}`);
      } catch {
        // quota exceeded - skip caching
        console.warn("[TMDB] localStorage quota exceeded, skipping cache");
      }
      return data;
    })
    .catch((err: unknown) => {
      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[TMDB] Request failed after ${elapsed}ms: ${message} | URL: ${maskedUrl}`,
      );

      const stale = getStaleCache<T>(url);
      if (stale) {
        console.log(
          `[TMDB] Using stale localStorage cache as fallback | URL: ${maskedUrl}`,
        );
        return stale;
      }

      console.error(`[TMDB] No cache fallback available | URL: ${maskedUrl}`);
      throw err;
    });
}

export function clearTMDBCache(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("tmdb_cache:")) keys.push(key);
  }
  for (const k of keys) {
    localStorage.removeItem(k);
  }
}
