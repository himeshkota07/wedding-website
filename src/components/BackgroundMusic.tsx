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
        className="fixed bottom-4 left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-teak text-turmeric ring-2 ring-paper outline outline-1 outline-offset-2 outline-brass transition-colors hover:text-paper sm:bottom-5 sm:left-5"
      >
        {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </>
  );
}
