"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { isOwnCloudinaryUpload } from "@/lib/cloudinary";

/**
 * Public action called after a guest's browser uploads directly to Cloudinary
 * (unsigned preset). No admin auth here by design -- any guest can call this
 * -- so it only accepts a URL from our own Cloudinary account that belongs to
 * the public id sent with it (the preset itself pins the destination to the
 * wedding-gallery asset folder). Without that pairing check, a crafted
 * request could store another asset's public id, which deleting the photo
 * from /admin/gallery would then destroy. Photos go live immediately; admins can hide one afterwards from
 * /admin/gallery if needed, but there's no pre-publish approval gate.
 */
export async function recordGalleryUpload(formData: FormData) {
  const publicId = String(formData.get("public_id") ?? "");
  const url = String(formData.get("url") ?? "");
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 200) || null;
  const uploadedBy = String(formData.get("uploaded_by") ?? "").trim().slice(0, 100) || null;

  if (!isOwnCloudinaryUpload(url, publicId)) {
    return { ok: false, message: "Unexpected upload source." };
  }

  const admin = createAdminSupabase();
  await admin.from("gallery_images").insert({
    cloudinary_public_id: publicId,
    cloudinary_url: url,
    caption,
    uploaded_by: uploadedBy,
    approved: true,
  });

  revalidatePath("/", "layout"); // every invitation link's page, not just the plain address
  revalidatePath("/admin/gallery");
  return { ok: true, message: "Thanks! Your photo is now live in the gallery." };
}
