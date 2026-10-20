"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { destroyCloudinaryAudio, isOwnCloudinaryUpload, MUSIC_FOLDER, signMusicUpload } from "@/lib/cloudinary";
import { getMusic, type MusicMode, type MusicSettings, type Song } from "@/lib/music";

/** "master", "opening", "events_section", or "event:<event id>". */
export type MusicSlot = string;

export async function getMusicUploadSignature() {
  await requireAdmin();
  return signMusicUpload();
}

function readSlot(music: MusicSettings, slot: MusicSlot): Song | null {
  if (slot === "master") return music.master;
  if (slot === "opening") return music.opening;
  if (slot === "events_section") return music.events_section;
  return music.events[slot.slice("event:".length)] ?? null;
}

function writeSlot(music: MusicSettings, slot: MusicSlot, song: Song | null): MusicSettings {
  if (slot === "master") return { ...music, master: song };
  if (slot === "opening") return { ...music, opening: song };
  if (slot === "events_section") return { ...music, events_section: song };
  const events = { ...music.events };
  const id = slot.slice("event:".length);
  if (song) events[id] = song;
  else delete events[id];
  return { ...music, events };
}

async function isValidSlot(slot: MusicSlot) {
  if (slot === "master" || slot === "opening" || slot === "events_section") return true;
  if (!slot.startsWith("event:")) return false;
  const { data } = await createAdminSupabase().from("events").select("id").eq("id", slot.slice(6)).maybeSingle();
  return Boolean(data);
}

/** Replaces one slot's song, then deletes the old file from Cloudinary. */
async function setSong(slot: MusicSlot, song: Song | null) {
  const music = await getMusic();
  const old = readSlot(music, slot);
  const { error } = await createAdminSupabase()
    .from("site_settings")
    .upsert({ key: "music", value: writeSlot(music, slot, song) });
  if (error) throw error;
  if (old && old.public_id !== song?.public_id) {
    await destroyCloudinaryAudio(old.public_id).catch((e) => console.error("[music] delete failed:", old.public_id, e));
  }
  revalidatePath("/", "layout"); // every page plays the master song
  revalidatePath("/admin/music");
}

/** Called after the browser has uploaded the file to Cloudinary itself. */
export async function saveSong(slot: MusicSlot, url: string, publicId: string, name: string) {
  await requireAdmin();
  if (!(await isValidSlot(slot))) return { ok: false, message: "That event no longer exists." };
  if (!publicId.startsWith(`${MUSIC_FOLDER}/`) || !isOwnCloudinaryUpload(url, publicId, "video")) {
    return { ok: false, message: "That upload couldn't be verified. Please try again." };
  }
  await setSong(slot, { url, public_id: publicId, name: name.trim().slice(0, 120) || "Song" });
  return { ok: true, message: "Saved" };
}

export async function removeSong(formData: FormData) {
  await requireAdmin();
  const slot = String(formData.get("slot") ?? "");
  if (!(await isValidSlot(slot))) return;
  await setSong(slot, null);
}

/** One song for the whole site, or a song for each part. Songs for the other mode stay saved. */
export async function setMusicMode(formData: FormData) {
  await requireAdmin();
  const mode: MusicMode = formData.get("mode") === "single" ? "single" : "sections";
  const music = await getMusic();
  const { error } = await createAdminSupabase()
    .from("site_settings")
    .upsert({ key: "music", value: { ...music, mode } });
  if (error) throw error;
  revalidatePath("/", "layout");
  revalidatePath("/admin/music");
}
