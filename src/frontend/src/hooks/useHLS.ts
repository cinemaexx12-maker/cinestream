import { useEffect, useRef, useState } from "react";

interface HLSResult {
  hlsLevel: number;
  hlsLevels: Array<{ height: number; bitrate: number }>;
}

// Dynamically load hls.js from CDN to avoid build-time dependency
let hlsPromise: Promise<typeof import("hls.js").default> | null = null;

async function getHls() {
  if (hlsPromise) return hlsPromise;
  hlsPromise = new Promise((resolve, reject) => {
    // Try to load hls.js from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js";
    script.onload = () => {
      // biome-ignore lint/suspicious/noExplicitAny: CDN global
      const Hls = (window as any).Hls;
      if (Hls) {
        resolve(Hls);
      } else {
        reject(new Error("Hls not found on window after script load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load hls.js from CDN"));
    document.head.appendChild(script);
  });
  return hlsPromise;
}

export function useHLS(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  src: string | undefined,
): HLSResult {
  // biome-ignore lint/suspicious/noExplicitAny: hls.js instance
  const hlsRef = useRef<any>(null);
  const [hlsLevel, setHlsLevel] = useState(-1);
  const [hlsLevels, setHlsLevels] = useState<
    Array<{ height: number; bitrate: number }>
  >([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHLS = src.includes(".m3u8");

    if (isHLS) {
      getHls()
        .then((Hls) => {
          if (!video) return;
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 30,
              maxBufferHole: 0.5,
              startLevel: -1,
              lowLatencyMode: true,
              enableWorker: true,
            });
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(
              Hls.Events.MANIFEST_PARSED,
              (
                _event: unknown,
                data: { levels: Array<{ height: number; bitrate: number }> },
              ) => {
                setHlsLevels(
                  data.levels.map((l) => ({
                    height: l.height,
                    bitrate: l.bitrate,
                  })),
                );
              },
            );

            hls.on(
              Hls.Events.LEVEL_SWITCHED,
              (_event: unknown, data: { level: number }) => {
                setHlsLevel(data.level);
              },
            );
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
          } else {
            video.src = src;
          }
        })
        .catch(() => {
          // Fallback: set src directly
          if (video) video.src = src;
        });
    } else {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoRef, src]);

  return { hlsLevel, hlsLevels };
}
