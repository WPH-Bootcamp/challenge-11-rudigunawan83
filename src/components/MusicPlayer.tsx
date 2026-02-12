// "use client";

// // TODO: Import dependencies yang diperlukan
// // import { motion } from "motion/react";
// // import { ... } from "lucide-react";

// export function MusicPlayer() {
//   // TODO: Implementasikan state management untuk playing, paused, loading
  
//   // TODO: Implementasikan handler untuk play/pause
  
//   // TODO: Implementasikan komponen music player sesuai desain Figma
//   // Struktur yang perlu dibuat:
//   // - Container dengan background dan shadow animations
//   // - Album artwork dengan rotation dan scale animations
//   // - Equalizer bars dengan stagger effect
//   // - Progress bar dengan fill animation
//   // - Control buttons (play/pause, skip, volume)
  
//   return (
//     <div className="w-full max-w-md">
//       {/* TODO: Implementasikan music player di sini */}
//       <p className="text-center text-gray-500">
//         Mulai implementasi music player di sini oke
//       </p>
//     </div>
//   );
// }

"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Play,
  Pause,
  Volume2,
  Music,
} from "lucide-react";

type PlayerState = "playing" | "paused" | "loading";

const EQUALIZER_BAR_COUNT = 5;
const LOADING_DURATION_MS = 500;

const containerVariants = {
  playing: {
    boxShadow: "0 0 40px rgba(168, 85, 247, 0.4)",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  paused: {
    boxShadow: "0 0 0 transparent",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  loading: {
    boxShadow: "0 0 0 transparent",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const albumScaleVariants = {
  playing: { scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  paused: { scale: 0.95, transition: { type: "spring", stiffness: 300, damping: 24 } },
  loading: { scale: 0.9, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function MusicPlayer() {
  const [playerState, setPlayerState] = useState<PlayerState>("paused");
  const [progress, setProgress] = useState(35); // 1:23 / 3:45 ≈ 35%
  const [volume, setVolume] = useState(70);
  const [isVolumeHovered, setVolumeHovered] = useState(false);

  const togglePlayPause = useCallback(() => {
    if (playerState === "loading") return;
    setPlayerState("loading");
    setTimeout(() => {
      setPlayerState((prev) => (prev === "paused" ? "playing" : "paused"));
    }, LOADING_DURATION_MS);
  }, [playerState]);

  // Simulasi progress saat playing
  useEffect(() => {
    if (playerState !== "playing") return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.5));
    }, 1000);
    return () => clearInterval(interval);
  }, [playerState]);

  const isPlayDisabled = playerState === "loading";

  return (
    <motion.div
      className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-gray-900)] p-6"
      variants={containerVariants}
      initial="paused"
      animate={playerState}
    >
      <div className="flex gap-4">
        {/* Album Artwork */}
        <motion.div
          className="relative flex flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"
          initial="paused"
          animate={{
            scale: albumScaleVariants[playerState].scale,
            rotate: playerState === "playing" ? 360 : 0,
          }}
          transition={{
            scale: albumScaleVariants[playerState].transition as object,
            rotate:
              playerState === "playing"
                ? { duration: 20, repeat: Infinity, ease: "linear" }
                : { duration: 0.3 },
          }}
          style={{ width: 80, height: 80 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-gray-900">
            <Music size={36} strokeWidth={2} />
          </div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-white">
            Awesome Song Title
          </h2>
          <p className="truncate text-sm text-gray-400">Amazing Artist</p>

          {/* Equalizer Bars */}
          <div className="mt-2 flex items-end gap-0.5" style={{ height: 12 }}>
            {Array.from({ length: EQUALIZER_BAR_COUNT }).map((_, i) => (
              <EqualizerBar
                key={i}
                index={i}
                state={playerState}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <motion.div
          className="h-1 w-full overflow-hidden rounded-full bg-gray-700"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor:
                playerState === "playing"
                  ? "var(--color-purple-500)"
                  : "var(--color-gray-500)",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>1:23</span>
          <span>3:45</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <ControlButton icon={<Shuffle size={18} />} label="Shuffle" />
        <ControlButton icon={<SkipBack size={18} />} label="Previous" />
        <motion.button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:pointer-events-none"
          style={{
            backgroundColor: isPlayDisabled
              ? "var(--color-gray-600)"
              : "var(--color-purple-500)",
          }}
          onClick={togglePlayPause}
          disabled={isPlayDisabled}
          whileHover={!isPlayDisabled ? { scale: 1.05 } : undefined}
          whileTap={!isPlayDisabled ? { scale: 0.95 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          aria-label={playerState === "playing" ? "Pause" : "Play"}
        >
          {playerState === "playing" ? (
            <Pause size={22} fill="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" className="translate-x-0.5" />
          )}
        </motion.button>
        <ControlButton icon={<SkipForward size={18} />} label="Next" />
        <ControlButton icon={<Repeat size={18} />} label="Repeat" />
      </div>

      {/* Volume */}
      <div
        className="mt-4 flex items-center gap-2"
        onMouseEnter={() => setVolumeHovered(true)}
        onMouseLeave={() => setVolumeHovered(false)}
      >
        <Volume2 size={18} className="flex-shrink-0 text-white" aria-hidden />
        <div
          className="relative h-1 flex-1 cursor-pointer rounded-full bg-gray-700"
          role="slider"
          aria-valuenow={volume}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Volume"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.round(
              ((e.clientX - rect.left) / rect.width) * 100
            );
            setVolume(Math.min(100, Math.max(0, pct)));
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${volume}%`,
              backgroundColor: isVolumeHovered
                ? "var(--color-purple-500)"
                : "var(--color-gray-500)",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function ControlButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
}

function EqualizerBar({ index, state }: { index: number; state: PlayerState }) {
  const staggerDelay = index * 0.1; // 100ms stagger

  if (state === "loading") {
    return (
      <motion.div
        className="w-1 rounded-sm bg-purple-500 origin-bottom"
        initial={false}
        animate={{
          scaleY: 0.5,
          opacity: 0.5,
        }}
        transition={{ duration: 0.3 }}
        style={{ height: 12 }}
      />
    );
  }

  if (state === "paused") {
    return (
      <motion.div
        className="w-1 rounded-sm bg-purple-500/80 origin-bottom"
        initial={false}
        animate={{
          scaleY: 0.2,
          opacity: 1,
        }}
        transition={{ duration: 0.3 }}
        style={{ height: 12 }}
      />
    );
  }

  // playing: scaleY 0.2 ↔ 1 dengan stagger & alternate
  return (
    <motion.div
      className="w-1 rounded-sm bg-purple-500 origin-bottom"
      initial={false}
      animate={{
        scaleY: [0.2, 1, 0.2],
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: staggerDelay,
        times: [0, 0.5, 1],
      }}
      style={{ height: 12 }}
    />
  );
}
