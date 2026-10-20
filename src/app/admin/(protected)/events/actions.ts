"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { toIstTimestamp } from "@/lib/ist-datetime";
import { scheduleKnowledgeBaseSync } from "@/lib/knowledge-base";

function eventFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    event_date: toIstTimestamp(String(formData.get("event_date") ?? "")),
    time_label: String(formData.get("time_label") ?? "").trim() || null,
    event_end: null, // replaced by time_label; cleared so an old end can't linger unseen in calendar invites
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
