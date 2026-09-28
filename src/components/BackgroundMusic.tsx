"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Autoplay/interaction restrictions -- ignore, button just stays "paused".
      });
    }
    setPlaying(!playing);
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/background-music.mp3" loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        className="fixed bottom-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-hairline/60 bg-white text-accent-deep shadow-md transition-colors hover:border-accent"
      >
        {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </>
  );
}
