"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { toIstTimestamp } from "@/lib/ist-datetime";

function eventFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    event_date: toIstTimestamp(String(formData.get("event_date") ?? "")),
    venue_id: String(formData.get("venue_id") ?? "") || null,
    theme_color: String(formData.get("theme_color") ?? "").trim() || null,
    special_instructions: String(formData.get("special_instructions") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

function revalidateEvents() {
  revalidatePath("/events");
  revalidatePath("/admin/events");
}

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const admin = createAdminSupabase();
  await admin.from("events").insert(eventFields(formData));
  revalidateEvents();
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("events").update(eventFields(formData)).eq("id", id);
  revalidateEvents();
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("events").delete().eq("id", id);
  revalidateEvents();
}
