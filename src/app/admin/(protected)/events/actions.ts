"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { toIstEndTimestamp, toIstTimestamp } from "@/lib/ist-datetime";
import { scheduleKnowledgeBaseSync } from "@/lib/knowledge-base";

function eventFields(formData: FormData) {
  const start = String(formData.get("event_date") ?? "");
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    event_date: toIstTimestamp(start),
    event_end: toIstEndTimestamp(start, String(formData.get("event_end") ?? "")),
    venue_id: String(formData.get("venue_id") ?? "") || null,
    special_instructions: String(formData.get("special_instructions") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

async function revalidateEvents() {
  revalidatePath("/", "layout"); // every invitation link's page, not just the plain address
  revalidatePath("/admin/events");
  scheduleKnowledgeBaseSync();
}

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const admin = createAdminSupabase();
  await admin.from("events").insert(eventFields(formData));
  await revalidateEvents();
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("events").update(eventFields(formData)).eq("id", id);
  await revalidateEvents();
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("events").delete().eq("id", id);
  await revalidateEvents();
}
