"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { isOwnCloudinaryUpload } from "@/lib/cloudinary";
import {
  WISH_COLUMNS,
  LEGACY_WISH_COLUMNS,
  WISH_LIMITS,
  isMissingColumnError,
  isWishColor,
  withWishDefaults,
  type Wish,
} from "@/lib/wishes";

export type TieWishResult = { ok: true; wish: Wish } | { ok: false; message: string };

/**
 * Public action: any guest can tie a wish, no sign-in. Wishes go live
 * immediately (admins can hide one afterwards from /admin/wishes), so the
 * guards here are lengths, a honeypot field bots fill in and people never
 * see, and ignoring an exact double-submit. A photo, if any, was uploaded by
 * the guest's browser straight to Cloudinary; it's accepted only when the URL
 * is in our own Cloudinary account and belongs to the public id sent with it.
 */
export async function tieWish(formData: FormData): Promise<TieWishResult> {
  if (String(formData.get("website") ?? "") !== "") {
    // Honeypot filled: pretend it worked so the bot learns nothing.
    return { ok: false, message: "Thank you!" };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, WISH_LIMITS.name);
  const relation = String(formData.get("relation") ?? "").trim().slice(0, WISH_LIMITS.relation) || null;
  const message = String(formData.get("message") ?? "").trim();
  const colorInput = formData.get("color");
  const color = isWishColor(colorInput) ? colorInput : "haldi";
  const photoUrl = String(formData.get("photo_url") ?? "");
  const photoPublicId = String(formData.get("photo_public_id") ?? "");
  const hasPhoto = photoUrl !== "" && isOwnCloudinaryUpload(photoUrl, photoPublicId);

  if (!name) return { ok: false, message: "Please add your name so they know who it's from." };
  if (!message) return { ok: false, message: "Please write your wish." };
  if (message.length > WISH_LIMITS.message) {
    return { ok: false, message: `Please keep your wish under ${WISH_LIMITS.message} characters.` };
  }
  if (photoUrl && !hasPhoto) return { ok: false, message: "That photo couldn't be attached. Please try another." };

  const admin = createAdminSupabase();

  const findDuplicate = (columns: string) =>
    admin.from("wishes").select(columns).eq("name", name).eq("message", message).limit(1).maybeSingle();
  let duplicate = await findDuplicate(WISH_COLUMNS);
  if (isMissingColumnError(duplicate.error)) duplicate = await findDuplicate(LEGACY_WISH_COLUMNS);
  if (duplicate.data) return { ok: true, wish: withWishDefaults(duplicate.data as unknown as Wish) };

  const base = { name, relation, message, approved: true };
  let inserted = await admin
    .from("wishes")
    .insert({ ...base, color, photo_url: hasPhoto ? photoUrl : null, photo_public_id: hasPhoto ? photoPublicId : null })
    .select(WISH_COLUMNS)
    .single();
  if (isMissingColumnError(inserted.error)) {
    // Migration 0007 not run yet: keep the wish, drop the colour/photo.
    console.warn("[wishes] colour/photo columns missing; run supabase/migrations/0007_wish_tags.sql");
    inserted = await admin.from("wishes").insert(base).select(LEGACY_WISH_COLUMNS).single();
  }

  if (inserted.error || !inserted.data) {
    console.error("[wishes] insert failed:", inserted.error);
    return { ok: false, message: "Your wish couldn't be tied just now. Please try again in a moment." };
  }

  revalidatePath("/");
  revalidatePath("/admin/wishes");
  return { ok: true, wish: withWishDefaults(inserted.data as unknown as Wish) };
}
