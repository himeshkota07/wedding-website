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
export function isOwnCloudinaryUpload(url: string, publicId: string) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud || !/^[\w\-/]+$/.test(publicId) || publicId.includes("..")) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return false;
  const prefix = `/${cloud}/image/upload/`;
  if (!parsed.pathname.startsWith(prefix)) return false;
  const rest = decodeURIComponent(parsed.pathname.slice(prefix.length)).replace(/^v\d+\//, "");
  return rest.startsWith(`${publicId}.`) && /^[a-z0-9]+$/i.test(rest.slice(publicId.length + 1));
}

export async function destroyCloudinaryImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}
