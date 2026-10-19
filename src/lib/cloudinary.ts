import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * True when `url` is the delivery URL of `publicId` itself in our own
 * Cloudinary account (https://res.cloudinary.com/<cloud>/image/upload/[v123/]<publicId>.<ext>).
 * Guests' browsers upload straight to Cloudinary and then send us both
 * values; checking that they belong together stops a crafted request from
 * pairing a real photo with some other asset's public id, which an admin
 * delete would then destroy.
 */
export function isOwnCloudinaryUpload(url: string, publicId: string, resourceType: "image" | "video" = "image") {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud || !/^[\w\-/]+$/.test(publicId) || publicId.includes("..")) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return false;
  const prefix = `/${cloud}/${resourceType}/upload/`;
  if (!parsed.pathname.startsWith(prefix)) return false;
  const rest = decodeURIComponent(parsed.pathname.slice(prefix.length)).replace(/^v\d+\//, "");
  return rest.startsWith(`${publicId}.`) && /^[a-z0-9]+$/i.test(rest.slice(publicId.length + 1));
}

export async function destroyCloudinaryImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

/** Cloudinary keeps audio under its "video" resource type. */
export async function destroyCloudinaryAudio(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
}

export const MUSIC_FOLDER = "wedding-music";

/**
 * What an admin's browser needs to upload a song straight to Cloudinary.
 * Songs are too big to pass through a server action, and signing (rather than
 * the guests' unsigned preset) keeps audio uploads admin-only.
 */
export function signMusicUpload() {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: MUSIC_FOLDER },
    process.env.CLOUDINARY_API_SECRET ?? "",
  );
  return {
    timestamp,
    signature,
    folder: MUSIC_FOLDER,
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  };
}
