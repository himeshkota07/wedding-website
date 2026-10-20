"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { CHAT_AUDIO_EVENT, signalMusicState } from "@/lib/audio-events";

const FADE_MS = 700;
// How long the guest has to stay on a part of the page before its song
// takes over, so flicking past an event doesn't start and stop its song.
const SETTLE_MS = 400;
const VOLUME = 1;
// Phones show the event cards one under another (the grid's single column),
// so each card can have its own song there.
const PHONE_QUERY = "(max-width: 639px)";

// Remembered in this browser when the guest turns the music off.
const OFF_KEY = "wedding-music-off";

function turnedOffBefore() {
  try {
    return localStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberTurnedOff(off: boolean) {
  try {
    if (off) localStorage.setItem(OFF_KEY, "1");
    else localStorage.removeItem(OFF_KEY);
  } catch {
    // Private browsing and the like: nothing to remember it in.
  }
}

/**
 * The song the page calls for right now, judged at the middle of the screen.
 * Above the Events section (the one marked data-music-section) it's the
 * opening song. Inside it, the section's data-song plays (the opening song if
 * that isn't set); on phones the last event card to reach the middle plays its
 * data-event-song instead, until the next card gets there. Below the section,
 * the last event's song carries on to the end of the page. A page without
 * events plays the master song.
 */
function songAtMiddle(master: string, opening: string) {
  const section = document.querySelector<HTMLElement>("[data-music-section]");
  if (!section) return master;
  const middle = window.innerHeight / 2;
  const box = section.getBoundingClientRect();
  if (box.top > middle) return opening;
  const sectionSong = section.dataset.song || opening;
  const below = box.bottom < middle;
  if (!below && !window.matchMedia(PHONE_QUERY).matches) return sectionSong;
  let song = sectionSong;
  for (const card of section.querySelectorAll<HTMLElement>("[data-event-song]")) {
    if (card.getBoundingClientRect().top <= middle) song = card.dataset.eventSong || sectionSong;
  }
  return song;
}

/**
 * The music button, and the one <audio> element every song plays through.
 * One element, not one per song: iOS only lets a page play audio from an
 * element the guest has tapped to start, so songs are swapped into it. Each
 * song picks up where it left off when the guest scrolls back to it. (iOS
 * ignores volume changes, so there the songs switch without fading.)
 */
export default function BackgroundMusic({ masterSrc, openingSrc }: { masterSrc: string; openingSrc: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const current = useRef(openingSrc);
  const positions = useRef(new Map<string, number>());
  const switchId = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** Set once the guest has used the music button themselves. */
  const chosen = useRef(false);
  /** True while the chat is reading aloud or listening: the music waits. */
  const held = useRef(false);

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
      if (!playingRef.current || held.current) {
        load(audio, src); // ready for when the music (re)starts
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
        const wanted = songAtMiddle(masterSrc, openingSrc);
        clearTimeout(timer);
        if (wanted !== current.current) timer = setTimeout(() => switchTo(songAtMiddle(masterSrc, openingSrc)), SETTLE_MS);
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
  }, [masterSrc, openingSrc, switchTo]);

  /** Plays the song for where the guest is. False when the browser won't allow sound yet. */
  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    const wanted = songAtMiddle(masterSrc, openingSrc);
    if (wanted !== current.current || !audio.getAttribute("src")) load(audio, wanted);
    switchId.current++; // stop any fade in progress
    audio.volume = VOLUME;
    try {
      await audio.play();
    } catch {
      return false;
    }
    // Started (which unlocks the player on iPhones), but the chat is talking: wait for it.
    if (held.current) audio.pause();
    playingRef.current = true;
    return true;
  }, [masterSrc, openingSrc, load]);

  // Pause while the chat reads an answer aloud or records a question, and
  // carry on (with the song for wherever the guest now is) once it's done.
  useEffect(() => {
    function onChatAudio(e: Event) {
      const audio = audioRef.current;
      held.current = (e as CustomEvent<boolean>).detail;
      if (!audio || !playingRef.current) return;
      switchId.current++; // stop any fade in progress
      if (held.current) {
        audio.pause();
      } else {
        const wanted = songAtMiddle(masterSrc, openingSrc);
        if (wanted !== current.current) load(audio, wanted);
        audio.volume = VOLUME;
        audio.play().catch(() => {});
      }
    }
    window.addEventListener(CHAT_AUDIO_EVENT, onChatAudio);
    return () => window.removeEventListener(CHAT_AUDIO_EVENT, onChatAudio);
  }, [masterSrc, openingSrc, load]);

  // Music is on by default, from the moment the link opens: the opening song
  // plays under the opening animation. Browsers (iPhones above all) only allow
  // sound once the guest has interacted with the page, so when the first try
  // is refused the opening waits for a tap (see IntroSequence), and any tap,
  // click or key press anywhere starts it. A guest who turns the music off is
  // remembered and left in peace.
  useEffect(() => {
    if (turnedOffBefore()) {
      signalMusicState("off");
      return;
    }
    let done = false;
    const triggers = ["pointerdown", "pointerup", "touchend", "keydown", "click"];
    const stopListening = () => triggers.forEach((t) => document.removeEventListener(t, onInteract, true));
    function started() {
      done = true;
      setPlaying(true);
      stopListening();
      signalMusicState("playing");
    }
    function onInteract(e: Event) {
      // The music button handles its own taps; and once the guest has used it, it's their choice.
      if (done || chosen.current || buttonRef.current?.contains(e.target as Node)) return;
      start().then((ok) => ok && !done && started());
    }
    triggers.forEach((t) => document.addEventListener(t, onInteract, true));
    start().then((ok) => {
      if (done) return;
      if (ok) started();
      else signalMusicState("blocked");
    });
    return () => {
      done = true;
      stopListening();
    };
  }, [start]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    chosen.current = true;
    if (playing) {
      switchId.current++; // stop any fade in progress
      audio.pause();
      playingRef.current = false;
      setPlaying(false);
      rememberTurnedOff(true);
    } else {
      rememberTurnedOff(false);
      start().then((ok) => ok && setPlaying(true));
    }
  }

  return (
    <>
      <audio ref={audioRef} loop preload="none" />
      <button
        ref={buttonRef}
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
