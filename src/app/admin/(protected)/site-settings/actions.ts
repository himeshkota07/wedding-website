"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { toIstTimestamp } from "@/lib/ist-datetime";
import { syncKnowledgeBase } from "@/lib/knowledge-base";
import type { HomeHero, OurStory } from "@/lib/site-settings";

export async function updateHomeHero(formData: FormData) {
  await requireAdmin();
  const weddingDatetimeLocal = String(formData.get("wedding_datetime") ?? "");
  const value: HomeHero = {
    bride_name: String(formData.get("bride_name") ?? "").trim(),
    groom_name: String(formData.get("groom_name") ?? "").trim(),
    wedding_date_label: String(formData.get("wedding_date_label") ?? "").trim(),
    wedding_datetime: weddingDatetimeLocal ? toIstTimestamp(weddingDatetimeLocal) : "",
    location: String(formData.get("location") ?? "").trim(),
    welcome_note: String(formData.get("welcome_note") ?? "").trim(),
    weather_lat: Number(formData.get("weather_lat") ?? 17.385),
    weather_lon: Number(formData.get("weather_lon") ?? 78.4867),
  };

  const admin = createAdminSupabase();
  await admin.from("site_settings").upsert({ key: "home_hero", value });

  revalidatePath("/");
  revalidatePath("/admin/site-settings");
  await syncKnowledgeBase();
}

export async function updateOurStory(formData: FormData) {
  await requireAdmin();
  const value: OurStory = {
    content: String(formData.get("content") ?? "").trim(),
  };

  const admin = createAdminSupabase();
  await admin.from("site_settings").upsert({ key: "our_story", value });

  revalidatePath("/");
  revalidatePath("/admin/site-settings");
  await syncKnowledgeBase();
}
