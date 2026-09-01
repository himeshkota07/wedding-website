import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import ChatWidget from "@/components/ChatWidget";

export default async function FaqSection() {
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .order("sort_order", { ascending: true });

  return (
    <PageSection id="faq" title="FAQ & Chat" subtitle="Answers guests need, on demand">
      {!faqs?.length && <p>FAQs will be added soon.</p>}
      <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white shadow-sm">
        {faqs?.map((faq) => (
          <details key={faq.id} className="group p-4">
            <summary className="cursor-pointer list-none font-medium text-zinc-900 marker:content-none">
              {faq.question}
            </summary>
            <p className="mt-2 text-zinc-600">{faq.answer}</p>
          </details>
        ))}
      </div>
      <ChatWidget />
      <p className="text-xs text-zinc-400">
        Tap 🎤 to ask by voice, or 🔊 on any reply to hear it read aloud.
      </p>
    </PageSection>
  );
}
