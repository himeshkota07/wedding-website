import { supabase } from "@/lib/supabase";
import { approveImage, unapproveImage, deleteImage } from "./actions";

export default async function AdminGalleryPage() {
  const { data: images } = await supabase
    .from("gallery_images")
    .select("id, cloudinary_public_id, cloudinary_url, caption, uploaded_by, approved, created_at")
    .order("approved", { ascending: true })
    .order("created_at", { ascending: false });

  const pending = images?.filter((i) => !i.approved) ?? [];
  const approved = images?.filter((i) => i.approved) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Gallery</h1>
      <p className="mt-1 text-zinc-600">Review guest uploads before they go public.</p>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">Pending ({pending.length})</h2>
      {pending.length === 0 && <p className="mt-2 text-sm text-zinc-500">Nothing waiting for review.</p>}
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {pending.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border border-black/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs */}
            <img src={img.cloudinary_url} alt={img.caption ?? ""} className="aspect-square w-full object-cover" />
            <div className="p-2 text-xs text-zinc-500">{img.uploaded_by || "Anonymous"}</div>
            <div className="flex gap-1 p-2 pt-0">
              <form action={approveImage}>
                <input type="hidden" name="id" value={img.id} />
                <button type="submit" className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white">Approve</button>
              </form>
              <form action={deleteImage}>
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="public_id" value={img.cloudinary_public_id} />
                <button type="submit" className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600">Reject</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Approved ({approved.length})</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {approved.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border border-black/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs */}
            <img src={img.cloudinary_url} alt={img.caption ?? ""} className="aspect-square w-full object-cover" />
            <div className="p-2 text-xs text-zinc-500">{img.uploaded_by || "Anonymous"}</div>
            <div className="flex gap-1 p-2 pt-0">
              <form action={unapproveImage}>
                <input type="hidden" name="id" value={img.id} />
                <button type="submit" className="rounded-md border border-black/20 px-2 py-1 text-xs font-medium text-zinc-600">Unpublish</button>
              </form>
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
