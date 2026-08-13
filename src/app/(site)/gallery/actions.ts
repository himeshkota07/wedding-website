"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/supabase-admin";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const expectedUrlPrefix = `https://res.cloudinary.com/${cloudName}/`;

/**
 * Public action called after a guest's browser uploads directly to Cloudinary
 * (unsigned preset). No admin auth here by design -- any guest can call this
 * -- so it only accepts URLs that actually came from our Cloudinary account
 * (the preset itself pins the destination to the wedding-gallery asset
 * folder), and new rows land unapproved until a moderator reviews them.
 */
export async function recordGalleryUpload(formData: FormData) {
  const publicId = String(formData.get("public_id") ?? "");
  const url = String(formData.get("url") ?? "");
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 200) || null;
  const uploadedBy = String(formData.get("uploaded_by") ?? "").trim().slice(0, 100) || null;

  if (!publicId || !url.startsWith(expectedUrlPrefix)) {
    return { ok: false, message: "Unexpected upload source." };
  }

  const admin = createAdminSupabase();
  await admin.from("gallery_images").insert({
    cloudinary_public_id: publicId,
    cloudinary_url: url,
    caption,
    uploaded_by: uploadedBy,
    approved: false,
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { ok: true, message: "Thanks! Your photo is in for review and will appear once approved." };
}
