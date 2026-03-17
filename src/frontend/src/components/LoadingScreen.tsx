import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black loading-screen-fadeout"
      aria-label="Loading CineStream"
    >
      <div className="flex items-baseline gap-0 mb-10 select-none">
        <span
          className="font-display font-black text-5xl sm:text-6xl tracking-tight"
          style={{ color: "#e50914" }}
        >
          CINE
        </span>
        <span className="font-display font-black text-5xl sm:text-6xl tracking-tight text-white">
          STREAM
        </span>
      </div>
      {/* Red ring spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow"
          style={{
            borderTopColor: "#e50914",
            borderRightColor: "rgba(229,9,20,0.3)",
          }}
        />
      </div>
    </div>
  );
}
