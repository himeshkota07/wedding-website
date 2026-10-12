"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

function revalidateWishes() {
  revalidatePath("/");
  revalidatePath("/admin/wishes");
}

function selectedIds(formData: FormData) {
  return formData.getAll("ids").map(String);
}

export async function showSelectedWishes(formData: FormData) {
  await requireAdmin();
  const ids = selectedIds(formData);
  if (ids.length === 0) return;
  await createAdminSupabase().from("wishes").update({ approved: true }).in("id", ids);
  revalidateWishes();
}

export async function hideSelectedWishes(formData: FormData) {
  await requireAdmin();
  const ids = selectedIds(formData);
  if (ids.length === 0) return;
  await createAdminSupabase().from("wishes").update({ approved: false }).in("id", ids);
  revalidateWishes();
}

export async function deleteSelectedWishes(formData: FormData) {
  await requireAdmin();
  const ids = selectedIds(formData);
  if (ids.length === 0) return;
  await createAdminSupabase().from("wishes").delete().in("id", ids);
  revalidateWishes();
}
