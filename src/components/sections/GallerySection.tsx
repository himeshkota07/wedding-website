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
    <PageSection id="gallery" title="Gallery" subtitle="Photos before, during, and after">
      <GalleryUpload />

      {!images?.length ? (
        <p>No photos yet — check back soon, or be the first to add one above.</p>
      ) : (
        <GalleryGrid images={images} />
      )}
    </PageSection>
  );
}
