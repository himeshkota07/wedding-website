import PageSection from "@/components/PageSection";
import { getOurStory } from "@/lib/site-settings";

export default async function OurStorySection() {
  const story = await getOurStory();
  // Admin textareas submit Windows line breaks (\r\n), so split on blank lines of either kind.
  const paragraphs = story.content
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  // A short last line ("Tarunya & Ashish", "With love…") is a sign-off: set it in the names' calligraphy.
  const signOff = paragraphs.length > 1 && paragraphs[paragraphs.length - 1].length <= 40 ? paragraphs.pop() : null;

  return (
    <PageSection id="our-story" title="Our Story">
      {paragraphs.length > 0 ? (
        <div className="max-w-[65ch] space-y-5 text-lg">
          {paragraphs.map((p, i) =>
            i === 0 ? (
              <p key={i} className="text-2xl italic leading-snug text-ink">
                {p}
              </p>
            ) : (
              <p key={i} className="whitespace-pre-line text-ink-soft">
                {p}
              </p>
            ),
          )}
          {signOff && <p className="pt-2 font-script text-5xl font-bold leading-tight text-kumkum">{signOff}</p>}
        </div>
      ) : (
        <p className="max-w-[60ch] text-lg text-ink-soft">
          Our story is still being written down. Check back soon.
        </p>
      )}
    </PageSection>
  );
}
