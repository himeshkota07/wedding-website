"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { WISH_LIMITS, type Wish } from "@/lib/wishes";

export type TieWishResult = { ok: true; wish: Wish } | { ok: false; message: string };

/**
 * Public action: any guest can tie a wish, no sign-in. Wishes go live
 * immediately (admins can hide one afterwards from /admin/wishes), so the
 * guards here are lengths, a honeypot field bots fill in and people never
 * see, and ignoring an exact double-submit.
 */
export async function tieWish(formData: FormData): Promise<TieWishResult> {
  if (String(formData.get("website") ?? "") !== "") {
    // Honeypot filled: pretend it worked so the bot learns nothing.
    return { ok: false, message: "Thank you!" };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, WISH_LIMITS.name);
  const relation = String(formData.get("relation") ?? "").trim().slice(0, WISH_LIMITS.relation) || null;
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { ok: false, message: "Please add your name so they know who it's from." };
  if (!message) return { ok: false, message: "Please write your wish." };
  if (message.length > WISH_LIMITS.message) {
    return { ok: false, message: `Please keep your wish under ${WISH_LIMITS.message} characters.` };
  }

  const admin = createAdminSupabase();

  const { data: duplicate } = await admin
    .from("wishes")
    .select("id, name, relation, message, created_at")
    .eq("name", name)
    .eq("message", message)
    .limit(1)
    .maybeSingle();
  if (duplicate) return { ok: true, wish: duplicate };

  const { data, error } = await admin
    .from("wishes")
    .insert({ name, relation, message, approved: true })
    .select("id, name, relation, message, created_at")
    .single();

  if (error || !data) {
    console.error("[wishes] insert failed:", error);
    return { ok: false, message: "Your wish couldn't be tied just now. Please try again in a moment." };
  }

  revalidatePath("/");
  revalidatePath("/admin/wishes");
  return { ok: true, wish: data };
}
