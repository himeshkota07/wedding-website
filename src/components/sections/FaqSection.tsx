import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import Accordion from "@/components/ui/Accordion";

export default async function FaqSection() {
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .order("sort_order", { ascending: true });

  return (
    <PageSection id="faq" title="FAQ & Chat" subtitle="Answers guests need, on demand">
      {!faqs?.length ? <p>FAQs will be added soon.</p> : <Accordion items={faqs} />}
      <p className="text-xs text-foreground/50">
        Still have a question? Use the &ldquo;Ask us anything&rdquo; chat at the bottom of the screen — you can ask
        by typing or by voice, in English, Telugu, or Kannada.
      </p>
    </PageSection>
  );
}
