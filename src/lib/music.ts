import "server-only";
import { cache } from "react";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * The background songs, chosen in /admin/music and kept in site_settings
 * under "music". The player switches between them as the guest scrolls:
 * the master song everywhere, the events song over the Events section, and on
 * phones each event's own song while its card is in the middle of the screen.
 * Anything not set falls back to the next one out, and finally to the song
 * that ships with the site.
 */
export type Song = { url: string; public_id: string; name: string };

export type MusicSettings = {
  master: Song | null;
  events_section: Song | null;
  /** By event id. */
  events: Record<string, Song>;
};

export const BUILT_IN_SONG = "/audio/background-music.mp3";

const EMPTY: MusicSettings = { master: null, events_section: null, events: {} };

export const getMusic = cache(async (): Promise<MusicSettings> => {
  const { data } = await createAdminSupabase().from("site_settings").select("value").eq("key", "music").maybeSingle();
  const value = (data?.value ?? {}) as Partial<MusicSettings>;
  return { ...EMPTY, ...value, events: value.events ?? {} };
});
