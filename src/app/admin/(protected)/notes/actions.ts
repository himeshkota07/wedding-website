"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

function noteFields(formData: FormData) {
  return {
    content: String(formData.get("content") ?? "").trim().slice(0, 2000),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

function revalidateNotes() {
  revalidatePath("/admin/notes");
  revalidatePath("/admin/links");
}

export async function createNote(formData: FormData) {
  await requireAdmin();
  const fields = noteFields(formData);
  if (!fields.content) return;
  await createAdminSupabase().from("chatbot_notes").insert(fields);
  revalidateNotes();
}

export async function updateNote(formData: FormData) {
  await requireAdmin();
  const fields = noteFields(formData);
  if (!fields.content) return;
  await createAdminSupabase().from("chatbot_notes").update(fields).eq("id", String(formData.get("id")));
  revalidateNotes();
}

export async function deleteNote(formData: FormData) {
  await requireAdmin();
  await createAdminSupabase().from("chatbot_notes").delete().eq("id", String(formData.get("id")));
  revalidateNotes();
}
