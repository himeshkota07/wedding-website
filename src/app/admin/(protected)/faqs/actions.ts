"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

function faqFields(formData: FormData) {
  return {
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

function revalidateFaqs() {
  revalidatePath("/");
  revalidatePath("/admin/faqs");
}

export async function createFaq(formData: FormData) {
  await requireAdmin();
  const admin = createAdminSupabase();
  await admin.from("faqs").insert(faqFields(formData));
  revalidateFaqs();
}

export async function updateFaq(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("faqs").update(faqFields(formData)).eq("id", id);
  revalidateFaqs();
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("faqs").delete().eq("id", id);
  revalidateFaqs();
}
