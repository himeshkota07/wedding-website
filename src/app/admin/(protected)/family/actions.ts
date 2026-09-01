"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { syncKnowledgeBase } from "@/lib/knowledge-base";

function memberFields(formData: FormData) {
  return {
    side: String(formData.get("side") ?? "bride"),
    role: String(formData.get("role") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

async function revalidateFamily() {
  revalidatePath("/");
  revalidatePath("/admin/family");
  await syncKnowledgeBase();
}

export async function createFamilyMember(formData: FormData) {
  await requireAdmin();
  const admin = createAdminSupabase();
  await admin.from("family_members").insert(memberFields(formData));
  await revalidateFamily();
}

export async function updateFamilyMember(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("family_members").update(memberFields(formData)).eq("id", id);
  await revalidateFamily();
}

export async function deleteFamilyMember(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("family_members").delete().eq("id", id);
  await revalidateFamily();
}
