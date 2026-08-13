import { supabase } from "@/lib/supabase";
import { showImage, hideImage, deleteImage } from "./actions";

export default async function AdminGalleryPage() {
  const { data: images } = await supabase
    .from("gallery_images")
    .select("id, cloudinary_public_id, cloudinary_url, caption, uploaded_by, approved, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Gallery</h1>
      <p className="mt-1 text-zinc-600">
        Guest uploads go live immediately. Hide or delete a photo here if needed.
      </p>

      {!images?.length && <p className="mt-6 text-sm text-zinc-500">No photos yet.</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images?.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border border-black/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs */}
            <img
              src={img.cloudinary_url}
              alt={img.caption ?? ""}
              className={`aspect-square w-full object-cover ${img.approved ? "" : "opacity-40"}`}
            />
            <div className="p-2 text-xs text-zinc-500">
              {img.uploaded_by || "Anonymous"} {!img.approved && <span className="text-red-600">(hidden)</span>}
            </div>
            <div className="flex gap-1 p-2 pt-0">
              {img.approved ? (
                <form action={hideImage}>
                  <input type="hidden" name="id" value={img.id} />
                  <button type="submit" className="rounded-md border border-black/20 px-2 py-1 text-xs font-medium text-zinc-600">Hide</button>
                </form>
              ) : (
                <form action={showImage}>
                  <input type="hidden" name="id" value={img.id} />
                  <button type="submit" className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white">Show</button>
                </form>
              )}
              <form action={deleteImage}>
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="public_id" value={img.cloudinary_public_id} />
                <button type="submit" className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
