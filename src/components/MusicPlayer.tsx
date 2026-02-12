"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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


const ROTATION_DURATION_S = 20; 
const CONTAINER_TRANSITION_MS = 300;
const SCALE_TRANSITION_SPRING = { type: "spring", stiffness: 320, damping: 28 };
const EQUALIZER_BAR_COUNT = 5;
const EQUALIZER_CYCLE_S = 0.5;
const EQUALIZER_STAGGER_S = 0.1;
const LOADING_SIM_MS = 500;
const PROGRESS_TRANSITION_S = 0.3;
const VOLUME_HOVER_TRANSITION_S = 0.2;
const PROGRESS_TRACK_HEIGHT_PX = 8;
const EQUALIZER_PLAY_HEIGHT_PX = 14;
const EQUALIZER_PAUSE_HEIGHT_PX = 12;
const EQUALIZER_LOADING_HEIGHT_PX = 20;
const EQUALIZER_BAR_WIDTH_PX = 8;


const COLOR_PURPLE = "#a855f7"; 
const COLOR_GRAY_500 = "#6b7280";
const COLOR_GRAY_600 = "#4b5563";
const COLOR_BG_PAUSED = "#0f172a";
const COLOR_BG_PLAYING = "rgba(68,20,98,0.95)"; 

export enum PlayerState {
  Playing = "playing",
  Paused = "paused",
  Loading = "loading",
}

function Artwork({ state }: { state: PlayerState }) {
  const variants = {
    playing: {
      rotate: [0, 360],
      transition: {
        rotate: { duration: ROTATION_DURATION_S, repeat: Infinity, ease: "linear" },
      },
    },
    paused: { rotate: 0 },
    loading: { rotate: 0 },
  };

  const scale = state === PlayerState.Playing ? 1 : state === PlayerState.Paused ? 0.95 : 0.9;

  return (
    <motion.div
      className="relative flex flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"
      initial={false}
      animate={state === PlayerState.Playing ? "playing" : state === PlayerState.Loading ? "loading" : "paused"}
      variants={variants}
      style={{ width: 80, height: 80 }}
    
      transition={{ ...SCALE_TRANSITION_SPRING }}
    
    >
      <motion.div
        initial={false}
        animate={{ scale }}
        transition={{ ...SCALE_TRANSITION_SPRING, duration: CONTAINER_TRANSITION_MS / 1000 }}
        className="absolute inset-0 flex items-center justify-center text-gray-900"
      >
        <Music size={36} strokeWidth={2} />
      </motion.div>
    </motion.div>
  );
}

/* EqualizerBar component */
function EqualizerBar({ index, state }: { index: number; state: PlayerState }) {
  const staggerDelay = index * EQUALIZER_STAGGER_S;

  if (state === PlayerState.Loading) {
    return (
      <motion.div
        className="rounded-sm bg-purple-500 origin-bottom"
        initial={false}
        animate={{ scaleY: [0.5, 1, 0.7], opacity: [0.6, 1, 0.8] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: staggerDelay }}
        style={{ width: EQUALIZER_BAR_WIDTH_PX, height: EQUALIZER_LOADING_HEIGHT_PX }}
      />
    );
  }

  if (state === PlayerState.Paused) {
    return (
      <motion.div
        className="rounded-sm bg-purple-500/80 origin-bottom"
        initial={false}
        animate={{ scaleY: 0.2, opacity: 1 }}
        transition={{ duration: CONTAINER_TRANSITION_MS / 1000 }}
        style={{ width: EQUALIZER_BAR_WIDTH_PX, height: EQUALIZER_PAUSE_HEIGHT_PX }}
      />
    );
  }

  // playing
  return (
    <motion.div
      className="rounded-sm bg-purple-500 origin-bottom"
      initial={false}
      animate={{ scaleY: [0.2, 1] }}
      transition={{
        duration: EQUALIZER_CYCLE_S,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: staggerDelay,
      }}
      style={{ width: EQUALIZER_BAR_WIDTH_PX, height: EQUALIZER_PLAY_HEIGHT_PX }}
    />
  );
}

function Equalizer({ state }: { state: PlayerState }) {
  const containerHeight = state === PlayerState.Loading ? EQUALIZER_LOADING_HEIGHT_PX : EQUALIZER_PLAY_HEIGHT_PX;
  const gap = state === PlayerState.Loading ? 6 : 2; // px
  return (
    <div className="mt-2 flex items-end" style={{ height: containerHeight, gap }}>
      {Array.from({ length: EQUALIZER_BAR_COUNT }).map((_, i) => (
        <EqualizerBar key={i} index={i} state={state} />
      ))}
    </div>
  );
}


function ProgressBar({ progress, state }: { progress: number; state: PlayerState }) {
  const fillColor = state === PlayerState.Playing ? COLOR_PURPLE : COLOR_GRAY_500;
  return (
    <div className="mt-4">
      <motion.div
        className="w-full overflow-hidden rounded-full bg-gray-700"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: PROGRESS_TRACK_HEIGHT_PX }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: fillColor }}
          transition={{ duration: PROGRESS_TRANSITION_S }}
        />
      </motion.div>

      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>1:23</span>
        <span>3:45</span>
      </div>
    </div>
  );
}


function Spinner() {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" />
        <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    </motion.div>
  );
}

type ControlButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};
function ControlButton({ icon, label, onClick, disabled }: ControlButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      whileTap={{ scale: 0.95 }}
      style={{ opacity: disabled ? 0.45 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {icon}
    </motion.button>
  );
}


function VolumeSlider({ volume, setVolume }: { volume: number; setVolume: (v: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      setVolume(Math.min(100, Math.max(0, pct)));
    },
    [setVolume]
  );

  return (
    <div className="mt-4 flex items-center gap-2" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Volume2 size={18} className="flex-shrink-0 text-white" aria-hidden />
      <div
        className="relative h-1 flex-1 cursor-pointer rounded-full bg-gray-700"
        role="slider"
        aria-valuenow={volume}
        aria-valuemin={0}
        aria-valuemax={100}
        onClick={handleClick}
        style={{ height: 8 }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${volume}%`, backgroundColor: hovered ? COLOR_PURPLE : COLOR_GRAY_500 }}
          transition={{ duration: VOLUME_HOVER_TRANSITION_S }}
        />
      </div>
    </div>
  );
}

export function MusicPlayer(): React.ReactElement {
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.Paused);
  const [progress, setProgress] = useState<number>(35);
  const [volume, setVolume] = useState<number>(70);

  /* container variants */
  const containerVariants = useMemo(
    () => ({
      playing: {
        backgroundColor: COLOR_BG_PLAYING,
        boxShadow: "0 0 40px rgba(168,85,247,0.45)",
        transition: { duration: CONTAINER_TRANSITION_MS / 1000, ease: "easeInOut" },
      },
      paused: {
        backgroundColor: COLOR_BG_PAUSED,
        boxShadow: "0 0 0 transparent",
        transition: { duration: CONTAINER_TRANSITION_MS / 1000, ease: "easeInOut" },
      },
      loading: {
        backgroundColor: "rgba(24,24,27,1)",
        boxShadow: "0 0 8px rgba(0,0,0,0.2)",
        transition: { duration: CONTAINER_TRANSITION_MS / 1000, ease: "easeInOut" },
      },
    }),
    []
  );

  const togglePlayPause = useCallback(() => {
    if (playerState === PlayerState.Loading) return;
    const target = playerState === PlayerState.Paused ? PlayerState.Playing : PlayerState.Paused;
    setPlayerState(PlayerState.Loading);
    setTimeout(() => {
      setPlayerState(target);
    }, LOADING_SIM_MS);
  }, [playerState]);

  useEffect(() => {
    if (playerState !== PlayerState.Playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : +((p + 0.5).toFixed(2))));
    }, 1000);
    return () => clearInterval(id);
  }, [playerState]);

  const isPlayDisabled = playerState === PlayerState.Loading;

  return (
    <motion.div
      className="w-full max-w-md overflow-hidden rounded-2xl p-16"
      variants={containerVariants}
      initial="paused"
      animate={playerState}
      style={{ backgroundColor: undefined as unknown as string }} // allow motion to animate background via variants
    >
      <div className="flex gap-8">
        <Artwork state={playerState} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-white">Awesome Song Title</h2>
          <p className="truncate text-sm text-gray-400">Amazing Artist</p>

          <div className="mt-8">
            <Equalizer state={playerState} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar progress={progress} state={playerState} />
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <ControlButton icon={<Shuffle size={18} />} label="Shuffle" disabled={isPlayDisabled} />
        <ControlButton icon={<SkipBack size={18} />} label="Previous" disabled={isPlayDisabled} />

        <motion.button
          type="button"
          aria-label={playerState === PlayerState.Playing ? "Pause" : "Play"}
          className="flex h-12 w-12 items-center justify-center rounded-full text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:pointer-events-none"
          onClick={togglePlayPause}
          disabled={isPlayDisabled}
          whileHover={!isPlayDisabled ? { scale: 1.05 } : undefined}
          whileTap={!isPlayDisabled ? { scale: 0.95 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          style={{ backgroundColor: isPlayDisabled ? COLOR_GRAY_600 : COLOR_PURPLE }}
        >
          {playerState === PlayerState.Playing ? <Pause size={22} fill="currentColor" /> : playerState === PlayerState.Loading ? <Spinner /> : <Play size={22} fill="currentColor" />}
        </motion.button>

        <ControlButton icon={<SkipForward size={18} />} label="Next" disabled={isPlayDisabled} />
        <ControlButton icon={<Repeat size={18} />} label="Repeat" disabled={isPlayDisabled} />
      </div>

      <div className="mt-8">
        <VolumeSlider volume={volume} setVolume={setVolume} />
      </div>
    </motion.div>
  );
}
 
