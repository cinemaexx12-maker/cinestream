import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

interface PaywallProps {
  movieTitle?: string;
  posterUrl?: string;
  isLoggedIn?: boolean;
}

export default function Paywall({
  movieTitle,
  posterUrl,
  isLoggedIn = false,
}: PaywallProps) {
  return (
    <div
      data-ocid="paywall.section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Blurred poster background */}
      {posterUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${posterUrl})`,
            filter: "blur(24px) brightness(0.3)",
            transform: "scale(1.1)",
          }}
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-10 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-yellow-400 uppercase mb-2">
            Premium Content
          </p>
          {movieTitle && (
            <h2 className="text-2xl font-display font-black text-white mb-2">
              {movieTitle}
            </h2>
          )}
          <p className="text-base text-gray-300">
            {isLoggedIn
              ? "Subscribe to watch this movie"
              : "Sign in & subscribe to watch this movie"}
          </p>
        </div>

        <Link to="/subscription">
          <Button
            data-ocid="paywall.upgrade_button"
            className="bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-500 hover:to-orange-700 text-black font-black text-base px-8 py-5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
          >
            {isLoggedIn ? "Upgrade Plan" : "Sign In & Subscribe"}
          </Button>
        </Link>

        <p className="text-xs text-gray-500">
          Cancel anytime · Unlimited movies · 4K streaming
        </p>
      </div>
    </div>
  );
}
