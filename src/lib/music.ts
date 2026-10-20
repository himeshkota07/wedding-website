import "server-only";
import { cache } from "react";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * The background songs, chosen in /admin/music and kept in site_settings
 * under "music". The player switches between them as the guest scrolls: the
 * opening song from the moment the link opens down to the Events section, the
 * events song over that section, and on phones each event's own song while
 * its card is in the middle of the screen. Past the last event, its song
 * carries on to the end of the page. Anything not set falls back to the
 * master song, and finally to the song that ships with the site.
 *
 * In "single" mode none of that happens: the master song plays across the
 * whole site, and the other songs stay saved for switching back.
 */
export type Song = { url: string; public_id: string; name: string };

export type MusicMode = "sections" | "single";

export type MusicSettings = {
  mode: MusicMode;
  master: Song | null;
  opening: Song | null;
  events_section: Song | null;
  /** By event id. */
  events: Record<string, Song>;
};

export const BUILT_IN_SONG = "/audio/background-music.mp3";

const EMPTY: MusicSettings = { mode: "sections", master: null, opening: null, events_section: null, events: {} };

export const getMusic = cache(async (): Promise<MusicSettings> => {
  const { data } = await createAdminSupabase().from("site_settings").select("value").eq("key", "music").maybeSingle();
  const value = (data?.value ?? {}) as Partial<MusicSettings>;
  return { ...EMPTY, ...value, events: value.events ?? {} };
});
