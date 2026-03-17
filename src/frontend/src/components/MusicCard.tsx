import { Play } from "lucide-react";
import type { YouTubeVideo } from "../services/youtubeMusic";

interface MusicCardProps {
  video: YouTubeVideo;
  index?: number;
  onPlay: (video: YouTubeVideo) => void;
}

export default function MusicCard({
  video,
  index = 0,
  onPlay,
}: MusicCardProps) {
  return (
    <button
      type="button"
      data-ocid={`music.item.${index + 1}`}
      className="flex-shrink-0 w-44 sm:w-48 group cursor-pointer text-left bg-transparent border-0 p-0"
      style={{ willChange: "transform" }}
      onClick={() => onPlay(video)}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl bg-zinc-800">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
            style={{ backgroundColor: "#1DB954" }}
          >
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </span>
        </div>

        {/* Glowing ring on hover */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300" />
      </div>

      {/* Song info */}
      <div className="px-0.5">
        <p
          className="text-sm font-semibold text-white truncate leading-tight"
          title={video.title}
        >
          {video.title}
        </p>
        <p
          className="text-xs text-zinc-400 mt-0.5 truncate"
          title={video.channelTitle}
        >
          {video.channelTitle}
        </p>
      </div>
    </button>
  );
}
