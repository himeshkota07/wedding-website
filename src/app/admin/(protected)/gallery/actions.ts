"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { destroyCloudinaryImage } from "@/lib/cloudinary";

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

function selectedIds(formData: FormData) {
  return formData.getAll("ids").map(String);
}

export async function showSelected(formData: FormData) {
  await requireAdmin();
  const ids = selectedIds(formData);
  if (ids.length === 0) return;
  const admin = createAdminSupabase();
  await admin.from("gallery_images").update({ approved: true }).in("id", ids);
  revalidateGallery();
}

export async function hideSelected(formData: FormData) {
  await requireAdmin();
  const ids = selectedIds(formData);
  if (ids.length === 0) return;
  const admin = createAdminSupabase();
  await admin.from("gallery_images").update({ approved: false }).in("id", ids);
  revalidateGallery();
}

export async function deleteSelected(formData: FormData) {
  await requireAdmin();
  const ids = selectedIds(formData);
  if (ids.length === 0) return;

  const admin = createAdminSupabase();
  const { data: rows } = await admin.from("gallery_images").select("id, cloudinary_public_id").in("id", ids);
  await admin.from("gallery_images").delete().in("id", ids);
  await Promise.all((rows ?? []).map((r) => destroyCloudinaryImage(r.cloudinary_public_id)));
  revalidateGallery();
}
