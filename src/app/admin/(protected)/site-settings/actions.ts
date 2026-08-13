"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import type { HomeHero, OurStory } from "@/lib/site-settings";

export async function updateHomeHero(formData: FormData) {
  await requireAdmin();
  const value: HomeHero = {
    bride_name: String(formData.get("bride_name") ?? "").trim(),
    groom_name: String(formData.get("groom_name") ?? "").trim(),
    wedding_date_label: String(formData.get("wedding_date_label") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    welcome_note: String(formData.get("welcome_note") ?? "").trim(),
  };

  const admin = createAdminSupabase();
  await admin.from("site_settings").upsert({ key: "home_hero", value });

  revalidatePath("/");
  revalidatePath("/admin/site-settings");
}

export async function updateOurStory(formData: FormData) {
  await requireAdmin();
  const value: OurStory = {
    content: String(formData.get("content") ?? "").trim(),
  };

  const admin = createAdminSupabase();
  await admin.from("site_settings").upsert({ key: "our_story", value });

  revalidatePath("/our-story");
  revalidatePath("/admin/site-settings");
}
