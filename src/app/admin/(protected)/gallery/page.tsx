import { createAdminSupabase } from "@/lib/supabase-admin";
import { showSelected, hideSelected, deleteSelected } from "./actions";
import { SelectAllCheckbox } from "./SelectAllCheckbox";

export default async function AdminGalleryPage() {
  // Uses the service-role client, not the public one: gallery_images' RLS
  // policy only allows reading approved=true rows, which would otherwise
  // make hidden photos disappear from this page too, not just the guest one.
  const admin = createAdminSupabase();
  const { data: images } = await admin
    .from("gallery_images")
    .select("id, cloudinary_public_id, cloudinary_url, caption, uploaded_by, approved, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Gallery</h1>
      <p className="mt-1 text-zinc-600">
        Guest uploads go live immediately. Select photos to hide, show, or delete them.
      </p>

      {!images?.length ? (
        <p className="mt-6 text-sm text-zinc-500">No photos yet.</p>
      ) : (
        <form action={hideSelected}>
          <div className="sticky top-0 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm">
            <SelectAllCheckbox />
            <button type="submit" formAction={hideSelected} className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium text-zinc-600">
              Hide selected
            </button>
            <button type="submit" formAction={showSelected} className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">
              Show selected
            </button>
            <button type="submit" formAction={deleteSelected} className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600">
              Delete selected
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="relative overflow-hidden rounded-lg border border-black/10 bg-white">
                <input
                  type="checkbox"
                  name="ids"
                  value={img.id}
                  className="absolute left-2 top-2 z-10 h-5 w-5 accent-[var(--color-accent)]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs */}
                <img
                  src={img.cloudinary_url}
                  alt={img.caption ?? ""}
                  className={`aspect-square w-full object-cover ${img.approved ? "" : "opacity-40"}`}
                />
                <div className="p-2 text-xs text-zinc-500">
                  {img.uploaded_by || "Anonymous"} {!img.approved && <span className="text-red-600">(hidden)</span>}
                </div>
              </div>
            ))}
          </div>
        </form>
      )}
    </div>
  );
}
