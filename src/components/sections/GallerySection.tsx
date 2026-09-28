import PageSection from "@/components/PageSection";
import GalleryUpload from "@/components/GalleryUpload";
import GalleryGrid from "@/components/sections/GalleryGrid";
import { supabase } from "@/lib/supabase";

export default async function GallerySection() {
  const { data: images } = await supabase
    .from("gallery_images")
    .select("id, cloudinary_url, caption, uploaded_by")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  return (
    <PageSection id="gallery" title="Gallery" subtitle="Photos from before, during and after. Add yours too.">
      <GalleryUpload />

      <div className="mt-12">
        {!images?.length ? (
          <p className="max-w-[60ch] text-lg text-ink-soft">
            No photos yet. Be the first to add one above.
          </p>
        ) : (
          <GalleryGrid images={images} />
        )}
      </div>
    </PageSection>
  );
}
