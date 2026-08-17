import PageSection from "@/components/PageSection";
import { getOurStory } from "@/lib/site-settings";

export default async function OurStorySection() {
  const story = await getOurStory();
  const paragraphs = story.content.split(/\n\n+/).filter(Boolean);

  return (
    <PageSection id="our-story" title="Our Story" subtitle="How we met and got engaged">
      {paragraphs.length > 0 ? (
        paragraphs.map((p, i) => <p key={i}>{p}</p>)
      ) : (
        <p>Our story will be added soon.</p>
      )}
      <p className="text-sm text-zinc-400">[Placeholder — photo timeline / carousel goes here.]</p>
    </PageSection>
  );
}
