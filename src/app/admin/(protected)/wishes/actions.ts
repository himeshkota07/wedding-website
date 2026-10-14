"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import { isMissingColumnError } from "@/lib/wishes";

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
  const admin = createAdminSupabase();
  // Photos live in Cloudinary, not the table, so they're removed separately.
  // (Before migration 0007 there's no photo column and nothing to remove.)
  const { data: rows, error } = await admin.from("wishes").select("photo_public_id").in("id", ids);
  if (error && !isMissingColumnError(error)) console.error("[wishes] photo lookup failed:", error.message);
  await admin.from("wishes").delete().in("id", ids);
  const photoIds = (rows ?? []).map((r) => r.photo_public_id as string | null).filter((id): id is string => !!id);
  await Promise.all(
    photoIds.map((id) => destroyCloudinaryImage(id).catch((e) => console.error("[wishes] photo delete failed:", id, e))),
  );
  revalidateWishes();
}
