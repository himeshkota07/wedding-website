import PageSection from "@/components/PageSection";
import GalleryUpload from "@/components/GalleryUpload";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function GalleryPage() {
  const { data: images } = await supabase
    .from("gallery_images")
    .select("id, cloudinary_url, caption, uploaded_by")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  return (
    <PageSection title="Gallery" subtitle="Photos before, during, and after">
      <GalleryUpload />

      {!images?.length ? (
        <p>No photos yet — check back soon, or be the first to add one above.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-lg border border-black/10 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs, no next/image domain config needed */}
              <img src={img.cloudinary_url} alt={img.caption ?? "Wedding photo"} className="aspect-square w-full object-cover" />
              {(img.caption || img.uploaded_by) && (
                <figcaption className="p-2 text-xs text-zinc-500">
                  {img.caption} {img.uploaded_by && `— ${img.uploaded_by}`}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </PageSection>
  );
}
