import PageSection from "@/components/PageSection";
import { getOurStory } from "@/lib/site-settings";
import Reveal from "@/components/ui/Reveal";

export default async function OurStorySection() {
  const story = await getOurStory();
  const paragraphs = story.content.split(/\n\n+/).filter(Boolean);

  return (
    <PageSection id="our-story" title="Our Story" subtitle="How we met and got engaged">
      {paragraphs.length > 0 ? (
        <Reveal className="space-y-4">
          {paragraphs.map((p, i) =>
            i === 0 ? (
              <p key={i} className="font-display text-lg italic text-ink">
                {p}
              </p>
            ) : (
              <p key={i}>{p}</p>
            ),
          )}
        </Reveal>
      ) : (
        <p>Our story will be added soon.</p>
      )}
    </PageSection>
  );
}
