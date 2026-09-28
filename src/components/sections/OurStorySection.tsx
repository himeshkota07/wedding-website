import PageSection from "@/components/PageSection";
import { getOurStory } from "@/lib/site-settings";

export default async function OurStorySection() {
  const story = await getOurStory();
  const paragraphs = story.content.split(/\n\n+/).filter(Boolean);

  return (
    <PageSection id="our-story" title="Our Story" subtitle="How we met, and how two families became one.">
      {paragraphs.length > 0 ? (
        <div className="max-w-[65ch] space-y-5 text-lg">
          {paragraphs.map((p, i) =>
            i === 0 ? (
              <p key={i} className="font-display text-2xl leading-snug text-ink">
                {p}
              </p>
            ) : (
              <p key={i} className="text-ink-soft">
                {p}
              </p>
            ),
          )}
        </div>
      ) : (
        <p className="max-w-[60ch] text-lg text-ink-soft">
          Our story is still being written down. Check back soon.
        </p>
      )}
    </PageSection>
  );
}
