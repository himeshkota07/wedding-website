"use client";

import { useRef, useState } from "react";

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
        className="fixed bottom-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg shadow-md hover:border-accent"
      >
        {playing ? "🔊" : "🔇"}
      </button>
    </>
  );
}
