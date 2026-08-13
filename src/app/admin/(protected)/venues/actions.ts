"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

function venueFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    parking_info: String(formData.get("parking_info") ?? "").trim() || null,
    accessibility_info: String(formData.get("accessibility_info") ?? "").trim() || null,
    nearby_landmarks: String(formData.get("nearby_landmarks") ?? "").trim() || null,
  };
}

function revalidateVenues() {
  revalidatePath("/venue");
  revalidatePath("/admin/venues");
  revalidatePath("/admin/events");
}

export async function createVenue(formData: FormData) {
  await requireAdmin();
  const admin = createAdminSupabase();
  await admin.from("venues").insert(venueFields(formData));
  revalidateVenues();
}

export async function updateVenue(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("venues").update(venueFields(formData)).eq("id", id);
  revalidateVenues();
}

export async function deleteVenue(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminSupabase();
  await admin.from("venues").delete().eq("id", id);
  revalidateVenues();
}
