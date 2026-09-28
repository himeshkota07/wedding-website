import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import Accordion from "@/components/ui/Accordion";
import OpenChatButton from "@/components/OpenChatButton";

export default async function FaqSection() {
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .order("sort_order", { ascending: true });

  const hasFaqs = !!faqs?.length;

  const ask = (
    <div className={hasFaqs ? "self-start border-t-2 border-turmeric pt-6" : "max-w-2xl"}>
      <h3 className="font-display text-3xl text-paper">{hasFaqs ? "Still have a question?" : "Ask us anything, any time"}</h3>
      <p className="mt-3 text-lg text-paper/90">
        {hasFaqs ? "Ask" : "While we write up the common questions, just ask"} by typing or speaking, in English,
        Telugu or Kannada, and hear the answer read back.
      </p>
      <p className="mt-3 font-display text-2xl text-paper">
        English · <span lang="te">తెలుగు</span> · <span lang="kn">ಕನ್ನಡ</span>
      </p>
      <OpenChatButton className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-paper px-6 font-semibold text-leaf transition-colors hover:bg-turmeric hover:text-teak">
        Ask us anything
      </OpenChatButton>
    </div>
  );

  return (
    <PageSection id="faq" tone="leaf" title="FAQ & Chat" subtitle="Parking, children, food, what to wear: the answers are here.">
      {hasFaqs ? (
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <Accordion items={faqs} />
          {ask}
        </div>
      ) : (
        ask
      )}
    </PageSection>
  );
}
