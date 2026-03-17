import { useCallback, useEffect, useState } from "react";
import MusicCard from "../components/MusicCard";
import Navbar from "../components/Navbar";
import SectionHeader from "../components/SectionHeader";
import {
  type YouTubeVideo,
  fetchBollywoodSongs,
  fetchLofiBeats,
  fetchPunjabiSongs,
  fetchTrendingSongs,
} from "../services/youtubeMusic";

interface CategoryState {
  videos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

function SkeletonRow() {
  return (
    <div className="flex gap-4 px-4 sm:px-8 overflow-hidden">
      {SKELETON_KEYS.map((k) => (
        <div key={k} className="flex-shrink-0 w-44 sm:w-48">
          <div className="w-full aspect-video rounded-xl bg-white/10 animate-pulse mb-3" />
          <div className="h-3 w-32 bg-white/10 animate-pulse rounded mb-1.5" />
          <div className="h-2.5 w-20 bg-white/10 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

function MusicRow({
  state,
  onPlay,
  onRetry,
  sectionOcid,
}: {
  state: CategoryState;
  onPlay: (video: YouTubeVideo) => void;
  onRetry: () => void;
  sectionOcid: string;
}) {
  if (state.loading) return <SkeletonRow />;

  if (state.error) {
    return (
      <div
        data-ocid={`${sectionOcid}.error_state`}
        className="px-4 sm:px-8 py-6"
      >
        <p className="text-zinc-400 text-sm mb-3">
          Failed to load. Please try again.
        </p>
        <button
          type="button"
          data-ocid={`${sectionOcid}.button`}
          onClick={onRetry}
          className="text-sm px-4 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      data-ocid={sectionOcid}
      className="relative overflow-x-auto overflow-y-visible pb-4"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="flex gap-4 px-4 sm:px-8" style={{ width: "max-content" }}>
        {state.videos.map((video, i) => (
          <MusicCard
            key={video.videoId}
            video={video}
            index={i}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
}

function YouTubeMusicPlayer({
  video,
  onClose,
}: {
  video: YouTubeVideo;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      data-ocid="music.modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full border-0 bg-transparent cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Close button */}
        <button
          type="button"
          data-ocid="music.modal.close_button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
          aria-label="Close player"
        >
          <span>Close</span>
          <span className="text-lg leading-none">×</span>
        </button>

        {/* iframe */}
        <div
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: "16/9" }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
            title={video.title}
          />
        </div>

        {/* Video info */}
        <div className="mt-4 px-1">
          <h3 className="text-white font-semibold text-base leading-snug line-clamp-2">
            {video.title}
          </h3>
          <p className="text-zinc-400 text-sm mt-1">{video.channelTitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function MusicPage() {
  const [trending, setTrending] = useState<CategoryState>({
    videos: [],
    loading: true,
    error: null,
  });
  const [bollywood, setBollywood] = useState<CategoryState>({
    videos: [],
    loading: true,
    error: null,
  });
  const [lofi, setLofi] = useState<CategoryState>({
    videos: [],
    loading: true,
    error: null,
  });
  const [punjabi, setPunjabi] = useState<CategoryState>({
    videos: [],
    loading: true,
    error: null,
  });

  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);

  const loadTrending = useCallback(() => {
    setTrending((s) => ({ ...s, loading: true, error: null }));
    fetchTrendingSongs()
      .then((videos) => setTrending({ videos, loading: false, error: null }))
      .catch((err) =>
        setTrending({ videos: [], loading: false, error: String(err) }),
      );
  }, []);

  const loadBollywood = useCallback(() => {
    setBollywood((s) => ({ ...s, loading: true, error: null }));
    fetchBollywoodSongs()
      .then((videos) => setBollywood({ videos, loading: false, error: null }))
      .catch((err) =>
        setBollywood({ videos: [], loading: false, error: String(err) }),
      );
  }, []);

  const loadLofi = useCallback(() => {
    setLofi((s) => ({ ...s, loading: true, error: null }));
    fetchLofiBeats()
      .then((videos) => setLofi({ videos, loading: false, error: null }))
      .catch((err) =>
        setLofi({ videos: [], loading: false, error: String(err) }),
      );
  }, []);

  const loadPunjabi = useCallback(() => {
    setPunjabi((s) => ({ ...s, loading: true, error: null }));
    fetchPunjabiSongs()
      .then((videos) => setPunjabi({ videos, loading: false, error: null }))
      .catch((err) =>
        setPunjabi({ videos: [], loading: false, error: String(err) }),
      );
  }, []);

  useEffect(() => {
    loadTrending();
    loadBollywood();
    loadLofi();
    loadPunjabi();
  }, [loadTrending, loadBollywood, loadLofi, loadPunjabi]);

  return (
    <div
      data-ocid="music.page"
      className="min-h-screen"
      style={{ background: "#0a0a0a" }}
    >
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero header */}
        <div className="px-4 sm:px-8 mb-12">
          <div className="flex items-end gap-4 mb-3">
            <h1
              className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #1DB954 60%, #17a349 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Music
            </h1>
            <div
              className="mb-2 hidden sm:block w-8 h-8 rounded-full flex-shrink-0"
              style={{ background: "#1DB954", boxShadow: "0 0 20px #1DB95466" }}
            />
          </div>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl">
            Your favorite tracks, powered by YouTube
          </p>
          <div
            className="mt-5 h-0.5 w-24 rounded-full"
            style={{
              background: "linear-gradient(90deg, #1DB954, transparent)",
            }}
          />
        </div>

        <section className="mb-10">
          <SectionHeader title="Trending Songs" label="🔥 HOT" />
          <MusicRow
            state={trending}
            onPlay={setActiveVideo}
            onRetry={loadTrending}
            sectionOcid="music.trending_songs.section"
          />
        </section>

        <section className="mb-10">
          <SectionHeader title="Bollywood Hits" label="🎬 FILMS" />
          <MusicRow
            state={bollywood}
            onPlay={setActiveVideo}
            onRetry={loadBollywood}
            sectionOcid="music.bollywood_hits.section"
          />
        </section>

        <section className="mb-10">
          <SectionHeader title="LoFi Beats" label="🎧 CHILL" />
          <MusicRow
            state={lofi}
            onPlay={setActiveVideo}
            onRetry={loadLofi}
            sectionOcid="music.lofi_beats.section"
          />
        </section>

        <section className="mb-10">
          <SectionHeader title="Punjabi Songs" label="🎤 BHANGRA" />
          <MusicRow
            state={punjabi}
            onPlay={setActiveVideo}
            onRetry={loadPunjabi}
            sectionOcid="music.punjabi_songs.section"
          />
        </section>
      </main>

      <footer className="text-center py-8 text-zinc-600 text-xs border-t border-white/5">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      {activeVideo && (
        <YouTubeMusicPlayer
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
