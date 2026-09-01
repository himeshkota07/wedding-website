"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { syncKnowledgeBase } from "@/lib/knowledge-base";

function contactFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp_link: String(formData.get("whatsapp_link") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

async function revalidateContacts() {
  revalidatePath("/");
  revalidatePath("/admin/contacts");
  await syncKnowledgeBase();
}

export async function createContact(formData: FormData) {
  await requireAdmin();
  const admin = createAdminSupabase();
  await admin.from("contacts").insert(contactFields(formData));
  await revalidateContacts();
}

export async function updateContact(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("contacts").update(contactFields(formData)).eq("id", id);
  await revalidateContacts();
}

export async function deleteContact(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("contacts").delete().eq("id", id);
  await revalidateContacts();
}
