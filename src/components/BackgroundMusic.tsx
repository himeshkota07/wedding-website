"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const FADE_MS = 700;
// How long the guest has to stay on a part of the page before its song
// takes over, so flicking past an event doesn't start and stop its song.
const SETTLE_MS = 400;
const VOLUME = 1;
// Phones show the event cards one under another (the grid's single column),
// so each card can have its own song there.
const PHONE_QUERY = "(max-width: 639px)";

/**
 * The song the page calls for right now, judged at the middle of the screen.
 * A section marked data-music-section (the Events section) plays its
 * data-song while it crosses the middle; everywhere else it's the master song.
 * On phones, inside that section, the last event card to reach the middle
 * plays its data-event-song, and keeps playing until the next card gets
 * there. An event without a song (or the gap above the first card) plays the
 * section's song.
 */
function songAtMiddle(master: string) {
  const middle = window.innerHeight / 2;
  const phone = window.matchMedia(PHONE_QUERY).matches;
  for (const section of document.querySelectorAll<HTMLElement>("[data-music-section]")) {
    const box = section.getBoundingClientRect();
    if (box.top > middle || box.bottom < middle) continue;
    const sectionSong = section.dataset.song || master;
    if (!phone) return sectionSong;
    let song = sectionSong;
    for (const card of section.querySelectorAll<HTMLElement>("[data-event-song]")) {
      if (card.getBoundingClientRect().top <= middle) song = card.dataset.eventSong || sectionSong;
    }
    return song;
  }
  return master;
}

/**
 * The music button, and the one <audio> element every song plays through.
 * One element, not one per song: iOS only lets a page play audio from an
 * element the guest has tapped to start, so songs are swapped into it. Each
 * song picks up where it left off when the guest scrolls back to it. (iOS
 * ignores volume changes, so there the songs switch without fading.)
 */
export default function BackgroundMusic({ masterSrc }: { masterSrc: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const current = useRef(masterSrc);
  const positions = useRef(new Map<string, number>());
  const switchId = useRef(0);

  const fade = useCallback((audio: HTMLAudioElement, to: number, id: number) => {
    return new Promise<void>((resolve) => {
      const from = audio.volume;
      const start = performance.now();
      const step = (now: number) => {
        if (id !== switchId.current) return resolve();
        // A frame's timestamp can be slightly before `start`, so clamp both.
        const k = Math.min(1, Math.max(0, (now - start) / FADE_MS));
        audio.volume = Math.min(1, Math.max(0, from + (to - from) * k));
        if (k < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }, []);

  /** Loads `src` into the player at its saved position. */
  const load = useCallback((audio: HTMLAudioElement, src: string) => {
    if (audio.getAttribute("src")) positions.current.set(current.current, audio.currentTime);
    current.current = src;
    audio.src = src;
    const resumeAt = positions.current.get(src);
    if (resumeAt) {
      audio.addEventListener(
        "loadedmetadata",
        () => {
          audio.currentTime = resumeAt % (audio.duration || Infinity);
        },
        { once: true },
      );
    }
  }, []);

  const switchTo = useCallback(
    async (src: string) => {
      const audio = audioRef.current;
      if (!audio || src === current.current) return;
      const id = ++switchId.current;
      if (!playingRef.current) {
        load(audio, src); // ready for when the guest turns the music on
        return;
      }
      await fade(audio, 0, id);
      if (id !== switchId.current) return;
      load(audio, src);
      audio.volume = 0;
      await audio.play().catch(() => {});
      await fade(audio, VOLUME, id);
    },
    [fade, load],
  );

  // Follow the scroll: work out the song at the middle of the screen, and
  // switch once the guest has settled there.
  useEffect(() => {
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const wanted = songAtMiddle(masterSrc);
        clearTimeout(timer);
        if (wanted !== current.current) timer = setTimeout(() => switchTo(songAtMiddle(masterSrc)), SETTLE_MS);
      });
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [masterSrc, switchTo]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      switchId.current++; // stop any fade in progress
      audio.pause();
    } else {
      const wanted = songAtMiddle(masterSrc);
      if (wanted !== current.current || !audio.getAttribute("src")) load(audio, wanted);
      audio.volume = VOLUME;
      audio.play().catch(() => {
        // Autoplay/interaction restrictions -- ignore, button just stays "paused".
      });
    }
    playingRef.current = !playing;
    setPlaying(!playing);
  }

  return (
    <>
      <audio ref={audioRef} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        className="fixed bottom-4 left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-paper ring-2 ring-paper outline outline-1 outline-offset-2 outline-brass transition-colors hover:bg-kumkum sm:bottom-5 sm:left-5"
      >
        {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </>
  );
}
