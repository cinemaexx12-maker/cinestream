import { useEffect, useRef, useState } from "react";

interface CinematicIntroProps {
  onComplete: () => void;
}

function playCinematicSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  const makeOscLayer = (
    type: OscillatorType,
    freq: number,
    freqEnd: number | null,
    gainPeak: number,
    attackTime: number,
    sustainEnd: number,
    releaseEnd: number,
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== null) {
      osc.frequency.linearRampToValueAtTime(freqEnd, now + sustainEnd);
    }
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + attackTime);
    gain.gain.setValueAtTime(gainPeak, now + sustainEnd);
    gain.gain.linearRampToValueAtTime(0, now + releaseEnd);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + releaseEnd + 0.05);
  };

  // Deep bass rumble
  makeOscLayer("sine", 50, null, 0.5, 0.05, 0.6, 1.8);
  // Sub-bass thud
  makeOscLayer("sine", 90, 60, 0.6, 0.01, 0.3, 0.8);
  // Mid cinematic swell
  makeOscLayer("sine", 180, 400, 0.2, 0.2, 1.4, 2.0);
  // High shimmer
  makeOscLayer("sine", 800, 1200, 0.06, 0.4, 1.6, 2.0);
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [visible, setVisible] = useState(true);
  const [logoVisible, setLogoVisible] = useState(false);
  const hasPlayed = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    // Show logo after short delay
    const logoTimer = setTimeout(() => setLogoVisible(true), 50);

    // Create AudioContext
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContextClass();
      ctxRef.current = ctx;

      const tryPlay = () => {
        if (soundPlayedRef.current) return;
        ctx.resume().then(() => {
          if (soundPlayedRef.current) return;
          if (ctx.state === "running") {
            soundPlayedRef.current = true;
            playCinematicSound(ctx);
          }
        });
      };

      // Try immediately (works when browser allows autoplay)
      tryPlay();

      // If still suspended, unlock on first user gesture
      const unlock = () => {
        tryPlay();
        document.removeEventListener("click", unlock);
        document.removeEventListener("touchstart", unlock);
        document.removeEventListener("keydown", unlock);
      };
      document.addEventListener("click", unlock);
      document.addEventListener("touchstart", unlock);
      document.addEventListener("keydown", unlock);
    } catch (_e) {
      // AudioContext not available — skip sound silently
    }

    // Fade out intro after 2200ms
    const fadeTimer = setTimeout(() => setVisible(false), 2200);
    // Complete transition after fade (500ms)
    const completeTimer = setTimeout(() => {
      ctxRef.current?.close();
      onComplete();
    }, 2700);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-out",
        pointerEvents: visible ? "all" : "none",
        cursor: "default",
      }}
      data-ocid="intro.panel"
    >
      {/* CineStream Logo */}
      <div
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.6s ease-in, transform 0.6s ease-out",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display, 'Bebas Neue', sans-serif)",
            fontWeight: 900,
            fontSize: "clamp(3rem, 8vw, 6rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          <span style={{ color: "#e50914" }}>CINE</span>
          <span style={{ color: "#fff" }}>STREAM</span>
        </span>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.15)",
          borderTopColor: "#e50914",
          animation: "cineIntroSpin 0.9s linear infinite",
          opacity: logoVisible ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
        }}
        data-ocid="intro.loading_state"
      />

      <style>{`
        @keyframes cineIntroSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
