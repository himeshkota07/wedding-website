"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { destroyCloudinaryImage } from "@/lib/cloudinary";

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function approveImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("gallery_images").update({ approved: true }).eq("id", id);
  revalidateGallery();
}

export async function unapproveImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("gallery_images").update({ approved: false }).eq("id", id);
  revalidateGallery();
}

export async function deleteImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const publicId = String(formData.get("public_id"));

  const admin = createAdminSupabase();
  await admin.from("gallery_images").delete().eq("id", id);
  await destroyCloudinaryImage(publicId);
  revalidateGallery();
}
